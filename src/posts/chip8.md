---
title: Emulating the Chip8
description: A lengthy post reviewing the ins and outs of Chip-8 and a python based emulator written for it
author: Adam
date: 2018-07-27
tags:
  - python
---
[Tortilla8](https://github.com/aanunez/tortilla8) was a project I started to learn about game emulation that quickly grew into "lets write every tool I can think of for the Chip8". The result is an assembler, disassembler, pre-processor, lexer,  emulator core, and two GUIs, one intended for debugging and the other for the non-existent end-users that want to play Chip8 games. Below I've outline what I think are the major areas to tackle when writing a Chip8 emulator and how they are addressed by Guacamole, the emulation core of Tortilla8. I still occasionally make improvements to the project, just recently I improved the efficiency of the draw instruction in the emulation core while thinking about writing this post, but for the most part development has stopped.

## Basic Operation

The operation of Guacamole is fairly strait forward. After initialization, the whole of ROM is loaded into the emulated RAM. Each op code is a constant size, so data is read in discrete chunks, the instruction disassembled into a data structure that can be passed around the emulator, the instruction is executed, the program counter is incremented, and the process continues. Many emulators, for the sack of efficiency and speed, to not bother with disassembly, but with a system as simple as Chip8 I saw no reason to not place clarity over efficiency.

Guacamole has two major methods of operation: "run" and "tick". In "run" mode the run method of Guacamole should be called as often as possible. The emulator was initialized with a target CPU and timer frequency, the run method will make sure that the CPU is only ticked when appropriate and that the timers are only decremented when appropriate. In "tick" mode the target frequency of the CPU is ignored and CPU processes an instruction every time the method is called. The timer registers must be decremented manually.

## Registers

The Chip8 has 15 "normal" 8 bit registers named 0x0 to 0xE (or commonly V0 to VE). The 16th register, 0xF, is used as the flag register and is set to exactly 1 or 0 to indicate a carry, not-borrow, underflow, overflow, or collision by various instructions. In addition to these 16 registers there are 2 counter registers, the delay timer and sound timer, and one register used to store memory addresses, the index register. Both the delay and timer registers run at a (recommended) constant 60 Hz independent of the cpu clock, but this varies by implementation, and decrement with every tick until they reach zero. This allows the delay timer to monitor real-world time while the sound timer emits a tone while at a non-zero value. The sound timer is the only method available to the Chip8 to generate sound; the register has no prescribed frequency or wave-form, but a 440 Hz square wave is common.

Guacamole uses a list to access V0 through VF as all op codes refer to registers by their "name" (i.e. a nibble with value 0x0 to 0xF). Values are then stored as Integers, but are checked by the instruction beforehand to insure that values greater than 0xFF are never stored. We make sure that VF is never written to by checking against a list of banned op codes that make a modification to VF (add, shr, shl, rnd, and ld). The timer registers do little, they are only decremented at their correct intervals.

## Stack

No stack is explicitly called for in the oldest documents for the Chip8, but one is needed in order to return from sub-routines. It is likely that on the earliest implementations of the Chip8 VM had the stack in memory space, but this is not needed as access to the stack is never defined. A stack size is never defined, but 12 and 16 are both common and should be more than enough.

Guacamole implements the stack as a list of size 12. Only the call and ret instructions touch the stack.

## Memory Space

The Chip8 has 4096 Bytes of RAM. The default font is loaded starting at address 0x050 and ending at 0x09B for a total of 16 characters (the hex numbers 0 to F) each 5 bytes in size. Roms are loaded at address 0x200 and can be up to 3232 Bytes in size, although roms larger than 2kB are rather rare. The screen buffer is stored at 0xF00 and continues to the end of memory 0xFFF. Specifics on screen resolution are discussed below in the Drawing section.

Guacamole handles the RAM as a list of static size. The ROM is byte-for-byte copies in to simplify operation along with the font and screen buffer. The stack can also be emulated in RAM by modifying a constant, but this is not necessary. It should be noted that none of this is really necessary and a good deal of space could be saved by not bothering to copy any of this data to a new array. Fonts and the ROM itself to be read as necessary and only the screen buffer stored.

## Keypad Input

The Chip8 has a total of 16 keys labeled 0x0 through 0xF with arrangement varying. There are three instructions that deal with input, skp, sknp, and a special load instruction that is discussed below. The Chip8 does not call for storing most keypresses, only checking to see if a particular key is pressed.

Guacamole stores keypress is a boolean list that is exposed to whatever GUI that implements the core. This making the skp and sknp instructions trivial to implement and input easy to record for the GUI.

## Loading A Keypress

While not a difficult thing to implement, the "ld VX, k" instructions is probably one of the most awkward. The instruction waits for a key to be pressed and once it has it loads the keypress into register VX. This is unique in that the instruction halts the operation of the CPU until action is taken by the end user.

Guacamole handles this by implementing the instruction as simply the setting the flag that is then handled at the upper most level of the emulator. With the flag set, every call to the cpu tick method checks for user input and until it is found does not allow the CPU to continue operation.

## Drawing

The draw instruction is, by far, the most complex and interesting instruction the Chip8 has to offer. The Chip8 screen is 64 pixels (8 Bytes) wide by 32 pixels tall and is addressed from top left to bottom right. The screen has only two colors, referred to as "on" and "off". The drw instruction (drw VX, VY, N)is the only one to have 3 arguments and implicitly uses the index register as well. The instruction draws the N byte tall, 1 byte wide sprite pointed to by the Index register to X-Y coordinate VX-VY on the screen. The coordinate refers to the upper left corner of the sprite. The sprite is drawn by flipping the color on the screen if the pixel to be drawn to that location is "on", otherwise, the pixel is left alone. If any pixel is flipped from the "on" color to the "off" color then it is said that a collision has occurred and VF is set high. The drw instructions set VF to low only once when it is initially called, so if ANY pixel is changed from "on" to "off" then the instruction should finish with VF high.

The draw instruction can be difficult to implement as it is hard to envision the xor logic, wrapping, and collision checking in your head. It is important to note that because the size of a sprite is always 1 byte and the X-Y coordinates are pixel accurate that we will most likely need to modify two bytes on every draw. Originally, Guacaole implemented the draw instruction by parsing each byte to a string, shifting the sprite to align it with the first byte, applying xor logic, and then storing the result. This required a for loop of static size 2, LOTS of parsing between integer and string, and just generally messy code. I initially went down the path because I thought the code would be easier to read. How wrong I was. I much easier approach is to grab both bytes, bit shift the upper byte and add it to the lower, bit shift the sprite so it is "in place" and then apply xor logic. No parsing is needed and while the code is still difficult to decipher, it is simpler, faster, and slightly easier to read.

## Undocumented "Features"

* The "add I, VX" instruction has the potential to overflow the index register. The instruction may set (depending on implementation) the VF register high, but the instruction never sets VF low. This feature is known to be used by Spacefight 2019.

* Although never explicitly stated, many games assume that RAM and register values will be initialized to zero.

* The two shift instructions have two different interpretations. Either "shx VX" (the most popular form) or "shx VX, VY", which calls for VY to be shifted and then stored to VX. The latter interpretation of the instruction comes from the structure of the op code. The confusion is clear when the instruction is examined as the hex value: "8XYE", here we see that, although the first form is more popular, it implies that the instructions "812E" and "815E" are functionally identical.


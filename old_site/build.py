#!/usr/bin/env python3

import os
import shutil
import functools

MAIN = 'index.html'
BUILD_FILE = 'build.html'
POSTS_DIR = 'posts'
TEMPLATE = 'template.html'
FLAG = '#CONTENT'

print('Checking for pandoc.')
if os.system('pandoc isPandocInstalled') != 256:
    print('Please insatll pandoc')
    raise SystemExit

print('Removing old stuff.')
try: os.remove(MAIN)
except: pass
try: os.remove(BUILD_FILE)
except: pass

print('Making the new stuff.')
mdlist = next(os.walk(POSTS_DIR))[2]
list.sort(mdlist, reverse=True)
mdlist = ' posts/'.join(mdlist)

os.system('pandoc -f markdown ' + 'posts/' + mdlist + ' > ' + BUILD_FILE)
shutil.copy(TEMPLATE, MAIN)

with open(MAIN, 'r+') as indexfh:
    while not indexfh.readline().lstrip().startswith(FLAG):
        continue
    pos = indexfh.tell()-len(FLAG)-1
    index_footer = indexfh.read()
    indexfh.seek(pos)
    with open(BUILD_FILE, 'r') as buildfh:
        for line in buildfh:

            # Find the titles and adjust the size of the date.
            if line.startswith('<h2') and (line.find('|') != -1):
                work = line.split('|')
                date = '<span class="date">' + work[1].split('<')[0] + '</span></h2>'
                indexfh.write(work[0] + date)
            else:
                indexfh.write(line)

    indexfh.write(index_footer)

print('Cleaning up')
try: os.remove(BUILD_FILE)
except: pass

print('Done')

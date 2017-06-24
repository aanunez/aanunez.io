## Sample Blog Post
2017 23 6

A quick summary on the below

  1. One
  2. Two
  3. Three
 * Unordered lists, and:
 * Super bullets

> The working class and the employing class have nothing in common. There can be no peace so long as hunger and want are found among millions of the working people and the few, who make up the employing class, have all the good things of life.

And **bold**, *italics*, and even *italics and later **bold***. Even ~~strikethrough~~. [A link](https://markdowntohtml.com) to somewhere.
And code highlighting:
```python
with open(MAIN, 'r+') as indexfh:
    for line in iter(functools.partial(indexfh.readline), FLAG):
        if line.lstrip().startswith(FLAG):
            break
        continue
    pos = indexfh.tell()
    index_footer = indexfh.read()
    indexfh.seek(pos)
    with open(BUILD_FILE, 'r') as buildfh:
        indexfh.write(buildfh.read())
    indexfh.write(index_footer)
```
Or inline code like `var foo = 'bar';`.

Or some bears...
![](http://placebear.com/650/300)

Last Line of the post!


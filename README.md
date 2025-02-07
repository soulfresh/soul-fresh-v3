### Upgrade Required

It's no longer possible to build this on modern MacOS. I've included the built
product in `dist`. This project will need to be upgraded or migrated to
something more modern.

Originally, this project used npm for installs and an unknown version of node.
I've added Yarn so as not to change the package-lock. I've also added an .`nvmrc`
file so you can at least use `yarn serve dist`.

### Creating videos

- Screen capture at least 960 x 720.
- Generate the small version by resizing to 640 x 480.

### Video Export

Chrome & Firefox
- Convert .mov files to .webm using Miro video converter.

Safari
- Convert .mov files to .mp4 using Compressor export to H.264 with AAC audio.

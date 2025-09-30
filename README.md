## Soul Fresh Website

The app uses the following libraries:

 - Yarn 4
 - [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
 - Firebase
 - SCSS

## Getting Started

```bash
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

### Creating videos

- Screen capture at least 960 x 720 using Quicktime
  - Make sure the video capture is inside the web page border so the site
    completely fills the video and you don't have any borders.
  - To include audio, I used [Background Music app](https://github.com/kyleneideck/BackgroundMusic)
  - Save the screen capture into the video project `Work/Websites` folder
- In Final Cut Pro, create two empty projects
  - 960 x 720
  - 640 x 480
- Import the screenshot into FPX
  - Add 150% speed up
- Export both projects to Compressor and from compressor export two versions
  - uncompressed .mov
  - .mp4 (H.264 with AAC audio)
- Convert the .mov to .webm using my `mov2webm` alias
  - `ffmpeg -i "$mov" -c:v libvpx-vp9 -pix_fmt yuva420p "${$(basename $mov)}".webm`
- Create a poster frame using Preview
  - Open the .mov in Quicktime
  - Find a nice frame
  - Command + C
  - Open Preview
  - File > New from Clipboard
  - Save to the project `public/poster-frames`
- Upload videos to Google Cloud Storage

### Archiving videos

In Final Cut Pro

- Make sure the project is setup to consolidate files into the Library
  - Click on the SoulFresh Project library in the file navigator
  - Click the "Modify Settings" in the right hand panel
  - Make sure everything is set to "Library"
- Consolidate media by clicking the "Consolidate" buttons on the Library
inspector
- File > Delete Generated Library Files
- Archive the project folder

## Releasing

The site is released automatically by a GitHub action when you merge into
`main`. Opening a PR will create a release branch you can use for testing.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

# Homie Photobooth

A cute photobooth web app: pick a heart frame, snap (or upload) up to 4 photos, decorate with stickers, then download the finished picture.

## What it does

1. **Pick a frame** – choose one of the heart photo frames.
2. **Take photos** – a 3-second countdown triggers the webcam capture. You can retake/remove the last photo, or upload an image from your device.
3. **Decorate** – after 4 photos you enter decorate mode: click a sticker to add it, drag stickers around, select + press `Delete`/`Backspace` to remove.
4. **Download** – saves the composed frame (photos fitted in the slots + stickers) as a PNG.

## Available Scripts

In the project directory, you can run:

### `npm install`

Installs dependencies.

### `npm start`

Runs the app in development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page reloads when you make changes. You may also see any lint errors in the console.

> Note: the webcam requires HTTPS (or `localhost`) and camera permission.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance. The build is minified and the filenames include hashes — your app is ready to be deployed.

## Deploying to Vercel

The repo includes a `vercel.json` with the production build command, output directory, and a single-page-app fallback. Vercel detects Create React App from `react-scripts` in `package.json`.

**Via Git (recommended):**
1. Push this repository to GitHub and import it into Vercel. Keep **Root Directory** set to `./` because the app files are at the repository root.
2. Go to [vercel.com/new](https://vercel.com/new), import the repo.
3. Vercel detects the framework automatically — just click **Deploy**.

**Via the CLI:**
```bash
npm i -g vercel
vercel --prod
```

The site is served over HTTPS, so the webcam works on deployed builds.

## Project structure

```
public/assets/
  frames/     heart frame overlays (1200x3000 design)
  stickers/   draggable sticker images
  fonts/      Cantika Cute Handwriting font
src/
  components/Photobooth.js   main photobooth logic + canvas composition
  App.js                     page shell + header
  styles/global.css          font face + body styles
```

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

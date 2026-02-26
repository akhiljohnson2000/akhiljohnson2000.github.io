# JavaScript Engine Visualizer

Interactive 3D simulation of how a JavaScript engine works internally: **Call Stack**, **Heap**, **Web APIs**, **Callback Queue**, **Microtask Queue**, **Event Loop**, and **Console Output**.

## How to view the JavaScript Engine Visualizer

### Option 1: Run locally (fastest)

From the **repository root** (or from this folder):

```bash
cd javascript-engine-visualizer
npm install
npm run dev
```

Then open **http://localhost:5173** in your browser.

### Option 2: After deploying this repo to GitHub Pages

1. Push your code to the `main` branch. The repo’s **GitHub Actions** workflow will build both the portfolio and the visualizer and deploy to GitHub Pages.
2. In **GitHub → Settings → Pages**, set “Source” to **GitHub Actions** (not “Deploy from a branch”).
3. After the workflow runs, the visualizer will be at:
   - **https://akhiljohnson2000.github.io/javascript-engine-visualizer/**

The portfolio “Personal Projects” link (“Visit” on the JavaScript Engine Visualizer card) points to that URL.

---

## Tech

- **React** + **Vite**
- **Three.js** via `@react-three/fiber` and `@react-three/drei`
- **GSAP** for timeline-based slow-motion animation

## Build

```bash
npm run build
```

Output is in `dist/`.

## Features

- **Run in Slow Motion** – animates the example code execution step-by-step
- **Speed** – slider 0.5x–2x
- **Pause / Resume** – pause and resume the animation
- **Step** – advance one step
- **Reset** – clear and reset
- **Tooltips** – hover over 3D parts for short explanations

## Project structure

- `src/components/` – 3D components (CallStack, Heap, WebAPIs, Queue, EventLoop, ConsoleScreen, EngineScene)
- `src/lib/EngineController.js` – state machine and step order
- `src/App.jsx` – UI panel, controls, GSAP timeline

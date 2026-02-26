# Akhil Johnson – Portfolio (Vue.js)

Portfolio site built with **Vue 3**, **Vite**, **TypeScript**, and **Tailwind CSS**.

## Stack

- **Vue 3** (Composition API, `<script setup>`)
- **Vite** – build tool
- **TypeScript**
- **Tailwind CSS** – styling
- **Radix Vue** – accessible UI primitives (Tabs, Progress, Dropdown)
- **VueUse** – theme (useDark), motion (animations)
- **Lucide Vue** – icons

## Commands

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project structure

- `src/` – Vue app
  - `main.ts` – app entry, Motion plugin
  - `App.vue` – root layout (Navbar, sections, Footer, Toast)
  - `assets/globals.css` – Tailwind and CSS variables
  - `components/` – section components (Hero, Navbar, About, Experience, Projects, Skills, Contact, Footer) and ModeToggle
  - `components/ui/` – reusable UI (Button, Card, Badge, Tabs, Progress, Input, Textarea, Toast)
  - `composables/` – useToast, useTheme
  - `lib/utils.ts` – `cn()` for class names

## Deployment (e.g. GitHub Pages)

Build output is in `dist/`. Configure your host to serve `dist/index.html` and the `dist/assets/` folder. For GitHub Pages, set the publishing source to the branch that contains the built `dist/` (or use a GitHub Action to build and publish from `src/`).

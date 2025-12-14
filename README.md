# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  # DnD-5th-Tools

  Ce dépôt contient une application React + TypeScript construite avec Vite pour visualiser et manipuler des donjons (FOV, brouillard, overlay MJ, etc.).

  Table des matières
  - [Prérequis](#prérequis)
  - [Installation & développement](#installation--développement)
  - [Structure du projet](#structure-du-projet)
  - [Scripts utiles](#scripts-utiles)
  - [CI / Tests](#ci--tests)
  - [Dépannage rapide](#dépannage-rapide)
  - [Contribution](#contribution)

  ---

  ## Prérequis
  - Node.js (>= 18 recommandé)
  - npm ou yarn

  ## Installation & développement
  1. Installer les dépendances :

  ```bash
  npm install
  # ou
  # yarn
  ```

  2. Démarrer le serveur de développement (HMR) :

  ```bash
  npm run dev
  # (par défaut Vite écoute sur http://localhost:5173)
  ```

  3. Compiler pour la production :

  ```bash
  npm run build
  ```

  4. Prévisualiser la build :

  ```bash
  npm run preview
  ```

  5. Linter :

  ```bash
  npm run lint
  ```

  ---

  ## Structure du projet

  Les principaux dossiers/fichiers :

  - `src/` — code source React + TypeScript
    - `main.tsx` — point d'entrée de l'application
    - `App.tsx` — logique d'initialisation (chargement JSON, normalisation)
    - `components/` — composants React principaux
      - `DungeonMap.tsx` — rendu SVG du donjon, tokens, brouillard, overlay MJ
      - `InfoPanel.tsx` — panneau d'information latéral (salle/cellule)
      - `FogLayer.tsx` / `Cell.tsx` — rendu du brouillard et des cellules
    - `model/` — types et helpers (Dungeon, CellState, Bits)
    - `state/` — stores (Zustand) (ex. `fogStore.ts` gère la visibilité)
    - `utils/` — utilitaires, notamment `fov.ts` (algorithme de visibilité)

  - `public/` — assets statiques (SVG, JSON) servis tels quels

  - `tools/verifyDungeon.mjs` — script utilitaire pour valider / normaliser les JSON de donjons (1-based → 0-based, bounds checks)

  Quelques décisions de conception :
  - Le store `useFogStore` gère l'état de visibilité des cellules et déclenche `computeFOV`.
  - Les types sont importés en `import type` pour éviter l'émission d'importations runtime inutiles (problème résolu : suppression des placeholders runtime).
  - Le mode MJ (`isMJ`) active un overlay vectoriel (salles, portes, marques, escaliers) pour vérifier la carte.

  ## Scripts utiles
  - `npm run dev` — développement
  - `npm run build` — build production
  - `npm run preview` — prévisualiser la build
  - `npm run lint` — lint

  ## CI / Tests
  Une action GitHub (`.github/workflows/ci.yml`) exécute `npm ci`, `npm run build` et `npm run lint` sur chaque push et PR vers `main`.

  ## Dépannage rapide
  - Si le donjon ne s'affiche pas : vérifiez que le JSON est accessible (correct URL via `public/assets` ou `new URL(...)`), et que `width`/`height` sont présents ou inférés.
  - Si la FOV montre 0 cellules : vérifiez que les tokens ont des coordonnées numériques (pas `NaN`) et que `computeFOV` est appelé.
  - Pour améliorer la visualisation MJ, activez `isMJ` pour afficher l'overlay vectoriel.

  ## Contribution
  - Ouvrez une branche (ex. `chore/feature-my-change`) et créez une PR vers `main`.
  - CI s'exécutera automatiquement et vérifiera la build.

  Merci ! Si vous avez besoin d'une fonctionnalité additionnelle (tests automatisés, export de format, édition de donjon), dites-moi et je peux l'ajouter.

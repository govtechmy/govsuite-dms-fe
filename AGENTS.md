# AGENTS.md

Instructions for AI coding agents working in this repository.

---

## Project Overview

Malaysian government frontend application — **React 19 + TypeScript + Vite**.

| Concern                         | Solution                                  |
| ------------------------------- | ----------------------------------------- |
| UI components                   | `@govtechmy/myds-react` (subpath imports) |
| Design tokens / Tailwind preset | `@govtechmy/myds-style`                   |
| Routing                         | `react-router-dom` v7                     |
| Internationalisation            | `react-i18next`                           |
| Styling                         | Tailwind CSS via MYDS preset              |
| Linting                         | ESLint + `typescript-eslint`              |
| Formatting                      | Prettier                                  |

---

## Project Structure

```
src/
  assets/               # Static assets
  components/
    layout/             # Shared layout shells (Masthead, Navbar, Footer, LayoutMain)
  locales/
    en/en-GB.json       # English translation keys
    ms/ms-MY.json       # Malay translation keys
  pages/                # Route-level page components
  App.tsx               # BrowserRouter wrapper
  i18n.ts               # i18next initialisation (reads localStorage on boot)
  LangWrapper.tsx       # Validates :lang param, syncs i18n + localStorage
  router.tsx            # Route definitions
  main.tsx              # Entry point
```

---

## Routing

Every route is prefixed with `/:lang` (`en` or `ms`). The hierarchy is:

```
/             → redirects to /:lang (from localStorage or "en")
/:lang        → LangWrapper  (validates lang, updates i18n)
  └─ LayoutMain             (Masthead + Navbar + Footer shell)
       ├─ index             → HomePage
       ├─ about             → AboutPage
       ├─ 404               → ErrorPage
       └─ *                 → redirects to /:lang/404
```

- `LangWrapper` (`src/LangWrapper.tsx`) is the single source of truth for lang validation. **Do not** duplicate its logic elsewhere.
- Language navigation is handled inside `NavbarMyds`. **Do not** add a second language switcher.

---

## Internationalisation (i18n)

- All user-facing strings **must** use `useTranslation()` → `t('key')`.
- Keys live in `src/locales/en/en-GB.json` and `src/locales/ms/ms-MY.json`.
- Both files must be updated together — a key missing from either file is a bug.
- Locale files are flat JSON (`{ "key": "value" }`). Do not nest unless the existing file already nests.

---

## Styling

- Tailwind is configured with the MYDS preset (`tailwind.config.js`). Use MYDS design tokens (e.g. `bg-bg-warning-50`, `text-txt-primary`) instead of raw Tailwind colour classes.
- Do not write custom CSS unless a Tailwind utility genuinely cannot achieve the requirement.
- Do not use inline `style={{}}` props for anything that can be expressed as a class.

---

## Components & MYDS Design System

- Import MYDS components via their **subpath** — e.g. `@govtechmy/myds-react/button`, `@govtechmy/myds-react/navbar`. Do not use a barrel import.
- Always reach for a MYDS component before building a custom one.
- Functional components only; named exports for all components and utilities.
- Default export only at the page level (`src/pages/`) and in `router.tsx` / `App.tsx`.
- File naming: PascalCase for components (`MyComponent.tsx`), camelCase for everything else (`formatDate.ts`).

---

## TypeScript

- No `any` without an explicit, justified comment explaining why.
- Do not add type annotations to code you did not touch.
- Prefer narrow, specific types. Avoid widening types to silence errors.

---

## Dos and Don'ts

### Do

- Read the relevant existing code before making changes.
- Follow the established file and folder structure exactly.
- Add translation keys to **both** locale files for every new string.
- Run `npm run lint` and `npm run format` before finishing.
- Keep each component focused on a single responsibility.

### Don't

- **Do not** install new dependencies without explicit approval.
- **Do not** refactor, rename, or restructure code outside the direct scope of the task.
- **Do not** add comments, docstrings, or type annotations to untouched code.
- **Do not** create utility helpers or abstractions for one-off use.
- **Do not** add unrequested features, states, props, or UI elements.
- **Do not** over-engineer — the simplest correct solution is the right solution.
- **Do not** bypass linting (`--no-verify`) or suppress ESLint rules without justification.
- **Do not** use `any` to silence TypeScript errors.
- **Do not** duplicate language-switching or route-validation logic that already exists.

---

## Commands

| Task             | Command           |
| ---------------- | ----------------- |
| Start dev server | `npm run dev`     |
| Build            | `npm run build`   |
| Lint             | `npm run lint`    |
| Format           | `npm run format`  |
| Preview build    | `npm run preview` |

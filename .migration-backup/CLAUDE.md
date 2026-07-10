# BEXO Web Monorepo Conventions (CLAUDE.md)

Welcome to the BEXO monorepo. This repository contains the frontend applications, rendering engine, NestJS API, and shared workspace packages.

## Directory Structure & Ownership

- `apps/`
  - `web/` - Vite + React 18 + TS + Tailwind CSS. Main customer-facing application. Uses `wouter` for routing (with a 9-step onboarding flow).
  - `marketing/` - Vite + React 18 + TS + Tailwind CSS. Public-facing marketing website.
  - `admin/` - Vite + React 18 + TS + Tailwind CSS. Internal operations control dashboard.
  - `rendering/` - Next.js App Router. Independent server-side and static page generation engine.
  - `api/` - NestJS API backend. Contains modules: `auth`, `profiles`, `parser`, `assets`, `templates`, `activation`, `billing`, `notifications`, `admin`.
- `packages/`
  - `shared/` - Common TypeScript resources, Zod data validation schemas, and the typed API client.
  - `ui/` - Shared component library and global UI design tokens.
  - `config/` - Shared ESLint presets, TypeScript bases, and Tailwind CSS configurations.
- `infra/`
  - Local development Docker-compose (PostgreSQL 16, Redis 7, MinIO).
  - Production Dockerfiles for `api` and `rendering`.

## Build & Development Commands

Always run commands from the root directory using `pnpm`:

- **Install Dependencies**: `pnpm install`
- **Start Dev Servers**: `pnpm dev`
- **Build All Projects**: `pnpm build`
- **Run Type Checks**: `pnpm typecheck`
- **Lint Code**: `pnpm lint`

To target a specific app or package, run:
```bash
pnpm --filter <package-name> <command>
# e.g., pnpm --filter @bexo/web dev
# e.g., pnpm --filter @bexo/api build
```

## Key Technologies & Libraries

- **Monorepo Engine**: Turborepo (`turbo.json`)
- **Package Manager**: pnpm (`pnpm-workspace.yaml`)
- **Routing (Web/Marketing/Admin)**: `wouter`
- **Backend Framework**: NestJS (TypeScript)
- **Data Validation**: `zod`
- **Database / Cache / Storage**: PostgreSQL 16, Redis 7, MinIO (S3-compatible)

## Developer Guidelines
1. **React 18 Constraint**: Ensure React version is kept at `^18.x.x` in Vite-based apps (`web`, `marketing`, `admin`) to maintain compatibility with design tools.
2. **Do Not Mix Package Managers**: Never use `npm` or `yarn` directly; always use `pnpm`.
3. **Shared Config**: Extend `@bexo/config` configs for ESLint, TypeScript, and Tailwind in your project configurations.

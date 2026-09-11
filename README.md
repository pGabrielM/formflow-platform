# Formflow Platform

![CI](https://github.com/pGabrielM/formflow-platform/actions/workflows/ci.yml/badge.svg)
![Next.js](https://img.shields.io/badge/Next.js-13-black?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square)

A marketing site (home/about/contact/portfolio) paired with a blog whose posts are managed from
an authenticated dashboard — a full user journey from public page to signed-in CRUD, not just a
static template.

## Architecture

- **Public pages** (`src/app/{page,about,contact,portfolio,blog}`) are plain Next.js App Router
  routes, statically rendered where they don't need data at request time.
- **`src/app/api/posts`** and **`src/app/api/posts/[id]`**: REST route handlers backing the blog
  — list/create and get/update/delete, talking to MongoDB through Mongoose.
- **Auth** (`src/app/api/auth/[...nextauth]`): NextAuth with a Google OAuth provider and a
  credentials provider (registration via `src/app/api/auth/register`, passwords hashed with
  bcryptjs) protecting `/dashboard`.
- **`src/models`**: Mongoose schemas (`Post`, `User`) — the only place that knows the database
  shape; API routes stay thin.
- **`src/utils/db.ts`**: a single lazy `mongoose.connect()` reused across route handlers (typical
  for Next.js API routes running in a serverless-style runtime).

## Running locally

```bash
cp .env.example .env.local   # MONGO connection string, Google OAuth creds, NEXTAUTH_SECRET
npm install
npm run dev   # http://localhost:3002
```

Requires a MongoDB instance (Atlas or local) reachable at `MONGO`.

## CI

Every push/PR to `main` lints and builds the app via
[GitHub Actions](.github/workflows/ci.yml).

## Stack

Next.js 13 (App Router), TypeScript, MongoDB, Mongoose, NextAuth, react-hook-form, SWR.

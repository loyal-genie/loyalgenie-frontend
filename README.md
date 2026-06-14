# LoyalGenie Frontend

React + Vite + Tailwind CSS application for the LoyalGenie marketing site, auth, onboarding, and vendor admin portal.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- React Router
- TanStack Query
- Axios
- React Hook Form
- Radix UI primitives (shadcn-style components)
- Lucide Icons

## Development

```bash
cd frontend
npm install
cp .env.example .env   # optional — defaults to http://localhost:4000/api
npm run dev            # http://localhost:5173
```

> **Note:** This is a Vite app (`loyalgenie-frontend`). Do not run the old Next.js prototype (`LoyalGenie-Landing-Page/`) when working on this codebase.

Set `VITE_API_URL` in `.env` to point at the backend (default: `http://localhost:4000/api`).

## Routes

| Path | Description |
|------|-------------|
| `/` | Marketing landing page |
| `/signin` | Sign in (Business / Customer toggle) |
| `/signup` | Create account → onboarding |
| `/onboarding` | Business onboarding wizard (protected) |
| `/:slug` | Public café join / standee page |
| `/vendor/dashboard` | Admin dashboard (protected) |
| `/vendor/campaigns` | Campaign management |
| `/vendor/customers` | Customer CRM |
| `/vendor/settings` | Business settings |

Legacy `/business/signin` and `/business/signup` redirect to `/signin` and `/signup`.

## Build

```bash
npm run build
npm run preview
```

## Git

Personal repo — run git commands from this folder:

```bash
git add .
git commit -m "your message"
git push -u origin main
```

Remote: `git@github.com-personal:v-a-dinesh/loyalgenie-frontend.git`

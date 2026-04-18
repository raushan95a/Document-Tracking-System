# DocTrack Frontend

React + Vite frontend for the Document Tracking System.

## Tech Stack

- React (Vite)
- Tailwind CSS
- Axios
- React Router DOM v6
- React Toastify
- React Icons

## Prerequisites

- Node.js 18+
- Backend API running (default: http://localhost:5000)

## Setup

```bash
npm install
```

## Run in Development

```bash
npm run dev
```

Vite starts on a local port (usually http://localhost:5173).

## Build for Production

```bash
npm run build
```

## Preview Production Build

```bash
npm run preview
```

## API Environment Switching (Dev/Prod)

This app reads API base URL from:

- `VITE_API_BASE_URL`

Axios setup is in `src/services/api.js`.

Current logic:

- Uses `import.meta.env.VITE_API_BASE_URL`
- Falls back to `http://localhost:5000/api` when env var is missing

### Development Environment

Use `.env.development`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Production Environment

Use `.env.production`:

```env
VITE_API_BASE_URL=https://your-domain.com/api
```

Replace the production URL with your deployed backend API URL.

## Notes

- Keep the `/api` suffix in `VITE_API_BASE_URL` because frontend requests are written like `/auth/login`, `/documents`, etc.
- If login or document requests fail, confirm backend is running and CORS is enabled on port 5000.

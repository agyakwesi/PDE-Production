# Parfum d'Élite (PDE)

**Parfum d'Élite** ("Fragrance of the Elite") is a full-stack luxury fragrance e-commerce platform. It serves as an exclusive, curated marketplace for niche and premium fragrances, offering dynamic AI-powered pricing, a personal fragrance vault, web scraping for fragrance discovery, and a rich editorial user experience.

Live site → [parfumdelite.tech](https://parfumdelite.tech)

---

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Design System](#design-system)
- [Project Structure](#project-structure)

---

## Project Overview

Parfum d'Élite is built for fragrance enthusiasts who want access to a curated selection of niche and luxury scents. The platform combines:

- A **dropshipping / pre-order model** with slot-based inventory tracking
- **AI-powered pricing intelligence** that dynamically calculates prices based on supplier costs and live forex rates
- A **personal fragrance vault** where users organise their collection by occasion (Day, Night, Office, Rainy Day)
- **Web scraping** to discover and import fragrances from [Fragrantica](https://www.fragrantica.com)
- **Admin tooling** for catalog management and pricing strategy

---

## Architecture

The project is a **monorepo** with two main workspaces:

| Workspace | Technology | Hosted on |
|-----------|-----------|-----------|
| `client/` | React 19 + Vite | Vercel |
| `server/` | Node.js + Express 5 | Heroku |

The frontend communicates with the backend via a REST API. In production, Vercel proxies `/api/*` requests to the Heroku backend.

---

## Tech Stack

### Frontend (`client/`)

| Package | Purpose |
|---------|---------|
| React 19 | UI framework |
| Vite | Build tool + HMR dev server |
| React Router DOM 7 | Client-side routing |
| Framer Motion | Animations |
| GSAP | Advanced scroll/timeline animations |
| Sentry (React) | Error tracking |
| Datadog RUM | Real-user monitoring |

### Backend (`server/`)

| Package | Purpose |
|---------|---------|
| Express 5 | REST API |
| MongoDB + Mongoose | Database |
| OpenAI SDK (NVIDIA NIM) | Primary pricing intelligence LLM |
| Google Generative AI (Gemini 2.0) | Fallback LLM (when NVIDIA NIM is unavailable) |
| Puppeteer + Cheerio | Fragrance web scraping |
| Axios | HTTP client |
| JWT + bcryptjs | Authentication |
| Nodemailer | Transactional emails |
| PDFKit | PDF receipt generation |
| Sentry (Node) | Error tracking + profiling |

---

## Features

- **Authentication** — Email/password registration, email verification flow, JWT sessions, admin roles, founder status
- **Product Catalog** — Niche fragrance listings with scent notes/accords, gender, season, and occasion tags
- **AI-Powered Pricing** — Multi-AI fallback chain (NVIDIA NIM → Google Gemini → Groq) calculates dynamic retail prices from supplier cost + live forex rates; semantic caching reduces API costs
- **Web Scraper** — Bulk fragrance discovery from Fragrantica via Puppeteer
- **Shopping Cart & Orders** — Add-to-cart, checkout flow, PDF receipt generation, email confirmations
- **Personal Vault** — Users maintain a personal fragrance collection organised by occasion
- **Admin Dashboard** — Product CRUD, pricing strategy management, AI-driven pricing analysis
- **Error Tracking** — Sentry on both client and server; Datadog RUM for frontend performance

---

## Getting Started

### Prerequisites

- Node.js ≥ 18.x
- A MongoDB database (local instance or MongoDB Atlas)
- API keys for Google Gemini (required), NVIDIA NIM (optional)
- A Gmail account (or SMTP credentials) for Nodemailer

### Environment Variables

Create a `.env` file inside `server/`:

```env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/pde
PORT=5000
FRONTEND_URL=http://localhost:5173

# Authentication
JWT_SECRET=your_jwt_secret

# LLM (pricing intelligence) — fallback chain: NVIDIA NIM → Google Gemini → Groq
NVIDIA_API_KEY=your_nvidia_nim_key   # primary; omit to skip straight to Gemini
GOOGLE_API_KEY=your_gemini_api_key   # fallback

# Email
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Sentry (optional)
SENTRY_DSN=https://...@sentry.io/...
```

### Running Locally

**Install dependencies:**

```bash
# Backend
cd server && npm install

# Frontend
cd client && npm install
```

**Start the dev servers (run in separate terminals):**

```bash
# Backend — http://localhost:5000
cd server && npm run dev

# Frontend — http://localhost:5173
cd client && npm run dev
```

The Vite dev server is preconfigured to proxy `/api/*` requests to `http://localhost:5000`.

---

## Scripts

### Root

| Command | Description |
|---------|-------------|
| `npm start` | Start the production server (`cd server && npm start`) |
| `npm run heroku-postbuild` | Install server dependencies (used by Heroku CI) |

### Client (`cd client`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build → `client/dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

### Server (`cd server`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with nodemon (auto-reload) |
| `npm start` | Start with Node.js directly |

---

## Deployment

| Layer | Platform | Notes |
|-------|----------|-------|
| Frontend | [Vercel](https://vercel.com) | `client/vercel.json` rewrites `/*` to `index.html`; proxies `/api/*` to the Heroku backend |
| Backend | [Heroku](https://heroku.com) | `Procfile` runs `cd server && node index.js` |

---

## Design System

The UI follows the **"Obsidian Curator"** design language — a dark, editorial aesthetic inspired by private fragrance ateliers. Key principles:

- **Colors:** Deep void (`#0A0A0A`) backgrounds contrasted with gilded gold accents (`#D4AF37`, `#f2ca50`)
- **Typography:** Noto Serif (headlines) + Manrope (body, `0.05em` letter-spacing)
- **Shape:** `0px` border radius across all components — sharp corners imply precision and heritage
- **Depth:** Surface tiers replace drop shadows; floating modals use a gold-tinted "Ambient Bloom" effect
- **Motion:** Framer Motion + GSAP for scroll-linked and entrance animations

Full design specification: [`client/DESIGN.md`](client/DESIGN.md)

---

## Project Structure

```
PDE-Production/
├── client/                    # React + Vite frontend
│   ├── public/images/
│   ├── src/
│   │   ├── components/        # Layout, ErrorBoundary, etc.
│   │   ├── pages/             # Landing, Auth, Catalog, Cart, Vault, Admin…
│   │   ├── context/           # AuthContext
│   │   ├── utils/
│   │   └── config.js          # API base URL
│   ├── DESIGN.md              # Design system documentation
│   └── vite.config.js
│
├── server/                    # Node.js + Express backend
│   ├── config/db.js           # MongoDB connection
│   ├── controllers/           # Business logic (auth, products, orders, scraper, pricing…)
│   ├── models/                # Mongoose schemas (User, Product, Order, Batch)
│   ├── routes/                # API route definitions
│   ├── middleware/
│   ├── services/
│   │   ├── aiHelpers.js       # Multi-AI wrapper (Gemini, NVIDIA NIM, Groq)
│   │   └── semanticCache.js   # AI response caching
│   ├── utils/pricing.js       # Forex-aware pricing calculation
│   └── index.js               # Express app entry point
│
├── Procfile                   # Heroku: web: cd server && node index.js
└── package.json               # Root monorepo config
```

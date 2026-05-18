# VendaPal

A mobile-first Progressive Web App for small business owners and market traders to track customer debts, supplier obligations, and product inventory — all offline, all on-device.

**Live app:** https://king-tatakosi.github.io/vendapal-app/

---

## Features

### Debt Tracking
- Record money customers owe you and money you owe suppliers
- Partial payment recording with a running progress bar
- Full payment history per record
- Mark records as paid or undo accidental deletes (5-second window)
- One-tap call button for saved phone numbers
- Re-record new debts for existing customers without re-entering their details
- Edit any record after it's been saved

### Inventory Management
- Add products with quantity, unit, selling price, cost price, and expiry date
- Set a low-stock alert threshold per product
- Add or remove stock in increments via quick modals
- Out-of-stock cards shown in red with a single Restock CTA
- Expiry alerts: warns 60 days out (yellow), expired (red)

### Home Dashboard
- At-a-glance summary: total owed to you, total you owe suppliers, expiring items, low stock count
- Recent unpaid debts and active alerts shown on the home screen
- Time-based greeting

### Alerts Page
- Consolidated view of expired products, items expiring soon, and low/out-of-stock items

### PWA
- Installable on Android and iOS (Add to Home Screen)
- Fully offline — all data stored in IndexedDB on-device, no server required
- Service worker caches the app shell for instant load after first visit
- Install prompt with 30-day dismiss expiry

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 |
| Build tool | Vite 8 |
| Styling | Plain CSS with CSS custom properties |
| Storage | IndexedDB (raw, no ORM) |
| Deployment | GitHub Pages (`gh-pages` branch) |
| Fonts | Inter, Manrope, Plus Jakarta Sans (Google Fonts) |

No router, no state management library, no backend. Navigation is state-based (`useState` in `App.jsx`).

---

## Project Structure

```
src/
├── assets/          # SVG icons
├── components/      # Reusable UI components
│   ├── BottomNav    # Tab bar navigation
│   ├── DebtCard     # Debt record card with payment actions
│   ├── DebtForm     # Add/edit debt form
│   ├── ProductCard  # Product card with stock actions
│   ├── ProductForm  # Add/edit product form
│   ├── Modal        # Generic modal wrapper
│   ├── SearchBar    # Search input
│   ├── AlertCard    # Expiry/stock alert item
│   ├── ErrorBoundary# Crash recovery screen
│   └── InstallPrompt# PWA install banner
├── context/
│   └── ToastContext # App-wide toast notifications
├── db/
│   └── db.js        # IndexedDB wrapper (getAll, put, remove)
├── hooks/
│   ├── useDebts     # Customer debt state + CRUD
│   ├── useSupplierDebts # Supplier debt state + CRUD
│   └── useProducts  # Product state + CRUD + alerts
├── pages/
│   ├── Home         # Dashboard
│   ├── Debts        # Customer & supplier debt lists
│   ├── Products     # Inventory list
│   └── Alerts       # Expiry & stock alerts
└── utils/
    ├── format.js    # Currency, date, initials formatters
    └── export.js    # CSV export helpers (debts & products)
public/
├── sw.js            # Service worker (cache-first strategy)
├── manifest.json    # PWA manifest
└── og.jpeg          # Open Graph image
```

---

## Getting Started

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

---

## Data Storage

All data lives in the user's browser via IndexedDB (`vendapal_db`). Three object stores:

| Store | Contents |
|---|---|
| `debts` | Customer debt records |
| `supplier_debts` | Supplier debt records |
| `products` | Inventory items |

No data is sent to any server. Clearing browser data or site storage will erase records.

---

## Deployment

The deploy script builds the app, initialises a throwaway git repo in `dist/`, and force-pushes to the `gh-pages` branch:

```bash
npm run deploy
```

Source code lives on the `main` (and `feature`) branch. The `gh-pages` branch contains only the built output and has no shared history with `main`.

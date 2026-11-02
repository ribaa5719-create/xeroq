# XeroQ frontend

XeroQ is a React single-page application for discovering local print shops, configuring print orders, tracking order progress, and managing shop and platform workflows. The frontend is built with React 19, Vite 8, React Router 7, plain CSS, Lucide icons, Axios, Leaflet/React Leaflet, `pdf-lib`, and `qrcode`.

## Requirements

- Node.js compatible with the installed Vite release
- npm
- The XeroQ API running locally or a configured API URL

## Setup

From this directory:

```sh
npm install
```

Create a `.env` file when the API is not available at the default URL:

```env
VITE_API_URL=http://localhost:5000/api
```

The frontend defaults to `http://localhost:5000/api`. Keep the configured value pointed at the existing XeroQ backend; this application does not replace or mock backend behavior.

## Development and checks

```sh
npm run dev
npm run build
npm run lint
npm run test:e2e
```

The Vite development server uses port `5173` and requires that port to be available. Playwright end-to-end tests are located in `tests/`.

## Main frontend areas

- Public landing page, authentication, and nearby shop discovery
- Student print configuration, orders, queue tracking, notifications, and account view
- Shop-owner profile, order, queue, and shop analytics workflows
- Admin user and shop management

Some administrator-wide order monitoring, reports, and analytics require backend endpoints that are not currently available. User block/unblock and student profile editing are also not exposed by the current API; the UI identifies these limitations rather than simulating actions.

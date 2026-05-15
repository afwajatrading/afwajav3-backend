# Render Backend Deploy

## What To Deploy

- Deploy the project root that contains:
  - `preview-server.js`
  - `package.json`
  - `render.yaml`
  - `assets/`
  - `index.html`
  - `terms.html`
  - `logistics.html`
  - `thank-you.html`

## Render Settings

- Service type:
  - `Web Service`
- Runtime:
  - `Node`
- Start command:
  - `npm start`
- Root directory:
  - project root

## Required Environment Variables

- `APP_BASE_URL=https://www.acrental.my`
- `FRONTEND_BASE_URL=https://www.acrental.my`
- `API_PUBLIC_BASE_URL=https://api.acrental.my`
- `BAYARCASH_API_BASE_URL=https://api.console.bayar.cash/v3`
- `BAYARCASH_PAT=...`
- `BAYARCASH_PORTAL_KEY=...`
- `BAYARCASH_API_SECRET_KEY=...`
- `BAYARCASH_PAYMENT_CHANNEL=1`
- `TEST_CHECKOUT_ENABLED=true`
- `TEST_CHECKOUT_CAR_NAME=Perodua Axia`
- `TEST_CHECKOUT_TOTAL=1`
- `GOOGLE_MAPS_API_KEY=...`
- `GOOGLE_MAPS_HOME_BASE_NAME=Afwaja Car Rental Cyberjaya`
- `GOOGLE_MAPS_HOME_BASE_ADDRESS=Afwaja Car Rental Cyberjaya, Cyberjaya, Selangor, Malaysia`
- `DELIVERY_RATE_PER_KM=2`
- `EMAIL_PROVIDER=resend`
- `RESEND_API_KEY=...`
- `NOTIFICATION_FROM_EMAIL=noreply@mail.afwajarental.com`
- `NOTIFICATION_FROM_NAME=Afwaja Car Rental`
- `ADMIN_NOTIFICATION_EMAIL=afwajatrading@gmail.com`
- `REPLY_TO_EMAIL=afwajatrading@gmail.com`
- `WHATSAPP_PROVIDER=meta`
- `WHATSAPP_ACCESS_TOKEN=...`
- `WHATSAPP_PHONE_NUMBER_ID=...`
- `WHATSAPP_API_VERSION=v23.0`
- `WHATSAPP_MESSAGE_MODE=text`
- `WHATSAPP_TEMPLATE_LANGUAGE=en`
- `WHATSAPP_TEMPLATE_SUCCESS_NAME=booking_success`
- `WHATSAPP_TEMPLATE_UNSUCCESSFUL_NAME=booking_unsuccessful`
- `CORS_ALLOWED_ORIGIN=https://www.acrental.my`

## Suggested Domain Mapping

- Frontend:
  - `https://www.acrental.my`
- Backend:
  - `https://api.acrental.my`

## Important BayarCash URL Split

- Customer return page:
  - `FRONTEND_BASE_URL/thank-you.html`
- Backend callback endpoint:
  - `API_PUBLIC_BASE_URL/api/bayarcash/callback`

## Frontend Shared Hosting Update

- On the shared-hosting copy of the frontend, edit:
  - `assets/js/site-config.js`
- Change it to:
  - `window.AfwajaSiteConfig = { apiBaseUrl: "https://api.acrental.my" };`

## Before Switching To Real Live

- Change `TEST_CHECKOUT_ENABLED=false`
- Change `WHATSAPP_MESSAGE_MODE=template`
- Make sure WhatsApp templates are approved

## Final Live Test

- Create one real booking with:
  - real rental amount
  - FPX checkout
  - real email
  - approved WhatsApp template flow

# Netlify Full-Stack Deploy

## Current Architecture

- Frontend:
  - `https://www.afwajarental.my`
- Backend:
  - Netlify Functions on the same domain:
    - `/api/maps/config`
    - `/api/maps/autocomplete`
    - `/api/maps/delivery-quote`
    - `/api/fiuu/payment-intents`
    - `/api/fiuu/return`
    - `/api/fiuu/notify`
    - `/api/fiuu/callback`
    - `/dev/email-preview`

## Netlify Project Setup

- Publish directory:
  - project root `.`
- Functions directory:
  - `netlify/functions`

## Required Environment Variables

- `APP_BASE_URL=https://www.afwajarental.my`
- `FRONTEND_BASE_URL=https://www.afwajarental.my`
- `API_PUBLIC_BASE_URL=https://www.afwajarental.my`
- `FIUU_MERCHANT_ID=...`
- `FIUU_VERIFY_KEY=...`
- `FIUU_SECRET_KEY=...`
- `FIUU_ENVIRONMENT=production`
- `TEST_CHECKOUT_ENABLED=false`
- `TEST_CHECKOUT_CAR_NAME=Perodua Axia`
- `TEST_CHECKOUT_TOTAL=1`
- `GOOGLE_MAPS_API_KEY=...`
- `GOOGLE_MAPS_HOME_BASE_NAME=Afwaja Car Rental Cyberjaya`
- `GOOGLE_MAPS_HOME_BASE_ADDRESS=Afwaja Car Rental Cyberjaya, Cyberjaya, Selangor, Malaysia`
- `DELIVERY_RATE_PER_KM=2`
- `EMAIL_PROVIDER=resend`
- `RESEND_API_KEY=...`
- `NOTIFICATION_FROM_EMAIL=noreply@mail.afwajarental.my`
- `NOTIFICATION_FROM_NAME=Afwaja Car Rental`
- `ADMIN_NOTIFICATION_EMAIL=afwajatrading@gmail.com`
- `REPLY_TO_EMAIL=afwajatrading@gmail.com`
- `CORS_ALLOWED_ORIGIN=https://www.afwajarental.my`

## Important Notes

- Keep `assets/js/site-config.js` in same-origin mode:
  - `window.AfwajaSiteConfig = { apiBaseUrl: "" };`
- Keep `assets/js/runtime-config.js` in live mode:
  - `window.AfwajaRuntimeConfig = { testCheckout: { enabled: false, ... } };`
- Fiuu return endpoint:
  - `https://www.afwajarental.my/api/fiuu/return`
- Fiuu notification endpoint:
  - `https://www.afwajarental.my/api/fiuu/notify`
- Fiuu callback endpoint:
  - `https://www.afwajarental.my/api/fiuu/callback`
- Email preview page:
  - `https://www.afwajarental.my/dev/email-preview`
- Keep all Fiuu credentials in Netlify environment variables only.

## Before Deploy

- Make sure `@netlify/blobs` installs successfully during Netlify build.
- Confirm all Fiuu credentials are production-ready.
- Confirm Resend sender domain is verified.
- Confirm Google Maps API key has access to:
  - `Places API (New)`
  - `Routes API`

## Final Live Test

- Create one real booking with:
  - real rental amount
  - FPX checkout
  - real customer email
- Confirm:
  - logistics autocomplete works
  - logistics charge is calculated
  - Fiuu checkout opens
  - successful payment returns to `thank-you.html`
  - customer email arrives
  - admin email arrives

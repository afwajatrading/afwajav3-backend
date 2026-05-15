# Afwaja Live Checklist

## Before Going Live

- Verify `APP_BASE_URL` points to the real public domain.
- Keep `BAYARCASH_PAYMENT_CHANNEL=1` for FPX only.
- Confirm BayarCash portal, PAT, and API secret key are production-ready.
- Confirm Google Maps API key is active for `Places API (New)` and `Routes API`.
- Keep WhatsApp on `test number` only for testing; do not rely on it for live notifications.
- Create and approve WhatsApp templates:
  - `booking_success`
  - `booking_unsuccessful`
- Switch WhatsApp to:
  - `WHATSAPP_MESSAGE_MODE=template`
- Make sure Resend domain and sender email are verified.

## Last Test Mode Switch

- Change `.env`:
  - `TEST_CHECKOUT_ENABLED=false`
- Restart the server after changing the value.
- Confirm `Perodua Axia` no longer checks out at `RM1`.

## Final Live Test

- Create one real booking with:
  - real rental amount
  - FPX checkout
  - real email
  - approved WhatsApp recipient flow
- Confirm:
  - BayarCash checkout opens
  - successful payment returns to `thank-you.html`
  - admin email arrives
  - customer email arrives
  - customer WhatsApp arrives

## Nice-to-Have After Launch

- Replace local preview server with a production process manager.
- Move API and static site behind the real domain and HTTPS.
- Add booking persistence to a database.
- Add admin dashboard or booking log.

# Afwaja Live Checklist

## Before Going Live

- Verify `APP_BASE_URL` points to `https://www.afwajarental.my`.
- Verify `FRONTEND_BASE_URL` points to `https://www.afwajarental.my`.
- Verify `API_PUBLIC_BASE_URL` points to `https://www.afwajarental.my`.
- Keep `BAYARCASH_PAYMENT_CHANNEL=1` for FPX only.
- Verify `BAYARCASH_LOCAL_BYPASS=false`.
- Confirm BayarCash portal, PAT, and API secret key are production-ready.
- Confirm Google Maps API key is active for `Places API (New)` and `Routes API`.
- Make sure Resend domain and sender email are verified.
- Make sure Netlify environment variables are complete for both BayarCash and Resend.

## Last Test Mode Switch

- Change `.env`:
  - `BAYARCASH_LOCAL_BYPASS=false`
  - `TEST_CHECKOUT_ENABLED=false`
- Trigger a new Netlify deploy after changing the value.
- Confirm `Perodua Axia` no longer checks out at `RM1`.

## Final Live Test

- Create one real booking with:
  - real rental amount
  - FPX checkout
  - real email
- Confirm:
  - location autocomplete works
  - logistics charges appear
  - BayarCash checkout opens
  - successful payment returns to `thank-you.html`
  - admin email arrives
  - customer email arrives

## Nice-to-Have After Launch

- Replace the legacy local preview server with a Netlify-local workflow only.
- Add admin dashboard or booking log.

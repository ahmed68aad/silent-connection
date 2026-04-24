# Silent Connection Deployment Checklist

## Required Environment

Server:
- `NODE_ENV=production`
- `PORT`
- `CLIENT_ORIGIN`
- `JWT_SECRET`
- `MONGO_URI`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

Client:
- `VITE_API_URL` (optional if the frontend uses a same-origin `/api` rewrite)

## Smoke Test

1. Open the deployed client.
2. Create a new account.
3. Receive and enter the email verification code.
4. Sign in.
5. Upload a profile image.
6. Connect a partner with an invite code.
7. Upload a post image from the camera button.
8. Reload the feed and confirm views do not increase twice in the same tab session.
9. Toggle dark/light mode from the navbar.
10. Open `/api/health` on the API domain and confirm it returns `{ "success": true, "status": "ok" }`.

## Production Notes

- Set `CLIENT_ORIGIN` to the exact deployed frontend origin, not `*`.
- If the client is deployed on Vercel with a rewrite from `/api/*` to the API app,
  prefer calling `/api/*` from the browser instead of the API app's full URL.
- Use a `JWT_SECRET` with at least 32 characters.
- Configure SPF, DKIM, and DMARC for the sender domain to reduce verification email spam.
- Keep MongoDB network access restricted to your deployment provider where possible.
- Rotate Cloudinary and SMTP credentials if they were ever committed or shared.

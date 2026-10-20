# Forma — Full-stack e-commerce frontend

A responsive React + Vite storefront adapted to the existing Express/Mongoose backend. The UI keeps the old project's core ideas (product browsing/search, cart, authentication, profile) and adds product detail, checkout handoff, order history, notifications, and an admin studio.

## Run locally

1. Install Node.js (Node 20+ recommended).
2. Extract this folder and run:
   ```bash
   npm install
   cp .env.example .env
   npm run dev
   ```
3. Start the Express backend on `http://localhost:8080`.
4. Open the Vite URL printed in the terminal.

## Environment

```env
VITE_API_URL=http://localhost:8080/api
VITE_SERVER_URL=http://localhost:8080
```

`VITE_API_URL` is the Express API prefix. `VITE_SERVER_URL` is used to resolve relative image paths such as `uploads/example.jpg`; remote CDN URLs are used as-is.

## API routes expected

The frontend is wired to the backend routes discussed in this project:

- `POST /auth/register`
- `POST /auth/verify-otp`
- `POST /auth/resend-otp`
- `POST /auth/login`
- `GET /auth/me`
- `GET /products`, `GET /products/:id`
- `POST /products`, `PUT /products/:id`, `DELETE /products/:id` (admin)
- `POST /order`, `GET /order/me`, `GET /order` (admin), `PATCH /order/:id/status` (admin)
- `GET /notifications/me`

The API responses may vary slightly by backend implementation; helper functions accept either a bare array or common wrapped responses (`products`, `orders`, `notifications`). The backend remains the source of truth for authorization.

## Product image uploads

The admin create form sends `multipart/form-data` using the exact Multer field names from the backend route: `thumbnail` (one file) and `images` (up to five files). Product updates send JSON because the current backend update route does not include Multer.

## Stripe checkout

The cart posts product IDs, quantities, shipping address, and optional notes to `POST /order`. When the backend responds with `{ url }`, the browser redirects to Stripe Checkout. The success/cancel pages are UI pages only; payment confirmation must still be handled by the backend.

## Real-time notifications

The frontend connects Socket.IO to the API origin's host, emits the current user's ID through the existing `join` event, and listens for `notification`. This matches the learning backend's current room-joining behavior. Before a public deployment, authenticate the socket server-side using the JWT and derive the room ID from the verified token instead of trusting a client-provided ID.

## Demo fallback

If the backend is unavailable, the home/shop screens use sample products so the design can still be previewed. Authentication, orders, admin changes, and notifications require the backend to be running.

## Notes

- Currency is displayed in USD to match the Stripe Checkout line items in the current backend.
- Make sure your backend CORS `CLIENT_URL` matches the Vite origin.
- Admin routes require the signed-in user's `role` to be `admin`.
- For local image URLs, Express must serve the uploads folder using `app.use('/uploads', express.static('uploads'))`.

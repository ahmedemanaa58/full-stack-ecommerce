# Full-Stack E-Commerce Application

A full-stack e-commerce application built with **React, Node.js, Express, and MongoDB**, featuring user authentication, product management, Stripe Checkout, Cloudinary image hosting, order management, and real-time notifications.

## Features

- **User Authentication** - User registration and login.
- **Product Catalog** - Browse products and view individual product details.
- **Shopping Cart** - Add products to a cart and manage selections before checkout.
- **Payments** - Stripe Checkout integration.
- **Order Management** - Create and manage customer orders.
- **Product Administration** - Create, update, and delete products through the admin functionality.
- **Cloudinary Integration** - Upload and host product images using Cloudinary.
- **Real-Time Notifications** - Notifications for user login and order status changes.

## Tech Stack

| Area | Technologies |
|---|---|
| Frontend | React, JavaScript, HTML, CSS, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Payments | Stripe Checkout |
| Image Hosting | Cloudinary |
| API Communication | REST APIs |
| Real-Time Features | Socket.IO |

## Project Structure

```text
full-stack-ecommerce/
├── client/                 # React frontend
│   ├── src/
│   ├── public/
│   ├── .env.example
│   └── package.json
├── server/                 # Node.js and Express backend
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── validations/
│   ├── .env.example
│   └── package.json
├── .gitignore
└── README.md
```

The structure above highlights the main project directories; individual files may vary.

## Getting Started

Follow these instructions to run the application locally.

### Prerequisites

- [Node.js and npm](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/) or a MongoDB Atlas database
- A [Stripe](https://stripe.com/) account for test-mode checkout
- A [Cloudinary](https://cloudinary.com/) account for image hosting

### 1. Clone the Repository

```bash
git clone https://github.com/ahmedemanaa58/full-stack-ecommerce.git
cd full-stack-ecommerce
```

### 2. Configure and Start the Backend

From the project root:

```bash
cd server
npm install
```

Create a local environment file from the example.

PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS or Linux:

```bash
cp .env.example .env
```

Open `server/.env` and set values for your environment:

```dotenv
CONNECTION_STRING=mongodb://127.0.0.1:27017/ecommerce
JWT_SECRET=replace_with_a_long_random_secret
PAYMENT_SECRET=sk_test_replace_with_your_stripe_test_key
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:8080
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

These are example values for local development. Replace the placeholders with your own credentials. Use a Stripe test-mode secret key while developing. Never commit your real `.env` file or credentials to GitHub.

Start the backend:

```bash
npm run dev
```

Keep this terminal running. Make sure the database connection and configured URLs match your local setup.

### 3. Configure and Start the Frontend

Open a **second terminal** at the project root:

```bash
cd client
npm install
```

Create the frontend environment file from the example.

PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS or Linux:

```bash
cp .env.example .env
```

The example frontend configuration is:

```dotenv
VITE_API_URL=http://localhost:8080/api
VITE_SERVER_URL=http://localhost:8080
```

Check that these URLs match your backend. Vite exposes variables prefixed with `VITE_` to frontend code, so do not put secrets in frontend environment variables.

Start the frontend:

```bash
npm run dev
```

Open the local URL printed by Vite in the terminal.

### 4. Test the Application

After configuring the database and external services, try the following:

- Register or log in with a test account.
- Browse products and view product details.
- Add products to the shopping cart.
- Test checkout using Stripe test-mode credentials.
- Verify that product images upload and display correctly.
- Test order creation and order status updates.
- Verify the relevant real-time notifications.

## Environment Variables

The example files are the best reference for the current local configuration. The backend variables documented here are:

| Variable | Purpose |
|---|---|
| `CONNECTION_STRING` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign authentication tokens |
| `PAYMENT_SECRET` | Stripe server-side secret key |
| `CLIENT_URL` | Frontend origin used for checkout return URLs |
| `SERVER_URL` | Backend origin used to build public URLs for locally stored images |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

The frontend example uses:

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Backend API base URL |
| `VITE_SERVER_URL` | Backend origin used by the frontend for server-hosted resources |

The names above match the environment variables identified in the project configuration reviewed for this README. If you change the code or deployment configuration, update the relevant example environment file and this documentation together.

## Security Notes

- Keep real `.env` files and credentials out of version control.
- Use Stripe test-mode credentials during development.
- Keep server-side secrets, including `PAYMENT_SECRET`, `JWT_SECRET`, and `CLOUDINARY_API_SECRET`, out of frontend code.
- Only use placeholder values in `.env.example` files.
- Configure production URLs, credentials, database access, and deployment settings before going live.

## Future Improvements

Potential areas for further development include automated tests, production deployment, improved monitoring, and additional e-commerce features.

## Author

**Ahmed Emad**

GitHub: [@ahmedemanaa58](https://github.com/ahmedemanaa58)

---

Built as a full-stack development project to practice frontend development, backend APIs, database integration, payment processing, image hosting, authentication, and order workflows.

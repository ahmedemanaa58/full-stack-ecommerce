# Full-Stack E-Commerce Application

A full-stack e-commerce application built with **React, Node.js, Express, and MongoDB**, featuring user authentication, product management, Stripe checkout, Cloudinary image hosting, order management, and real-time notifications.

## Features

- **User Authentication** — User registration and login.
- **Product Catalog** — Browse products and view individual product details.
- **Shopping Cart** — Add products to a cart and manage selections before checkout.
- **Secure Payments** — Stripe checkout and payment integration.
- **Order Management** — Create and manage customer orders.
- **Product Administration** — Create, update, and delete products through the admin functionality.
- **Cloudinary Integration** — Upload and host product images using Cloudinary.
- **Real-Time Notifications** — Notifications for user login and order status changes.

## Tech Stack

| Area | Technologies |
|---|---|
| Frontend | React, JavaScript, HTML, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Payments | Stripe |
| Image Hosting | Cloudinary |
| API Communication | REST APIs |

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
│   └── package.json
├── .gitignore
└── README.md
```

*The structure above highlights the main project directories; individual files may vary.*

## Getting Started

Follow these instructions to run the application locally.

### Prerequisites

Install the following before starting:

- [Node.js](https://nodejs.org/) and npm
- [MongoDB](https://www.mongodb.com/) or a MongoDB Atlas database
- A [Stripe](https://stripe.com/) account
- A [Cloudinary](https://cloudinary.com/) account

### 1. Clone the Repository

```bash
git clone https://github.com/ahmedemanaa58/full-stack-ecommerce.git
cd full-stack-ecommerce
```

### 2. Configure the Backend

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

Create a `.env` file inside the `server/` directory using the environment variables required by your backend.

Example placeholders:

```dotenv
PORT=YOUR_SERVER_PORT
MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING
CLIENT_URL=YOUR_FRONTEND_URL

STRIPE_SECRET_KEY=YOUR_STRIPE_TEST_SECRET_KEY

CLOUDINARY_CLOUD_NAME=YOUR_CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET=YOUR_CLOUDINARY_API_SECRET
```

Replace the placeholders with your own values. The variable names must match those referenced in your application code. If your project uses additional environment variables, add them as needed.

**Security:** Use Stripe test-mode credentials during development. Never commit real API keys, passwords, database credentials, or `.env` files to GitHub.

Start the backend using the development script defined in `server/package.json`. For example, if the script is named `dev`:

```bash
npm run dev
```

### 3. Configure the Frontend

Open a second terminal from the project root:

```bash
cd client
npm install
```

Configure the frontend environment variables in `client/.env` according to your existing `client/.env.example` and the variable names referenced in the React application.

For example, if the frontend uses Vite:

```dotenv
VITE_API_URL=YOUR_BACKEND_API_URL
```

Use the correct variable prefix and name for your frontend build setup.

Start the frontend using the script defined in `client/package.json`. For a Vite-based project:

```bash
npm run dev
```

Open the local URL displayed in the terminal.

### 4. Test the Application

- Register or log in with a test account.
- Browse products and view product details.
- Add products to the shopping cart.
- Test checkout using Stripe test-mode credentials.
- Verify that product images upload and display correctly.
- Test order creation and order status updates.
- Verify the relevant real-time notifications.

Exact commands and environment variable names may depend on the scripts and configuration in your local project.

## Environment Variables

The application uses environment variables to configure external services and local development settings.

| Variable | Purpose |
|---|---|
| `PORT` | Backend server port |
| `MONGODB_URI` | MongoDB connection string |
| `CLIENT_URL` | Frontend origin, if used by the backend |
| `STRIPE_SECRET_KEY` | Stripe server-side secret key |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `VITE_API_URL` | Example frontend API URL for a Vite setup |

These are illustrative names, not a guarantee that every variable matches your current code. Follow your project's actual configuration and example environment files.

## Security Notes

- Keep environment files and credentials out of version control.
- Use test credentials while developing payment functionality.
- Keep secret API keys on the server; never expose them in frontend code.
- Configure production credentials, access permissions, and deployment settings before going live.

## Future Improvements

Potential areas for further development include automated testing, production deployment, improved monitoring, and additional e-commerce features.

## Author

**Ahmed Emad**

GitHub: [@ahmedemanaa58](https://github.com/ahmedemanaa58)

---

*Built as a full-stack development project to practice frontend development, backend APIs, database integration, payment processing, image hosting, authentication, and order workflows.*

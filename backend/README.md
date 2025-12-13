# Online Auction - Backend

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files (database, environment, etc.)
│   ├── controllers/      # Request handlers and business logic
│   ├── libs/             # Shared libraries and reusable modules
│   ├── middleware/       # Handles authentication and authorization logic
│   ├── models/           # Data models and database schemas
│   ├── routes/           # Route definitions and endpoint mapping
│   ├── services/         # Business logic and external service integrations
│   ├── utils/            # Helper functions and utilities
│   └── server.js         # Application entry point and server configuration
├── package.json          # Project dependencies and scripts
```

## 🛠️ Getting Started

Follow these steps to set up and run the backend application:

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

Or if you prefer yarn:

```bash
yarn install
```

### 4. Start Development Server

```bash
npm run dev
```

Or with yarn:

```bash
yarn dev
```

The server will start with auto-reload enabled at `http://localhost:5001`.

### 5. Start Production Server

```bash
npm start
```

Or with yarn:

```bash
yarn start
```

## 📦 Available Scripts

| Script        | Description                                                         |
| ------------- | ------------------------------------------------------------------- |
| `npm run dev` | Starts the development server with nodemon (auto-reload on changes) |
| `npm start`   | Starts the production server                                        |

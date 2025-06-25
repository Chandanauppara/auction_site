# Auction Management System

A full-stack auction platform that allows users to register, create listings, bid in real-time, and manage auctions from dedicated dashboards. Designed with modular backend services and a responsive React UI.

- **Backend:** Go (Gin), PostgreSQL
- **Frontend:** React, Material-UI

---

## Features

- User, Seller, and Admin authentication
- Create, view, and bid on auction items
- Real-time auction status (active, cancelled, ended)
- Admin dashboard for managing auctions
- Seller dashboard for managing their own auctions
- Notifications for bids and auction status changes

---

## Project Structure

```
auction-management/
  backend/      # Go backend (API server)
  frontend/     # React frontend (client app)
```

---

## Prerequisites

- **Go** (1.20+ recommended)
- **Node.js** (v16+ recommended) and **npm**
- **PostgreSQL** (running locally or accessible remotely)

---

## Backend Setup

1. **Configure Database**

   - Create a PostgreSQL database (e.g., `auction_systems`).
   - Update the connection string in `backend/main.go` if needed:
     ```
     connStr := "user='postgres' password='yourpassword' dbname='auction_systems' host='localhost' port='5432' sslmode=disable"
     ```

2. **Install Go Dependencies**

   ```bash
   cd backend
   go mod tidy
   ```

3. **Run the Backend Server**

   ```bash
   go run main.go
   ```

   The server will start on [http://localhost:8080](http://localhost:8080).

   > **Note:** The backend checks for table existence on startup. If missing, it will auto-create the tables and populate sample users and auction items. This logic is in `backend/config/setup.go`.

---

## Frontend Setup

1. **Install Node.js Dependencies**

   ```bash
   cd frontend
   npm install
   ```

2. **Run the Frontend Development Server**

   ```bash
   npm start
   ```

   The app will open at [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

- The backend uses hardcoded connection strings by default. For production, use environment variables or a `.env` file.
- The frontend expects the backend API at `http://localhost:8080/api`.

# .env.example
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=auction_systems
DB_HOST=localhost
DB_PORT=5432

### .env File

Before running the backend, copy `.env.example` to `.env` and update with your local database credentials:

### 🔌 API Endpoints

| Method | Route                              | Description              |
|--------|------------------------------------|--------------------------|
| POST   | `/api/users/register`              | Register new user        |
| POST   | `/api/users/login`                 | Login user               |
| GET    | `/api/auctions`                    | List all auction items   |
| POST   | `/api/auctions`                    | Create new auction item  |
| POST   | `/api/auctions/:itemId/bid`        | Place a bid on an item   | 
---

## CORS

- The backend is configured to allow requests from `http://localhost:3000` (the React app).
- If you deploy to production, update the allowed origins in `main.go`.

---

## Database Schema

- **Tables:** `users`, `sellers`, `admins`, `items`, `bids`
- **Key fields:**
  - `items.status`: `'active'`, `'cancelled'`, `'ended'`
  - `bids`: stores all bids for each item

---

## Common Issues

- **CORS errors:** Ensure the backend is running and CORS middleware is enabled.
- **Database connection errors:** Check your PostgreSQL credentials and that the server is running.
- **Data not persisting:** Make sure you are not dropping tables on every backend restart.

---

## Scripts

### Backend

- `go run main.go` — Start the API server

### Frontend

- `npm start` — Start the React development server
- `npm run build` — Build for production

---

## License

MIT

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## Contact

For questions or support, open an issue on GitHub.




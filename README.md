# Silent Connection

Local full-stack app with a Vite React client and an Express API.

## Run Locally

1. Install server dependencies:

   ```powershell
   cd server
   npm install
   Copy-Item .env.example .env
   ```

2. Update `server/.env` with your local configuration. **Crucial:** Ensure your `MONGO_URI` includes `/silent` at the end to avoid using the default `test` database:

   ```env
   MONGO_URI=mongodb://localhost:27017/silent
   JWT_SECRET=your_secret_key_here
   ```

   Then start the API:

   ```powershell
   npm run dev
   ```

3. In another terminal, install client dependencies:

   ```powershell
   cd client
   npm install
   Copy-Item .env.example .env
   ```

4. Start the client:
   ```powershell
   npm run dev
   ```

The client runs at `http://localhost:5173` and the API is running at `http://localhost:3000`.

The backend is configured to use the local MongoDB database named `silent`. If you see "User does not exist" but they are in your DB, check `http://localhost:3000/api/health` to verify the database name is not `test`.

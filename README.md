# 🔥 LC Leaderboard

A web app to track LeetCode problem-solving progress with friends. Features per-user authentication, individual leaderboards, and real-time LeetCode problem difficulty breakdowns.

## Features

✅ **User Authentication** - Sign up & login with secure password hashing  
✅ **Per-User Leaderboards** - Each user has their own friend list  
✅ **Easy/Medium/Hard Breakdown** - See difficulty distribution for each friend  
✅ **Remove Friends** - Manage your leaderboard  
✅ **Profile Links** - Quick links to LeetCode profiles  
✅ **Auto-Refresh** - Leaderboard updates every 60 seconds  

## Local Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the server:**
   ```bash
   npm start
   ```

3. **Open in browser:**
   - Login page: http://localhost:5000/login.html
   - Home: http://localhost:5000/
   - About: http://localhost:5000/about.html

4. **Create an account:**
   - Enter any username and password on the login page
   - Click "Sign Up" to create a new account
   - Click "Login" to sign in with existing credentials

## Deployment on Vercel

### Prerequisites
- Vercel account (free at https://vercel.com)
- GitHub account with repo containing this code

### Steps

1. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/lc-leaderboard.git
   git branch -M main
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to https://vercel.com/new
   - Select "Import Git Repository"
   - Paste your GitHub repo URL
   - Click "Import"
   - Vercel will auto-detect Node.js project
   - Leave env vars blank (or add them if needed)
   - Click "Deploy"

3. **After deployment:**
   - Your app will be live at `https://your-project.vercel.app`
   - Users can access login at `https://your-project.vercel.app/login.html`
   - Data is stored in `users.json` on the Vercel filesystem (note: files reset on redeploy)

### Vercel Considerations
- Free tier: app may sleep after 100 requests in 24h
- Data files (`users.json`) are ephemeral — they reset on redeploy
- **For production:** Use a database (PostgreSQL, MongoDB) instead of JSON files

## Deployment on Render

### Prerequisites
- Render account (free at https://render.com)
- GitHub account with repo containing this code

### Steps

1. **Push code to GitHub (same as Vercel)**

2. **Deploy on Render:**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub account
   - Select the `lc-leaderboard` repo
   - Render will auto-detect `render.yaml`
   - Leave env vars blank
   - Click "Create Web Service"

3. **After deployment:**
   - Your app lives at `https://your-service.onrender.com`
   - Login: `https://your-service.onrender.com/login.html`
   - Render will auto-rebuild on every push to main

### Render Considerations
- Free tier: spins down after 15 min of inactivity
- Restart typically takes 30 sec
- Data files are ephemeral (reset on redeploy)
- **For production:** Use Render PostgreSQL database

## API Endpoints

### Authentication
- `POST /signup` - Create new user
  ```json
  { "username": "john", "password": "secret" }
  ```
- `POST /login` - Log in
  ```json
  { "username": "john", "password": "secret" }
  ```
- `POST /logout` - Log out (requires `Authorization: Bearer TOKEN`)

### Friends (Authenticated)
All require `Authorization: Bearer TOKEN` header

- `GET /leaderboard` - Get ranked friends list
- `POST /add-friend` - Add friend by LeetCode username
  ```json
  { "username": "leetcode_user" }
  ```
- `POST /remove-friend` - Remove friend
  ```json
  { "username": "leetcode_user" }
  ```

## Production Recommendations

### Database
Replace `users.json` with PostgreSQL or MongoDB:
- Use environment variable for DB connection string
- Example: `DATABASE_URL=postgresql://user:pass@host:5432/lcdb`
- Store users and friends in proper database tables

### Authentication
- Consider JWT tokens (currently using simple tokens)
- Add session expiration (currently tokens don't expire)
- Use stronger hashing (currently SHA-256, consider bcrypt)

### Security
- Add HTTPS (Vercel/Render handle this automatically)
- Rate limiting on auth endpoints
- CORS configuration per environment

### Monitoring
- Add error logging (e.g., Sentry, LogRocket)
- Monitor LeetCode API response times
- Set up alerts for crashes

## File Structure

```
.
├── server.js           # Node.js/Express backend
├── index.html          # Home/leaderboard page
├── login.html          # Login & signup page
├── about.html          # About page
├── styles.css          # Shared styles
├── users.json          # User accounts & friends (created on first signup)
├── .env.example        # Environment variables template
├── vercel.json         # Vercel deployment config
├── render.yaml         # Render deployment config
├── package.json        # dependencies
└── README.md           # This file
```

## Troubleshooting

**"Cannot POST /remove-friend"**
- Server didn't restart with latest code
- Restart with `npm start`

**"Unauthorized" on leaderboard**
- Token expired or missing
- Log out and log back in

**"LeetCode user not found"**
- Username is case-sensitive
- Verify username exists on LeetCode

**Data lost after deployment**
- JSON files are ephemeral on Vercel/Render
- Migrate to a persistent database

## License

MIT

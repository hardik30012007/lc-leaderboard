const express = require("express");
const axios = require("axios");
const cors = require("cors");
const crypto = require("crypto");
const path = require("path");
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "../public")));
const connectDb = require("./models/db")
connectDb()
const User = require("./models/User");

// Hash password
function hashPassword(pwd) {
  return crypto.createHash('sha256').update(pwd).digest('hex');
}

// Generate token
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Verify token and get user
async function verifyToken(token) {
  if (!token) return null;
  const user = await User.findOne({ token });
  return user ? user.username : null;
}

// Auth middleware
async function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '');
  const user = await verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = user;
  next();
}

// 🔐 Sign Up
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const token = generateToken();
    const newUser = new User({
      username,
      password: hashPassword(password),
      token,
      friends: []
    });

    await newUser.save();
    res.json({ message: 'Signup successful', user: { username }, token });
  } catch (err) {
    res.status(500).json({ error: 'Error during signup' });
  }
});

// 🔑 Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    const user = await User.findOne({ username });
    if (!user || user.password !== hashPassword(password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken();
    user.token = token;
    await user.save();

    res.json({ message: 'Login successful', user: { username }, token });
  } catch (err) {
    res.status(500).json({ error: 'Error during login' });
  }
});

// 🚪 Logout
app.post('/logout', authMiddleware, async (req, res) => {
  try {
    await User.findOneAndUpdate({ username: req.user }, { token: null });
    res.json({ message: 'Logged out' });
  } catch (err) {
    res.status(500).json({ error: 'Error during logout' });
  }
});

// ➕ Add friend
app.post("/add-friend", authMiddleware, async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username required" });
  }

  try {
    const user = await User.findOne({ username: req.user });
    if (!user.friends.includes(username)) {
      user.friends.push(username);
      await user.save();
    }
    res.json({ message: "Friend added", friends: user.friends });
  } catch (err) {
    res.status(500).json({ error: "Error adding friend" });
  }
});

// ➖ Remove friend
app.post('/remove-friend', authMiddleware, async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });

  try {
    const user = await User.findOne({ username: req.user });
    user.friends = user.friends.filter(u => u !== username);
    await user.save();
    res.json({ message: 'Friend removed', friends: user.friends });
  } catch (err) {
    res.status(500).json({ error: "Error removing friend" });
  }
});

// 🔥 Fetch LeetCode data
async function fetchLeetCodeData(username) {
  try {
    const response = await axios.post(
      "https://leetcode.com/graphql",
      {
        query: `
          query getUserProfile($username: String!) {
            matchedUser(username: $username) {
              submitStats {
                acSubmissionNum {
                  difficulty
                  count
                }
              }
            }
          }
        `,
        variables: { username }
      }
    );

    const stats = response.data.data.matchedUser.submitStats.acSubmissionNum;
    const total = stats.find(x => x.difficulty === "All")?.count || 0;
    const easy = stats.find(x => x.difficulty === "Easy")?.count || 0;
    const medium = stats.find(x => x.difficulty === "Medium")?.count || 0;
    const hard = stats.find(x => x.difficulty === "Hard")?.count || 0;

    return { username, totalSolved: total, easy, medium, hard };
  } catch (err) {
    return { username, totalSolved: 0, easy: 0, medium: 0, hard: 0, error: true };
  }
}

// 📊 Leaderboard
app.get("/leaderboard", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user });
    const friends = user.friends || [];

    const results = await Promise.all(
      friends.map(friendUsername => fetchLeetCodeData(friendUsername))
    );

    results.sort((a, b) => b.totalSolved - a.totalSolved);

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Error fetching data" });
  }
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
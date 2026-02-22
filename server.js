const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(cors());
app.use(session({
    secret: process.env.SESSION_SECRET || 'gaming-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI , {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    gamertag: String,
    favoriteGames: [String],
    joinedAt: { type: Date, default: Date.now },
    adWatchCount: { type: Number, default: 0 },
    premiumAccess: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);

// Contest Registration Schema
const contestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    gamertag: String,
    game: String,
    teamName: String,
    registeredAt: { type: Date, default: Date.now },
    contestDate: Date
});

const Contest = mongoose.model('Contest', contestSchema);

// API Routes

// Register for contest
app.post('/api/register-contest', async (req, res) => {
    try {
        const { gamertag, game, teamName, email } = req.body;
        
        // Check if user exists or create new
        let user = await User.findOne({ email });
        if (!user) {
            user = new User({
                email,
                gamertag,
                favoriteGames: [game],
                username: gamertag
            });
            await user.save();
        }

        const contest = new Contest({
            userId: user._id,
            gamertag,
            game,
            teamName,
            contestDate: new Date(Date.now() + 7*24*60*60*1000) // 1 week from now
        });

        await contest.save();
        res.json({ success: true, message: 'Registered for contest successfully!', contest });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Track ad view (legitimate - counts views, not clicks)
app.post('/api/track-ad-view', async (req, res) => {
    try {
        const { userId } = req.body;
        if (userId) {
            await User.findByIdAndUpdate(userId, { 
                $inc: { adWatchCount: 1 },
                premiumAccess: true
            });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get community stats
app.get('/api/stats', async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const contestCount = await Contest.countDocuments();
        const upcomingContests = await Contest.find({ 
            contestDate: { $gt: new Date() } 
        }).countDocuments();

        res.json({
            totalMembers: userCount,
            activeContests: contestCount,
            upcomingEvents: upcomingContests,
            onlineNow: Math.floor(Math.random() * 50) + 20 // Simulated online count
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all contests
app.get('/api/contests', async (req, res) => {
    try {
        const contests = await Contest.find()
            .populate('userId', 'gamertag')
            .sort({ contestDate: 1 })
            .limit(10);
        res.json(contests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve HTML for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Visit http://localhost:${PORT} to see your gaming community site`);
});
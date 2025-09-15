// TrendzN Full-Stack Backend - Professional Grade
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));

// Create uploads directory
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trendzn';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Error:', err));

// Database Schemas
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    avatar: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date },
    isActive: { type: Boolean, default: true }
});

const TrendSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String },
    views: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    memeScore: { type: Number, default: 0 },
    status: { type: String, enum: ['trending', 'viral', 'hot', 'rising'], default: 'trending' },
    tags: [String],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const TemplateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    imageUrl: { type: String, required: true },
    icon: { type: String, default: '🎭' },
    uses: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    tags: [String],
    isPopular: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

const MemeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template' },
    trendId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trend' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    isPublic: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const AnalyticsSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    totalUsers: { type: Number, default: 0 },
    totalTrends: { type: Number, default: 0 },
    totalTemplates: { type: Number, default: 0 },
    totalMemes: { type: Number, default: 0 },
    dailyViews: { type: Number, default: 0 },
    dailyShares: { type: Number, default: 0 }
});

// Models
const User = mongoose.model('User', UserSchema);
const Trend = mongoose.model('Trend', TrendSchema);
const Template = mongoose.model('Template', TemplateSchema);
const Meme = mongoose.model('Meme', MemeSchema);
const Analytics = mongoose.model('Analytics', AnalyticsSchema);

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// JWT Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'trendzn-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Admin middleware
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// ===== AUTHENTICATION ROUTES =====

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });
        
        if (existingUser) {
            return res.status(400).json({ 
                error: 'User already exists' 
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);
        
        // Create user
        const user = new User({
            username,
            email,
            password: hashedPassword
        });
        
        await user.save();
        
        // Generate token
        const token = jwt.sign(
            { 
                userId: user._id, 
                username: user.username,
                role: user.role 
            },
            process.env.JWT_SECRET || 'trendzn-secret-key',
            { expiresIn: '7d' }
        );
        
        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        
        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        
        // Generate token
        const token = jwt.sign(
            { 
                userId: user._id, 
                username: user.username,
                role: user.role 
            },
            process.env.JWT_SECRET || 'trendzn-secret-key',
            { expiresIn: '7d' }
        );
        
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== TRENDS ROUTES =====

// Get all trends
app.get('/api/trends', async (req, res) => {
    try {
        const { category, status, page = 1, limit = 10 } = req.query;
        
        let filter = {};
        if (category && category !== 'all') filter.category = category;
        if (status) filter.status = status;
        
        const trends = await Trend.find(filter)
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
            
        const total = await Trend.countDocuments(filter);
        
        res.json({
            trends,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create trend
app.post('/api/trends', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const { title, description, category, tags } = req.body;
        
        const trend = new Trend({
            title,
            description,
            category,
            tags: tags ? tags.split(',') : [],
            imageUrl: req.file ? `/uploads/${req.file.filename}` : '',
            createdBy: req.user.userId
        });
        
        await trend.save();
        await trend.populate('createdBy', 'username');
        
        res.status(201).json({
            message: 'Trend created successfully',
            trend
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update trend views
app.post('/api/trends/:id/view', async (req, res) => {
    try {
        const trend = await Trend.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        );
        
        if (!trend) {
            return res.status(404).json({ error: 'Trend not found' });
        }
        
        res.json({ message: 'View recorded', views: trend.views });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== TEMPLATES ROUTES =====

// Get all templates
app.get('/api/templates', async (req, res) => {
    try {
        const { category, page = 1, limit = 10 } = req.query;
        
        let filter = {};
        if (category && category !== 'popular') filter.category = category;
        
        let sort = { createdAt: -1 };
        if (category === 'popular') sort = { uses: -1, rating: -1 };
        
        const templates = await Template.find(filter)
            .populate('createdBy', 'username')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit);
            
        const total = await Template.countDocuments(filter);
        
        res.json({
            templates,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create template
app.post('/api/templates', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const { name, description, category, icon, tags } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ error: 'Image is required' });
        }
        
        const template = new Template({
            name,
            description,
            category,
            icon: icon || '🎭',
            tags: tags ? tags.split(',') : [],
            imageUrl: `/uploads/${req.file.filename}`,
            createdBy: req.user.userId
        });
        
        await template.save();
        await template.populate('createdBy', 'username');
        
        res.status(201).json({
            message: 'Template created successfully',
            template
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update template usage
app.post('/api/templates/:id/use', async (req, res) => {
    try {
        const template = await Template.findByIdAndUpdate(
            req.params.id,
            { $inc: { uses: 1 } },
            { new: true }
        );
        
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }
        
        res.json({ message: 'Usage recorded', uses: template.uses });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== MEMES ROUTES =====

// Get user memes
app.get('/api/memes', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        
        const memes = await Meme.find({ createdBy: req.user.userId })
            .populate('templateId', 'name icon')
            .populate('trendId', 'title')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
            
        const total = await Meme.countDocuments({ createdBy: req.user.userId });
        
        res.json({
            memes,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create meme
app.post('/api/memes', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const { title, templateId, trendId } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ error: 'Meme image is required' });
        }
        
        const meme = new Meme({
            title,
            imageUrl: `/uploads/${req.file.filename}`,
            templateId: templateId || null,
            trendId: trendId || null,
            createdBy: req.user.userId
        });
        
        await meme.save();
        await meme.populate('templateId', 'name icon');
        await meme.populate('trendId', 'title');
        
        res.status(201).json({
            message: 'Meme created successfully',
            meme
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== ADMIN ROUTES =====

// Admin Dashboard Stats
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const stats = {
            totalUsers: await User.countDocuments(),
            totalTrends: await Trend.countDocuments(),
            totalTemplates: await Template.countDocuments(),
            totalMemes: await Meme.countDocuments(),
            activeUsers: await User.countDocuments({ isActive: true }),
            viralTrends: await Trend.countDocuments({ status: 'viral' }),
            popularTemplates: await Template.countDocuments({ isPopular: true }),
            todaysMemes: await Meme.countDocuments({
                createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            })
        };
        
        // Calculate growth
        const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
        const yesterdayStats = {
            users: await User.countDocuments({ createdAt: { $lt: yesterday } }),
            trends: await Trend.countDocuments({ createdAt: { $lt: yesterday } }),
            templates: await Template.countDocuments({ createdAt: { $lt: yesterday } }),
            memes: await Meme.countDocuments({ createdAt: { $lt: yesterday } })
        };
        
        const growth = {
            users: ((stats.totalUsers - yesterdayStats.users) / (yesterdayStats.users || 1) * 100).toFixed(1),
            trends: ((stats.totalTrends - yesterdayStats.trends) / (yesterdayStats.trends || 1) * 100).toFixed(1),
            templates: ((stats.totalTemplates - yesterdayStats.templates) / (yesterdayStats.templates || 1) * 100).toFixed(1),
            memes: ((stats.totalMemes - yesterdayStats.memes) / (yesterdayStats.memes || 1) * 100).toFixed(1)
        };
        
        res.json({ stats, growth });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin - Get all users
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        
        let filter = {};
        if (search) {
            filter = {
                $or: [
                    { username: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            };
        }
        
        const users = await User.find(filter)
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
            
        const total = await User.countDocuments(filter);
        
        res.json({
            users,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin - Update user
app.put('/api/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { role, isActive } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role, isActive },
            { new: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({
            message: 'User updated successfully',
            user
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin - Delete trend
app.delete('/api/admin/trends/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const trend = await Trend.findByIdAndDelete(req.params.id);
        
        if (!trend) {
            return res.status(404).json({ error: 'Trend not found' });
        }
        
        // Delete associated image
        if (trend.imageUrl) {
            const imagePath = path.join(__dirname, 'uploads', path.basename(trend.imageUrl));
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        
        res.json({ message: 'Trend deleted successfully' });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin - Delete template
app.delete('/api/admin/templates/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const template = await Template.findByIdAndDelete(req.params.id);
        
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }
        
        // Delete associated image
        if (template.imageUrl) {
            const imagePath = path.join(__dirname, 'uploads', path.basename(template.imageUrl));
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        
        res.json({ message: 'Template deleted successfully' });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== ANALYTICS ROUTES =====

// Update daily analytics
app.post('/api/analytics/update', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let analytics = await Analytics.findOne({ date: today });
        
        if (!analytics) {
            analytics = new Analytics({
                date: today,
                totalUsers: await User.countDocuments(),
                totalTrends: await Trend.countDocuments(),
                totalTemplates: await Template.countDocuments(),
                totalMemes: await Meme.countDocuments()
            });
        } else {
            analytics.totalUsers = await User.countDocuments();
            analytics.totalTrends = await Trend.countDocuments();
            analytics.totalTemplates = await Template.countDocuments();
            analytics.totalMemes = await Meme.countDocuments();
        }
        
        await analytics.save();
        
        res.json({ message: 'Analytics updated' });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get analytics data
app.get('/api/analytics', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { days = 7 } = req.query;
        
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        const analytics = await Analytics.find({
            date: { $gte: startDate }
        }).sort({ date: 1 });
        
        res.json(analytics);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== UTILITY ROUTES =====

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Search
app.get('/api/search', async (req, res) => {
    try {
        const { q, type = 'all' } = req.query;
        
        if (!q) {
            return res.status(400).json({ error: 'Search query required' });
        }
        
        const searchRegex = { $regex: q, $options: 'i' };
        const results = {};
        
        if (type === 'all' || type === 'trends') {
            results.trends = await Trend.find({
                $or: [
                    { title: searchRegex },
                    { description: searchRegex },
                    { tags: searchRegex }
                ]
            }).limit(5);
        }
        
        if (type === 'all' || type === 'templates') {
            results.templates = await Template.find({
                $or: [
                    { name: searchRegex },
                    { description: searchRegex },
                    { tags: searchRegex }
                ]
            }).limit(5);
        }
        
        res.json(results);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handler
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 TrendzN Server running on port ${PORT}`);
    console.log(`📱 Frontend: http://localhost:${PORT}`);
    console.log(`🔧 API: http://localhost:${PORT}/api`);
    
    // Update analytics on startup
    setTimeout(() => {
        fetch(`http://localhost:${PORT}/api/analytics/update`, { method: 'POST' })
            .catch(err => console.log('Analytics update failed:', err.message));
    }, 2000);
});

module.exports = app;
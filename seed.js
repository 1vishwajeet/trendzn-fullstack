// TrendzN Database Seeder - Sample Data
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trendzn';

// Database Schemas (copy from server.js)
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

// Models
const User = mongoose.model('User', UserSchema);
const Trend = mongoose.model('Trend', TrendSchema);
const Template = mongoose.model('Template', TemplateSchema);

// Sample Data
const sampleUsers = [
    {
        username: 'admin',
        email: 'admin@trendzn.com',
        password: 'TrendzN2025!',
        role: 'admin',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
    },
    {
        username: 'memecreator',
        email: 'creator@trendzn.com',
        password: 'password123',
        role: 'user',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=creator'
    },
    {
        username: 'viralmaster',
        email: 'viral@trendzn.com',
        password: 'password123',
        role: 'user',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=viral'
    },
    {
        username: 'trendwatcher',
        email: 'trends@trendzn.com',
        password: 'password123',
        role: 'user',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=trends'
    }
];

const sampleTrends = [
    {
        title: '🤖 AI Bot Becomes TikTok Star',
        description: 'ChatGPT clone gains TikTok access, roasts influencers, gets 15M followers and brand deals.',
        category: 'tech',
        views: 45000000,
        shares: 892000,
        memeScore: 10,
        status: 'viral',
        tags: ['AI', 'TikTok', 'influencers', 'viral', 'technology']
    },
    {
        title: '💎 Gen-Z Crypto Legend',
        description: 'Student turns $50 into $2B trading meme coins from McDonald\'s WiFi. Peak Gen-Z energy.',
        category: 'crypto',
        views: 23000000,
        shares: 1200000,
        memeScore: 9,
        status: 'viral',
        tags: ['crypto', 'meme coins', 'trading', 'GenZ', 'money']
    },
    {
        title: '🎭 Netflix Destroys Dating',
        description: 'Reality show causes mass dating app deletion. Everyone expects AI matchmaking now.',
        category: 'entertainment',
        views: 12000000,
        shares: 650000,
        memeScore: 8,
        status: 'hot',
        tags: ['Netflix', 'dating apps', 'reality TV', 'relationships']
    },
    {
        title: '🚀 SpaceX Memes Go Viral',
        description: 'Elon Musk\'s rocket launch creates endless meme content. Internet breaks with creativity.',
        category: 'tech',
        views: 18000000,
        shares: 890000,
        memeScore: 9,
        status: 'hot',
        tags: ['SpaceX', 'Elon Musk', 'rockets', 'space', 'memes']
    },
    {
        title: '🎮 Gaming Streamer Epic Fail',
        description: 'Streamer accidentally reveals personal info, becomes meme legend overnight.',
        category: 'entertainment',
        views: 8500000,
        shares: 420000,
        memeScore: 7,
        status: 'rising',
        tags: ['gaming', 'streaming', 'fail', 'Twitch', 'privacy']
    },
    {
        title: '⚽ World Cup Celebration Dance',
        description: 'Player\'s victory dance becomes global phenomenon. Everyone doing it now.',
        category: 'sports',
        views: 35000000,
        shares: 2100000,
        memeScore: 9,
        status: 'viral',
        tags: ['World Cup', 'soccer', 'dance', 'celebration', 'sports']
    },
    {
        title: '🏠 WFH Pet Interruptions',
        description: 'Cats and dogs stealing the show in virtual meetings become internet sensations.',
        category: 'tech',
        views: 6200000,
        shares: 310000,
        memeScore: 8,
        status: 'rising',
        tags: ['work from home', 'pets', 'virtual meetings', 'cats', 'dogs']
    },
    {
        title: '🎵 New Music Goes Instantly Viral',
        description: 'Unknown artist\'s song becomes #1 on TikTok in 24 hours, changes music industry.',
        category: 'entertainment',
        views: 28000000,
        shares: 1800000,
        memeScore: 9,
        status: 'viral',
        tags: ['music', 'TikTok', 'viral song', 'artist', 'industry']
    },
    {
        title: '🍕 Food Delivery Gone Wrong',
        description: 'Pizza delivery drone gets attacked by seagulls, creates hilarious meme content.',
        category: 'tech',
        views: 4500000,
        shares: 180000,
        memeScore: 7,
        status: 'trending',
        tags: ['food delivery', 'drones', 'seagulls', 'pizza', 'technology']
    },
    {
        title: '📱 App Crashes Globally',
        description: 'Major social media platform down for 6 hours, people remember real life exists.',
        category: 'tech',
        views: 15000000,
        shares: 750000,
        memeScore: 8,
        status: 'hot',
        tags: ['social media', 'outage', 'technology', 'digital detox']
    }
];

const sampleTemplates = [
    {
        name: 'Drake Pointing',
        description: 'Drake rejecting one thing and approving another',
        category: 'popular',
        imageUrl: '/api/placeholder/drake-pointing',
        icon: '👨‍🎤',
        uses: 15400,
        rating: 9.8,
        tags: ['drake', 'pointing', 'choice', 'preference'],
        isPopular: true
    },
    {
        name: 'Distracted Boyfriend',
        description: 'Man looking at another woman while girlfriend looks disapproving',
        category: 'popular',
        imageUrl: '/api/placeholder/distracted-boyfriend',
        icon: '👨‍💼',
        uses: 12300,
        rating: 9.5,
        tags: ['boyfriend', 'distracted', 'choice', 'temptation'],
        isPopular: true
    },
    {
        name: 'Surprised Pikachu',
        description: 'Pikachu with a shocked expression',
        category: 'reactions',
        imageUrl: '/api/placeholder/surprised-pikachu',
        icon: '⚡',
        uses: 18200,
        rating: 9.9,
        tags: ['pikachu', 'surprised', 'shock', 'pokemon'],
        isPopular: true
    },
    {
        name: 'This is Fine',
        description: 'Dog sitting in burning room saying everything is fine',
        category: 'reactions',
        imageUrl: '/api/placeholder/this-is-fine',
        icon: '🔥',
        uses: 9800,
        rating: 9.3,
        tags: ['dog', 'fire', 'fine', 'denial', 'chaos']
    },
    {
        name: 'Expanding Brain',
        description: 'Brain getting bigger with increasingly enlightened thoughts',
        category: 'story',
        imageUrl: '/api/placeholder/expanding-brain',
        icon: '🧠',
        uses: 7600,
        rating: 8.9,
        tags: ['brain', 'smart', 'evolution', 'enlightenment', 'growth']
    },
    {
        name: 'Woman Yelling at Cat',
        description: 'Woman pointing and yelling while cat sits at dinner table',
        category: 'comparison',
        imageUrl: '/api/placeholder/woman-yelling-cat',
        icon: '😾',
        uses: 11200,
        rating: 9.4,
        tags: ['woman', 'cat', 'yelling', 'argument', 'dinner']
    },
    {
        name: 'Stonks',
        description: 'Surreal 3D man in suit with "Stonks" text for financial humor',
        category: 'popular',
        imageUrl: '/api/placeholder/stonks',
        icon: '📈',
        uses: 13400,
        rating: 9.1,
        tags: ['stonks', 'stocks', 'money', 'finance', 'investment'],
        isPopular: true
    },
    {
        name: 'Change My Mind',
        description: 'Steven Crowder sitting at table with "Change My Mind" sign',
        category: 'comparison',
        imageUrl: '/api/placeholder/change-my-mind',
        icon: '🪑',
        uses: 8900,
        rating: 8.7,
        tags: ['debate', 'opinion', 'change mind', 'discussion', 'controversial']
    },
    {
        name: 'Spongebob Mocking',
        description: 'Spongebob in a mocking pose with alternating caps text',
        category: 'reactions',
        imageUrl: '/api/placeholder/spongebob-mocking',
        icon: '🧽',
        uses: 10500,
        rating: 9.2,
        tags: ['spongebob', 'mocking', 'sarcasm', 'alternating caps']
    },
    {
        name: 'Galaxy Brain',
        description: 'Four-panel brain evolution from small to cosmic',
        category: 'story',
        imageUrl: '/api/placeholder/galaxy-brain',
        icon: '🌌',
        uses: 6800,
        rating: 8.8,
        tags: ['galaxy', 'brain', 'evolution', 'cosmic', 'intelligence']
    },
    {
        name: 'Two Buttons',
        description: 'Person sweating over choosing between two difficult options',
        category: 'comparison',
        imageUrl: '/api/placeholder/two-buttons',
        icon: '🔴',
        uses: 9200,
        rating: 8.6,
        tags: ['choice', 'decision', 'buttons', 'dilemma', 'sweating']
    },
    {
        name: 'Bernie Sanders',
        description: 'Bernie Sanders sitting with mittens at inauguration',
        category: 'reactions',
        imageUrl: '/api/placeholder/bernie-sanders',
        icon: '🧤',
        uses: 7300,
        rating: 8.9,
        tags: ['bernie', 'sanders', 'mittens', 'sitting', 'cold']
    }
];

// Seeder Functions
async function seedUsers() {
    console.log('🌱 Seeding users...');
    
    for (const userData of sampleUsers) {
        try {
            const hashedPassword = await bcrypt.hash(userData.password, 12);
            const user = new User({
                ...userData,
                password: hashedPassword
            });
            await user.save();
            console.log(`✅ Created user: ${userData.username}`);
        } catch (error) {
            if (error.code === 11000) {
                console.log(`⚠️  User already exists: ${userData.username}`);
            } else {
                console.error(`❌ Error creating user ${userData.username}:`, error.message);
            }
        }
    }
}

async function seedTrends() {
    console.log('🌱 Seeding trends...');
    
    // Get admin user to associate trends
    const adminUser = await User.findOne({ role: 'admin' });
    
    for (const trendData of sampleTrends) {
        try {
            const trend = new Trend({
                ...trendData,
                createdBy: adminUser._id
            });
            await trend.save();
            console.log(`✅ Created trend: ${trendData.title}`);
        } catch (error) {
            console.error(`❌ Error creating trend ${trendData.title}:`, error.message);
        }
    }
}

async function seedTemplates() {
    console.log('🌱 Seeding templates...');
    
    // Get admin user to associate templates
    const adminUser = await User.findOne({ role: 'admin' });
    
    for (const templateData of sampleTemplates) {
        try {
            const template = new Template({
                ...templateData,
                createdBy: adminUser._id
            });
            await template.save();
            console.log(`✅ Created template: ${templateData.name}`);
        } catch (error) {
            console.error(`❌ Error creating template ${templateData.name}:`, error.message);
        }
    }
}

// Main seeder function
async function seedDatabase() {
    try {
        console.log('🔥 Starting TrendzN Database Seeding...');
        
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');
        
        // Clear existing data
        const clearData = process.argv.includes('--clear');
        if (clearData) {
            console.log('🧹 Clearing existing data...');
            await User.deleteMany({});
            await Trend.deleteMany({});
            await Template.deleteMany({});
            console.log('✅ Existing data cleared');
        }
        
        // Seed data
        await seedUsers();
        await seedTrends();
        await seedTemplates();
        
        // Display summary
        const userCount = await User.countDocuments();
        const trendCount = await Trend.countDocuments();
        const templateCount = await Template.countDocuments();
        
        console.log('\n🎉 Database seeding completed!');
        console.log('📊 Summary:');
        console.log(`   👥 Users: ${userCount}`);
        console.log(`   📈 Trends: ${trendCount}`);
        console.log(`   🎭 Templates: ${templateCount}`);
        
        console.log('\n🔐 Default Admin Login:');
        console.log('   Email: admin@trendzn.com');
        console.log('   Password: TrendzN2025!');
        
        console.log('\n🚀 Start your server with: npm run dev');
        
    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('📪 Database connection closed');
        process.exit(0);
    }
}

// Run seeder
if (require.main === module) {
    seedDatabase();
}

module.exports = { seedDatabase };
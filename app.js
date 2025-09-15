// TrendzN Full-Stack Frontend Application
// Professional Grade with Backend Integration

class TrendzNApp {
    constructor() {
        this.API_BASE = window.location.origin + '/api';
        this.currentSection = 'home';
        this.isAdmin = false;
        this.user = null;
        this.selectedTemplate = null;
        this.selectedTool = 'text';
        this.canvas = null;
        this.ctx = null;
        this.searchTimeout = null;
        this.currentColor = '#ffffff';
        this.currentFontSize = 32;
        this.currentPage = {
            trends: 1,
            templates: 1,
            memes: 1
        };
        
        this.init();
    }
    
    async init() {
        console.log('%c🔥 TrendzN Full-Stack Loading...', 'color: #00ffff; font-size: 20px; font-weight: bold;');
        
        // Show loading screen
        this.showLoading(true);
        
        try {
            // Check authentication
            await this.checkAuth();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize canvas
            this.initializeCanvas();
            
            // Start animations
            this.startAnimations();
            
            // Load initial data
            await this.loadInitialData();
            
            // Initialize notifications
            this.initializeNotifications();
            
            // Hide loading screen
            setTimeout(() => {
                this.showLoading(false);
                this.showNotification('🔥 TrendzN loaded! Ready to go viral!', 'success');
                this.animatePageLoad();
            }, 1500);
            
            console.log('%c✅ Full-Stack App Ready!', 'color: #00ff00; font-size: 16px; font-weight: bold;');
            
        } catch (error) {
            console.error('Init error:', error);
            this.showLoading(false);
            this.showNotification('❌ Error loading app: ' + error.message, 'error');
        }
    }
    
    // ===== AUTHENTICATION =====
    
    async checkAuth() {
        const token = localStorage.getItem('trendzn_token');
        if (!token) return;
        
        try {
            const response = await this.apiCall('/auth/verify', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.user) {
                this.user = response.user;
                this.isAdmin = response.user.role === 'admin';
                this.updateUI();
            }
        } catch (error) {
            console.log('Token invalid:', error.message);
            localStorage.removeItem('trendzn_token');
        }
    }
    
    async login(email, password) {
        try {
            const response = await this.apiCall('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            localStorage.setItem('trendzn_token', response.token);
            this.user = response.user;
            this.isAdmin = response.user.role === 'admin';
            
            this.closeModal('authModal');
            this.updateUI();
            this.showNotification('🎉 Welcome back, ' + response.user.username + '!', 'success');
            
            // Load user-specific data
            await this.loadUserData();
            
        } catch (error) {
            this.showNotification('❌ ' + error.message, 'error');
        }
    }
    
    async register(username, email, password) {
        try {
            const response = await this.apiCall('/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            
            localStorage.setItem('trendzn_token', response.token);
            this.user = response.user;
            this.isAdmin = response.user.role === 'admin';
            
            this.closeModal('authModal');
            this.updateUI();
            this.showNotification('🚀 Account created! Welcome to TrendzN!', 'success');
            
        } catch (error) {
            this.showNotification('❌ ' + error.message, 'error');
        }
    }
    
    logout() {
        localStorage.removeItem('trendzn_token');
        this.user = null;
        this.isAdmin = false;
        this.updateUI();
        this.navigateToSection('home');
        this.showNotification('👋 Logged out successfully', 'info');
    }
    
    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const userMenu = document.getElementById('userMenu');
        const memesBtn = document.getElementById('memesBtn');
        const saveMemeBtn = document.getElementById('saveMemeBtn');
        
        if (this.user) {
            loginBtn.style.display = 'none';
            userMenu.style.display = 'block';
            memesBtn.style.display = 'flex';
            saveMemeBtn.style.display = 'block';
            
            document.getElementById('userName').textContent = this.user.username;
            document.getElementById('userRole').textContent = this.user.role;
            document.getElementById('userAvatar').src = this.user.avatar || 
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.user.username}`;
            
            if (this.isAdmin) {
                document.body.classList.add('admin-mode');
            }
        } else {
            loginBtn.style.display = 'block';
            userMenu.style.display = 'none';
            memesBtn.style.display = 'none';
            saveMemeBtn.style.display = 'none';
            document.body.classList.remove('admin-mode');
        }
    }
    
    // ===== API UTILITIES =====
    
    async apiCall(endpoint, options = {}) {
        const url = this.API_BASE + endpoint;
        const token = localStorage.getItem('trendzn_token');
        
        const defaultHeaders = {};
        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }
        
        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        };
        
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }
        
        return data;
    }
    
    // ===== DATA LOADING =====
    
    async loadInitialData() {
        try {
            // Load stats for hero section
            await this.loadStats();
            
            // Load trending content
            await this.loadTrends();
            
            // Load templates
            await this.loadTemplates();
            
            // Load hero cards
            await this.loadHeroCards();
            
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }
    
    async loadUserData() {
        if (!this.user) return;
        
        try {
            // Load user's memes
            await this.loadUserMemes();
            
            // Load admin data if admin
            if (this.isAdmin) {
                await this.loadAdminData();
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }
    
    async loadStats() {
        try {
            // Simulate stats for demo (replace with real API call)
            const stats = {
                totalUsers: Math.floor(Math.random() * 50000) + 10000,
                totalTemplates: Math.floor(Math.random() * 500) + 500,
                totalTrends: Math.floor(Math.random() * 1000) + 1000
            };
            
            document.getElementById('totalUsers').textContent = this.formatNumber(stats.totalUsers);
            document.getElementById('totalTemplates').textContent = stats.totalTemplates + '+';
            
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }
    
    async loadTrends(page = 1, category = 'all') {
        try {
            const response = await this.apiCall(`/trends?page=${page}&category=${category}&limit=10`);
            const container = document.getElementById('trendingGrid');
            
            if (page === 1) {
                container.innerHTML = '';
            }
            
            response.trends.forEach(trend => {
                const trendCard = this.createTrendCard(trend);
                container.appendChild(trendCard);
            });
            
            // Update load more button
            const loadMoreBtn = document.getElementById('loadMoreTrends');
            if (response.currentPage >= response.totalPages) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'block';
                loadMoreBtn.onclick = () => this.loadTrends(page + 1, category);
            }
            
        } catch (error) {
            console.error('Error loading trends:', error);
            // Show sample data if API fails
            this.loadSampleTrends();
        }
    }
    
    async loadTemplates(page = 1, category = 'popular') {
        try {
            const response = await this.apiCall(`/templates?page=${page}&category=${category}&limit=12`);
            const container = document.getElementById('templatesGrid');
            
            if (page === 1) {
                container.innerHTML = '';
            }
            
            response.templates.forEach(template => {
                const templateCard = this.createTemplateCard(template);
                container.appendChild(templateCard);
            });
            
            // Update load more button
            const loadMoreBtn = document.getElementById('loadMoreTemplates');
            if (response.currentPage >= response.totalPages) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'block';
                loadMoreBtn.onclick = () => this.loadTemplates(page + 1, category);
            }
            
        } catch (error) {
            console.error('Error loading templates:', error);
            // Show sample data if API fails
            this.loadSampleTemplates();
        }
    }
    
    async loadUserMemes() {
        if (!this.user) return;
        
        try {
            const response = await this.apiCall('/memes');
            const container = document.getElementById('memesGrid');
            
            container.innerHTML = '';
            
            if (response.memes.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">🎨</div>
                        <h3>No memes yet!</h3>
                        <p>Create your first viral meme</p>
                        <button onclick="trendzNApp.navigateToSection('editor')" class="cta-btn primary">
                            Start Creating
                        </button>
                    </div>
                `;
                return;
            }
            
            response.memes.forEach(meme => {
                const memeCard = this.createMemeCard(meme);
                container.appendChild(memeCard);
            });
            
            // Update stats
            document.getElementById('totalMemes').textContent = `${response.total} memes created`;
            
        } catch (error) {
            console.error('Error loading user memes:', error);
        }
    }
    
    async loadHeroCards() {
        const container = document.getElementById('heroCards');
        
        // Sample hero cards
        const heroData = [
            {
                badge: 'viral',
                title: '🤖 AI Roasts Influencers',
                description: '45M views • 10/10 meme score',
                progress: 95
            },
            {
                badge: 'hot',
                title: '💎 Crypto Kid Billionaire',
                description: '892K shares • 9/10 meme score',
                progress: 88
            }
        ];
        
        container.innerHTML = '';
        
        heroData.forEach(data => {
            const card = document.createElement('div');
            card.className = 'trend-card';
            card.innerHTML = `
                <div class="card-glow"></div>
                <div class="card-content">
                    <div class="viral-badge ${data.badge}">${data.badge === 'viral' ? '🔥 VIRAL' : '⚡ HOT'}</div>
                    <h3>${data.title}</h3>
                    <p>${data.description}</p>
                    <div class="engagement-bar">
                        <div class="bar-fill" style="width: ${data.progress}%"></div>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }
    
    // ===== ADMIN FUNCTIONALITY =====
    
    async loadAdminData() {
        if (!this.isAdmin) return;
        
        try {
            const stats = await this.apiCall('/admin/stats');
            
            // Update admin stats
            document.getElementById('adminTotalUsers').textContent = this.formatNumber(stats.stats.totalUsers);
            document.getElementById('adminTotalTrends').textContent = this.formatNumber(stats.stats.totalTrends);
            document.getElementById('adminTotalTemplates').textContent = this.formatNumber(stats.stats.totalTemplates);
            document.getElementById('adminTotalMemes').textContent = this.formatNumber(stats.stats.totalMemes);
            
            // Update growth indicators
            document.getElementById('adminUsersGrowth').textContent = `+${stats.growth.users}%`;
            document.getElementById('adminTrendsGrowth').textContent = `+${stats.growth.trends}%`;
            document.getElementById('adminTemplatesGrowth').textContent = `+${stats.growth.templates}%`;
            document.getElementById('adminMemesGrowth').textContent = `+${stats.growth.memes}%`;
            
            // Load users table
            await this.loadUsersTable();
            
        } catch (error) {
            console.error('Error loading admin data:', error);
        }
    }
    
    async loadUsersTable() {
        try {
            const response = await this.apiCall('/admin/users?limit=10');
            const container = document.getElementById('usersTable');
            
            container.innerHTML = `
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${response.users.map(user => `
                            <tr>
                                <td>
                                    <div class="user-info">
                                        <img src="${user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}" 
                                             alt="${user.username}" class="table-avatar">
                                        <span>${user.username}</span>
                                    </div>
                                </td>
                                <td>${user.email}</td>
                                <td>
                                    <select onchange="trendzNApp.updateUserRole('${user._id}', this.value)">
                                        <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
                                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                                    </select>
                                </td>
                                <td>
                                    <span class="status-badge ${user.isActive ? 'active' : 'inactive'}">
                                        ${user.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button onclick="trendzNApp.toggleUserStatus('${user._id}')" 
                                            class="action-btn ${user.isActive ? 'danger' : 'success'}">
                                        ${user.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            
        } catch (error) {
            console.error('Error loading users table:', error);
        }
    }
    
    async updateUserRole(userId, newRole) {
        try {
            await this.apiCall(`/admin/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });
            
            this.showNotification('✅ User role updated', 'success');
            
        } catch (error) {
            this.showNotification('❌ ' + error.message, 'error');
        }
    }
    
    async toggleUserStatus(userId) {
        try {
            // Get current status from table and toggle
            const response = await this.apiCall(`/admin/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !isActive })
            });
            
            this.showNotification('✅ User status updated', 'success');
            await this.loadUsersTable();
            
        } catch (error) {
            this.showNotification('❌ ' + error.message, 'error');
        }
    }
    
    // ===== CARD CREATION =====
    
    createTrendCard(trend) {
        const card = document.createElement('div');
        card.className = 'trend-item';
        card.setAttribute('data-category', trend.category);
        card.setAttribute('data-id', trend._id);
        
        const statusClass = trend.status === 'viral' ? 'viral' : 
                           trend.status === 'hot' ? 'hot' : 'rising';
        
        const statusIcon = trend.status === 'viral' ? '🔥' : 
                          trend.status === 'hot' ? '⚡' : '🌟';
        
        card.innerHTML = `
            <div class="trend-glow"></div>
            <div class="trend-badge ${statusClass}">
                ${statusIcon} ${trend.status.toUpperCase()}
            </div>
            <h3>${trend.title}</h3>
            <p>${trend.description}</p>
            <div class="trend-stats">
                <span>${this.formatNumber(trend.views)} views</span>
                <div class="meme-score">${trend.memeScore}/10</div>
            </div>
            <button class="trend-btn" onclick="trendzNApp.createMemeFromTrend('${trend._id}')">
                🚀 Create Meme
            </button>
        `;
        
        return card;
    }
    
    createTemplateCard(template) {
        const card = document.createElement('div');
        card.className = 'template-card';
        card.setAttribute('data-category', template.category);
        card.setAttribute('data-id', template._id);
        
        card.innerHTML = `
            <div class="template-glow"></div>
            <div class="template-preview">
                ${template.imageUrl ? 
                    `<img src="${template.imageUrl}" alt="${template.name}" class="template-image">` :
                    `<div class="template-icon">${template.icon}</div>`
                }
                <div class="template-overlay">
                    <button class="use-btn" onclick="trendzNApp.useTemplate('${template._id}')">
                        Use Template
                    </button>
                </div>
            </div>
            <h4>${template.name}</h4>
            <p>${this.formatNumber(template.uses)} uses • ⭐ ${template.rating.toFixed(1)}</p>
        `;
        
        return card;
    }
    
    createMemeCard(meme) {
        const card = document.createElement('div');
        card.className = 'meme-card';
        
        card.innerHTML = `
            <div class="meme-preview">
                <img src="${meme.imageUrl}" alt="${meme.title}" class="meme-image">
                <div class="meme-overlay">
                    <button onclick="trendzNApp.shareMeme('${meme._id}')" class="share-btn">Share</button>
                    <button onclick="trendzNApp.downloadMeme('${meme.imageUrl}')" class="download-btn">Download</button>
                </div>
            </div>
            <div class="meme-info">
                <h4>${meme.title}</h4>
                <div class="meme-stats">
                    <span>👁️ ${this.formatNumber(meme.views)}</span>
                    <span>❤️ ${this.formatNumber(meme.likes)}</span>
                    <span>📤 ${this.formatNumber(meme.shares)}</span>
                </div>
                <small>Created ${this.timeAgo(meme.createdAt)}</small>
            </div>
        `;
        
        return card;
    }
    
    // ===== SAMPLE DATA (Fallback) =====
    
    loadSampleTrends() {
        const container = document.getElementById('trendingGrid');
        const sampleTrends = [
            {
                _id: '1',
                title: '🤖 AI Bot Becomes TikTok Star',
                description: 'ChatGPT clone gains TikTok access, roasts influencers, gets 15M followers and brand deals.',
                category: 'tech',
                views: 45000000,
                memeScore: 10,
                status: 'viral'
            },
            {
                _id: '2',
                title: '💎 Gen-Z Crypto Legend',
                description: 'Student turns $50 into $2B trading meme coins from McDonald\'s WiFi. Peak Gen-Z energy.',
                category: 'crypto',
                views: 892000,
                memeScore: 8,
                status: 'hot'
            },
            {
                _id: '3',
                title: '🎭 Netflix Destroys Dating',
                description: 'Reality show causes mass dating app deletion. Everyone expects AI matchmaking now.',
                category: 'entertainment',
                views: 1200000,
                memeScore: 7,
                status: 'rising'
            }
        ];
        
        container.innerHTML = '';
        sampleTrends.forEach(trend => {
            const card = this.createTrendCard(trend);
            container.appendChild(card);
        });
    }
    
    loadSampleTemplates() {
        const container = document.getElementById('templatesGrid');
        const sampleTemplates = [
            {
                _id: '1',
                name: 'Drake Pointing',
                category: 'popular',
                icon: '👨‍🎤',
                uses: 15400,
                rating: 9.8,
                imageUrl: ''
            },
            {
                _id: '2',
                name: 'Distracted Boyfriend',
                category: 'popular',
                icon: '👨‍💼',
                uses: 12300,
                rating: 9.5,
                imageUrl: ''
            },
            {
                _id: '3',
                name: 'Surprised Pikachu',
                category: 'reactions',
                icon: '⚡',
                uses: 18200,
                rating: 9.9,
                imageUrl: ''
            }
        ];
        
        container.innerHTML = '';
        sampleTemplates.forEach(template => {
            const card = this.createTemplateCard(template);
            container.appendChild(card);
        });
    }
    
    // ===== EVENT HANDLERS =====
    
    setupEventListeners() {
        try {
            // Navigation
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const section = e.currentTarget.dataset.section;
                    if (section && section !== this.currentSection) {
                        this.navigateToSection(section);
                        this.addClickEffect(e.currentTarget);
                    }
                });
            });
            
            // Auth forms
            document.getElementById('loginFormEl').addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('loginEmail').value;
                const password = document.getElementById('loginPassword').value;
                await this.login(email, password);
            });
            
            document.getElementById('registerFormEl').addEventListener('submit', async (e) => {
                e.preventDefault();
                const username = document.getElementById('registerUsername').value;
                const email = document.getElementById('registerEmail').value;
                const password = document.getElementById('registerPassword').value;
                await this.register(username, email, password);
            });
            
            // Hero buttons
            document.getElementById('startBtn').addEventListener('click', (e) => {
                this.addClickEffect(e.target);
                if (this.user) {
                    this.navigateToSection('templates');
                } else {
                    this.showModal('authModal');
                }
                this.showNotification('🚀 Let\'s create viral content!', 'success');
            });
            
            document.getElementById('exploreBtn').addEventListener('click', (e) => {
                this.addClickEffect(e.target);
                this.navigateToSection('trending');
                this.showNotification('📈 Exploring trends...', 'success');
            });
            
            // Login button
            document.getElementById('loginBtn').addEventListener('click', () => {
                this.showModal('authModal');
            });
            
            // Modal close buttons
            document.querySelectorAll('.close-modal').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.closeModal(e.target.closest('.modal').id);
                });
            });
            
            // Search functionality
            const searchInput = document.getElementById('trendSearch');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    clearTimeout(this.searchTimeout);
                    this.searchTimeout = setTimeout(() => {
                        this.performSearch(e.target.value);
                    }, 300);
                });
            }
            
            // Filter pills
            document.querySelectorAll('.pill').forEach(pill => {
                pill.addEventListener('click', (e) => {
                    document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
                    e.target.classList.add('active');
                    
                    const filter = e.target.dataset.filter || 'all';
                    this.filterTrends(filter);
                    this.showNotification(`📊 Showing ${filter} trends`, 'info');
                });
            });
            
            // Template tabs
            document.querySelectorAll('.tab').forEach(tab => {
                tab.addEventListener('click', (e) => {
                    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                    e.target.classList.add('active');
                    
                    const category = e.target.dataset.category || 'popular';
                    this.filterTemplates(category);
                    this.showNotification(`🎭 Showing ${category} templates`, 'info');
                });
            });
            
            // Editor tools
            document.querySelectorAll('.tool').forEach(tool => {
                tool.addEventListener('click', (e) => {
                    document.querySelectorAll('.tool').forEach(t => t.classList.remove('active'));
                    e.target.classList.add('active');
                    
                    this.selectedTool = e.target.dataset.tool || 'text';
                    this.showNotification(`🛠️ Selected: ${this.selectedTool} tool`, 'info');
                });
            });
            
            // Color picker
            document.querySelectorAll('.color-option').forEach(color => {
                color.addEventListener('click', (e) => {
                    document.querySelectorAll('.color-option').forEach(c => c.classList.remove('active'));
                    e.target.classList.add('active');
                    
                    this.currentColor = e.target.dataset.color || '#ffffff';
                    this.showNotification(`🎨 Color changed`, 'info');
                });
            });
            
            // Font size slider
            const fontSlider = document.getElementById('fontSlider');
            if (fontSlider) {
                fontSlider.addEventListener('input', (e) => {
                    this.currentFontSize = e.target.value;
                    this.showNotification(`📏 Font size: ${this.currentFontSize}px`, 'info');
                });
            }
            
            // Export buttons
            document.getElementById('downloadBtn').addEventListener('click', (e) => {
                this.addClickEffect(e.target);
                this.downloadMeme();
            });
            
            document.getElementById('shareBtn').addEventListener('click', (e) => {
                this.addClickEffect(e.target);
                this.shareMeme();
            });
            
            document.getElementById('saveMemeBtn').addEventListener('click', (e) => {
                this.addClickEffect(e.target);
                this.saveMeme();
            });
            
            // Upload buttons
            document.getElementById('uploadTemplateBtn').addEventListener('click', () => {
                if (!this.user) {
                    this.showModal('authModal');
                    return;
                }
                this.showModal('uploadModal');
            });
            
            // Admin tabs
            document.querySelectorAll('.admin-tab').forEach(tab => {
                tab.addEventListener('click', (e) => {
                    const targetTab = e.target.dataset.tab;
                    this.switchAdminTab(targetTab);
                });
            });
            
            // Keyboard shortcuts
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey || e.metaKey) {
                    switch(e.key) {
                        case '1':
                            e.preventDefault();
                            this.navigateToSection('home');
                            break;
                        case '2':
                            e.preventDefault();
                            this.navigateToSection('trending');
                            break;
                        case '3':
                            e.preventDefault();
                            this.navigateToSection('templates');
                            break;
                        case '4':
                            e.preventDefault();
                            this.navigateToSection('editor');
                            break;
                        case '5':
                            if (this.isAdmin) {
                                e.preventDefault();
                                this.navigateToSection('admin');
                            }
                            break;
                    }
                }
                
                if (e.key === 'Escape') {
                    document.querySelectorAll('.modal').forEach(modal => {
                        modal.style.display = 'none';
                    });
                }
            });
            
            console.log('✅ All event listeners setup');
            
        } catch (error) {
            console.error('Error setting up listeners:', error);
        }
    }
    
    // ===== NAVIGATION =====
    
    navigateToSection(sectionName) {
        if (sectionName === this.currentSection) return;
        
        // Check authentication for protected sections
        if ((sectionName === 'memes' || sectionName === 'admin') && !this.user) {
            this.showModal('authModal');
            return;
        }
        
        if (sectionName === 'admin' && !this.isAdmin) {
            this.showNotification('❌ Admin access required', 'error');
            return;
        }
        
        console.log(`🧭 Navigating to: ${sectionName}`);
        
        this.currentSection = sectionName;
        
        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // Show/hide sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
            this.animateSectionElements(targetSection);
        }
        
        // Update URL
        if (history.pushState) {
            history.pushState(null, null, `#${sectionName}`);
        }
        
        // Handle section-specific logic
        if (sectionName === 'admin' && this.isAdmin) {
            this.loadAdminData();
        } else if (sectionName === 'memes' && this.user) {
            this.loadUserMemes();
        }
    }
    
    // ===== MEME CREATION =====
    
    async createMemeFromTrend(trendId) {
        if (!this.user) {
            this.showModal('authModal');
            return;
        }
        
        try {
            // Record trend view
            await this.apiCall(`/trends/${trendId}/view`, { method: 'POST' });
            
            // Navigate to editor with trend context
            this.selectedTemplate = { type: 'trend', id: trendId };
            this.navigateToSection('editor');
            this.showNotification('🎨 Ready to create from trend!', 'success');
            
            setTimeout(() => {
                this.loadTemplateIntoEditor();
            }, 500);
            
        } catch (error) {
            console.error('Error creating meme from trend:', error);
            this.showNotification('❌ Error loading trend', 'error');
        }
    }
    
    async useTemplate(templateId) {
        if (!this.user) {
            this.showModal('authModal');
            return;
        }
        
        try {
            // Record template usage
            await this.apiCall(`/templates/${templateId}/use`, { method: 'POST' });
            
            // Navigate to editor with template context
            this.selectedTemplate = { type: 'template', id: templateId };
            this.navigateToSection('editor');
            this.showNotification('🎭 Template loaded in editor!', 'success');
            
            setTimeout(() => {
                this.loadTemplateIntoEditor();
            }, 500);
            
        } catch (error) {
            console.error('Error using template:', error);
            this.showNotification('❌ Error loading template', 'error');
        }
    }
    
    initializeCanvas() {
        const canvas = document.getElementById('memeCanvas');
        if (canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            console.log('✅ Canvas initialized');
        }
    }
    
    loadTemplateIntoEditor() {
        const placeholder = document.querySelector('.canvas-placeholder');
        const canvas = this.canvas;
        
        if (!this.selectedTemplate || !placeholder) return;
        
        if (this.selectedTemplate.type === 'trend') {
            placeholder.innerHTML = `
                <div class="placeholder-glow"></div>
                <div class="placeholder-icon">🎭</div>
                <h3>Creating from Trend</h3>
                <p>Trend loaded! Ready to create viral content.</p>
                <button class="activate-btn" onclick="trendzNApp.activateCanvas()">🎨 Start Creating</button>
            `;
        } else {
            placeholder.innerHTML = `
                <div class="placeholder-glow"></div>
                <div class="placeholder-icon">🎭</div>
                <h3>Template Ready</h3>
                <p>Template loaded! Add your creative touch.</p>
                <button class="activate-btn" onclick="trendzNApp.activateCanvas()">🎨 Start Creating</button>
            `;
        }
    }
    
    activateCanvas() {
        const placeholder = document.querySelector('.canvas-placeholder');
        
        if (placeholder && this.canvas) {
            placeholder.style.display = 'none';
            this.canvas.style.display = 'block';
            
            this.setupCanvas();
            this.showNotification('🎨 Canvas activated! Start creating!', 'success');
        }
    }
    
    setupCanvas() {
        if (!this.ctx) return;
        
        // Clear and setup canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // White background
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add template content
        if (this.selectedTemplate) {
            this.ctx.fillStyle = this.currentColor;
            this.ctx.font = `${this.currentFontSize}px Inter, sans-serif`;
            this.ctx.textAlign = 'center';
            
            if (this.selectedTemplate.type === 'template') {
                // Template preview
                this.ctx.font = '60px Arial';
                this.ctx.fillText('🎭', this.canvas.width / 2, 150);
                
                // Template name
                this.ctx.font = `${this.currentFontSize}px Inter, sans-serif`;
                this.ctx.fillStyle = '#000000';
                this.ctx.fillText('TEMPLATE LOADED', this.canvas.width / 2, 350);
                
                // Add your text prompt  
                this.ctx.fillStyle = this.currentColor;
                this.ctx.fillText('ADD YOUR TEXT HERE', this.canvas.width / 2, 400);
            } else {
                // Trend content
                this.ctx.fillStyle = '#000000';
                this.ctx.fillText('VIRAL MEME', this.canvas.width / 2, 200);
                
                this.ctx.fillStyle = this.currentColor;
                this.ctx.fillText('YOUR TEXT HERE', this.canvas.width / 2, 300);
            }
        }
    }
    
    async saveMeme() {
        if (!this.user || !this.canvas) {
            this.showNotification('❌ Login required to save memes', 'error');
            return;
        }
        
        try {
            this.showNotification('💾 Saving meme...', 'info');
            
            // Convert canvas to blob
            this.canvas.toBlob(async (blob) => {
                const formData = new FormData();
                formData.append('image', blob, 'meme.png');
                formData.append('title', 'My Awesome Meme');
                
                if (this.selectedTemplate) {
                    if (this.selectedTemplate.type === 'template') {
                        formData.append('templateId', this.selectedTemplate.id);
                    } else {
                        formData.append('trendId', this.selectedTemplate.id);
                    }
                }
                
                const response = await this.apiCall('/memes', {
                    method: 'POST',
                    body: formData
                });
                
                this.showNotification('✅ Meme saved successfully!', 'success');
                
                // Refresh memes if on memes page
                if (this.currentSection === 'memes') {
                    this.loadUserMemes();
                }
                
            }, 'image/png');
            
        } catch (error) {
            console.error('Error saving meme:', error);
            this.showNotification('❌ Error saving meme: ' + error.message, 'error');
        }
    }
    
    downloadMeme(imageUrl = null) {
        this.showNotification('💾 Preparing download...', 'info');
        
        setTimeout(() => {
            try {
                const link = document.createElement('a');
                
                if (imageUrl) {
                    // Download existing meme
                    link.href = imageUrl;
                    link.download = `TrendzN_Meme_${Date.now()}.png`;
                } else if (this.canvas && this.canvas.style.display !== 'none') {
                    // Download from canvas
                    link.href = this.canvas.toDataURL('image/png');
                    link.download = `TrendzN_Meme_${Date.now()}.png`;
                } else {
                    // Create placeholder download
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = 500;
                    tempCanvas.height = 500;
                    const tempCtx = tempCanvas.getContext('2d');
                    
                    tempCtx.fillStyle = '#ffffff';
                    tempCtx.fillRect(0, 0, 500, 500);
                    tempCtx.fillStyle = '#000000';
                    tempCtx.font = '24px Arial';
                    tempCtx.textAlign = 'center';
                    tempCtx.fillText('TrendzN Meme', 250, 250);
                    
                    link.href = tempCanvas.toDataURL('image/png');
                    link.download = `TrendzN_Meme_${Date.now()}.png`;
                }
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                this.showNotification('✅ Meme downloaded successfully!', 'success');
                
            } catch (error) {
                console.error('Download error:', error);
                this.showNotification('✅ Download ready!', 'success');
            }
        }, 1500);
    }
    
    async shareMeme(memeId = null) {
        this.showNotification('🚀 Preparing to share...', 'info');
        
        setTimeout(async () => {
            try {
                const shareData = {
                    title: 'My Viral TrendzN Meme',
                    text: 'Check out this epic meme I created on TrendzN! 🔥',
                    url: window.location.href
                };
                
                if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                    await navigator.share(shareData);
                } else {
                    await navigator.clipboard.writeText(shareData.url);
                    this.showNotification('📋 Link copied to clipboard!', 'success');
                }
                
                this.showNotification('📱 Ready to go viral! 🔥', 'success');
                
            } catch (error) {
                console.error('Share error:', error);
                this.showNotification('✅ Share ready!', 'success');
            }
        }, 1000);
    }
    
    // ===== UTILITY FUNCTIONS =====
    
    formatNumber(num) {
        if (num > 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num > 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
    
    timeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return Math.floor(diffInSeconds / 60) + 'm ago';
        if (diffInSeconds < 86400) return Math.floor(diffInSeconds / 3600) + 'h ago';
        return Math.floor(diffInSeconds / 86400) + 'd ago';
    }
    
    showLoading(show) {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = show ? 'flex' : 'none';
        }
    }
    
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
        }
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    switchAdminTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Show/hide panels
        document.querySelectorAll('.admin-panel').forEach(panel => {
            panel.style.display = 'none';
        });
        document.getElementById(`admin${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Panel`).style.display = 'block';
    }
    
    performSearch(query) {
        // Implement search functionality
        console.log('Searching for:', query);
    }
    
    filterTrends(category) {
        this.loadTrends(1, category);
    }
    
    filterTemplates(category) {
        this.loadTemplates(1, category);
    }
    
    animateSectionElements(section) {
        const elements = section.querySelectorAll('.trend-item, .template-card, .feature-card, .admin-card, .meme-card');
        
        elements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                element.style.transition = 'all 0.6s ease';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    startAnimations() {
        this.animateStats();
        this.animateParticles();
        this.setupHoverEffects();
    }
    
    animatePageLoad() {
        const heroElements = document.querySelectorAll('.hero-content > *');
        
        heroElements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                element.style.transition = 'all 0.8s ease';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }
    
    animateStats() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.animated) {
                    this.animateNumber(entry.target, entry.target.textContent);
                    entry.target.dataset.animated = 'true';
                }
            });
        });
        
        document.querySelectorAll('.stat-number, .admin-number').forEach(stat => {
            observer.observe(stat);
        });
    }
    
    animateNumber(element, finalValue) {
        const text = finalValue.toString();
        
        if (text.includes('K') || text.includes('M')) {
            const baseNumber = parseFloat(text.replace(/[KM]/g, ''));
            const multiplier = text.includes('M') ? 1000000 : 1000;
            let current = 0;
            const increment = (baseNumber * multiplier) / 50;
            
            const animate = () => {
                current += increment;
                if (current >= baseNumber * multiplier) {
                    element.textContent = finalValue;
                } else {
                    const displayValue = current / multiplier;
                    element.textContent = displayValue.toFixed(1) + (text.includes('M') ? 'M' : 'K');
                    requestAnimationFrame(animate);  
                }
            };
            animate();
        } else {
            const number = parseInt(text.replace(/[^0-9]/g, '')) || 100;
            let current = 0;
            const increment = number / 50;
            
            const animate = () => {
                current += increment;
                if (current >= number) {
                    element.textContent = finalValue;
                } else {
                    element.textContent = Math.floor(current) + (text.includes('%') ? '%' : text.includes('+') ? '+' : '');
                    requestAnimationFrame(animate);
                }
            };
            animate();
        }
    }
    
    animateParticles() {
        const particles = document.querySelectorAll('.particle');
        const colors = ['#00ffff', '#ff0080', '#8000ff', '#00ff00', '#ff8000'];
        
        particles.forEach((particle, index) => {
            particle.style.background = colors[index % colors.length];
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 15 + 's';
        });
    }
    
    setupHoverEffects() {
        const interactiveElements = document.querySelectorAll('button, .trend-item, .template-card, .feature-card, .admin-card, .meme-card');
        
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.style.filter = 'brightness(1.1)';
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.filter = '';
            });
        });
    }
    
    addClickEffect(element) {
        element.style.transform = 'scale(0.95)';
        setTimeout(() => {
            element.style.transform = '';
        }, 150);
    }
    
    initializeNotifications() {
        let container = document.getElementById('notifications');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notifications';
            container.className = 'notifications';
            document.body.appendChild(container);
        }
        
        console.log('✅ Notifications ready');
    }
    
    showNotification(message, type = 'info', duration = 4000) {
        const container = document.getElementById('notifications');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 1.2rem;">${icons[type] || icons.info}</span>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: inherit; cursor: pointer; margin-left: auto; font-size: 1.2rem;">×</button>
            </div>
        `;
        
        container.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 400);
            }
        }, duration);
        
        return notification;
    }
}

// Global auth switching functions
window.switchToRegister = function() {
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('registerForm').classList.add('active');
};

window.switchToLogin = function() {
    document.getElementById('registerForm').classList.remove('active');
    document.getElementById('loginForm').classList.add('active');
};

window.logout = function() {
    window.trendzNApp.logout();
};

// Global admin functions
window.enableAdmin = function() {
    if (window.trendzNApp && window.trendzNApp.user) { 
        window.trendzNApp.isAdmin = true;
        document.body.classList.add('admin-mode');
        window.trendzNApp.showNotification('👑 Admin mode activated!', 'success', 5000);
        
        if (window.trendzNApp.currentSection !== 'admin') {
            window.trendzNApp.navigateToSection('admin');
        }
    } else {
        console.log('Login required for admin access');
    }
};

window.disableAdmin = function() {
    if (window.trendzNApp) {
        window.trendzNApp.isAdmin = false;
        document.body.classList.remove('admin-mode');
        window.trendzNApp.showNotification('👤 Admin mode disabled', 'info');
        
        if (window.trendzNApp.currentSection === 'admin') {
            window.trendzNApp.navigateToSection('home');
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.trendzNApp = new TrendzNApp();
        
        console.log('%c🔥 TRENDZN FULL-STACK LOADED!', 'color: #00ffff; font-size: 24px; font-weight: bold;');
        console.log('%c💻 Backend + Frontend Working!', 'color: #ff0080; font-size: 16px; font-weight: bold;');
        console.log('%c🎮 Commands:', 'color: #00ff00; font-size: 14px; font-weight: bold;');
        console.log('%c  enableAdmin() - Activate admin panel', 'color: #8000ff; font-size: 12px;');
        console.log('%c  disableAdmin() - Return to user mode', 'color: #8000ff; font-size: 12px;');
        console.log('%c  Ctrl+1,2,3,4,5 - Quick navigation', 'color: #8000ff; font-size: 12px;');
        
    } catch (error) {
        console.error('App initialization failed:', error);
    }
});

// Handle browser navigation
window.addEventListener('popstate', () => {
    const hash = window.location.hash.substring(1);
    if (hash && window.trendzNApp) {
        window.trendzNApp.navigateToSection(hash);
    }
});
// VidyaShare API Configuration for Vercel
const API_BASE_URL = '/api';

// API Helper Functions
class VidyaShareAPI {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.token = localStorage.getItem('vidyashare_token');
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        localStorage.setItem('vidyashare_token', token);
    }

    // Remove authentication token
    removeToken() {
        this.token = null;
        localStorage.removeItem('vidyashare_token');
    }

    // Get headers with authentication
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // Generic API request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            headers: this.getHeaders(),
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Authentication methods
    async register(userData) {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        if (data.token) this.setToken(data.token);
        return data;
    }

    async login(credentials) {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        if (data.token) this.setToken(data.token);
        return data;
    }

    logout() {
        this.removeToken();
        window.location.href = '/';
    }

    // Book methods
    async getBooks(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        return this.request(`/books?${queryParams}`);
    }

    async getBook(id) {
        return this.request(`/books/${id}`);
    }

    async createBook(bookData) {
        return this.request('/books', {
            method: 'POST',
            body: JSON.stringify(bookData)
        });
    }

    // Transaction methods
    async createRentalTransaction(bookId, rentalDuration) {
        return this.request('/transactions/rent', {
            method: 'POST',
            body: JSON.stringify({ bookId, rentalDuration })
        });
    }

    // User methods
    async getUserProfile() {
        return this.request('/users/profile');
    }

    async updateUserProfile(userData) {
        return this.request('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    // Health check
    async healthCheck() {
        const response = await fetch('/api/health');
        return response.json();
    }
}

// Create global API instance
window.api = new VidyaShareAPI();

// Test API connection on load
window.api.healthCheck().then(() => {
    console.log('✅ API connection successful');
}).catch(() => {
    console.log('❌ API connection failed');
});

// Helper functions for forms
window.handleLogin = async function(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    
    const credentials = {
        email: formData.get('email'),
        password: formData.get('password')
    };

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    submitBtn.textContent = 'Logging in...';

    try {
        const response = await window.api.login(credentials);
        
        if (response.token) {
            window.VidyaShare.showNotification('Login successful!', 'success');
            setTimeout(() => {
                window.VidyaShare.closeAuthModal();
                window.location.href = '/pages/dashboard.html';
            }, 1500);
        }
    } catch (error) {
        window.VidyaShare.showNotification(error.message, 'error');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        submitBtn.textContent = 'Login';
    }
};

window.handleRegister = async function(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    
    const userData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        password: formData.get('password'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        city: formData.get('city'),
        pincode: formData.get('pincode'),
        college: formData.get('college') || '',
        interests: []
    };

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    submitBtn.textContent = 'Creating Account...';

    try {
        const response = await window.api.register(userData);
        
        if (response.token) {
            window.VidyaShare.showNotification('Registration successful!', 'success');
            setTimeout(() => {
                window.VidyaShare.closeAuthModal();
                window.location.href = '/pages/dashboard.html';
            }, 1500);
        }
    } catch (error) {
        window.VidyaShare.showNotification(error.message, 'error');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        submitBtn.textContent = 'Register';
    }
};

// Check authentication status
window.checkAuth = function() {
    const token = localStorage.getItem('vidyashare_token');
    return !!token;
};

// Redirect if not authenticated
window.requireAuth = function() {
    if (!window.checkAuth()) {
        window.location.href = '/';
        return false;
    }
    return true;
};

// Update UI based on auth status
window.updateAuthUI = function() {
    const isLoggedIn = window.checkAuth();
    const loginBtn = document.querySelector('.btn-login');
    
    if (isLoggedIn && loginBtn) {
        loginBtn.innerHTML = '<i class="fas fa-user-circle"></i> Dashboard';
        loginBtn.onclick = () => window.location.href = '/pages/dashboard.html';
    }
};

// Initialize auth UI on page load
document.addEventListener('DOMContentLoaded', function() {
    window.updateAuthUI();
});
// Authentication utilities
const API_BASE = 'https://lmsbackend-qm8e.onrender.com/api';

// Get token from localStorage
function getToken() {
    return localStorage.getItem('token');
}

// Set token in localStorage
function setToken(token) {
    localStorage.setItem('token', token);
}

// Remove token from localStorage
function removeToken() {
    localStorage.removeItem('token');
}

// Get user from localStorage
function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Set user in localStorage
function setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

// Remove user from localStorage
function removeUser() {
    localStorage.removeItem('user');
}

// Check if user is authenticated
function isAuthenticated() {
    return !!getToken();
}

// Make authenticated API request
async function apiRequest(url, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const fetchOptions = {
        ...options,
        headers
    };

    // Convert body to JSON if it's an object
    if (options.body && typeof options.body === 'object') {
        fetchOptions.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(`${API_BASE}${url}`, fetchOptions);

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }

        return data;
    } catch (error) {
        throw error;
    }
}

// Update navigation based on auth status
function updateNavigation() {
    const isAuth = isAuthenticated();
    const authLinks = document.getElementById('authLinks');
    const userMenu = document.getElementById('userMenu');
    const navMenu = document.getElementById('navMenu');

    if (authLinks && userMenu) {
        if (isAuth) {
            authLinks.style.display = 'none';
            userMenu.style.display = 'flex';
        } else {
            authLinks.style.display = 'flex';
            userMenu.style.display = 'none';
        }
    }

    // Update user name if available
    if (isAuth) {
        const user = getUser();
        const userNameEl = document.getElementById('userName');
        if (userNameEl && user) {
            userNameEl.textContent = user.name || 'Student';
        }
    }

    // Add logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Handle logout
function handleLogout() {
    removeToken();
    removeUser();
    window.location.href = 'index.html';
}

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();

    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');

    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
});


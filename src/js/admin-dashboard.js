// admin-dashboard.js

const API_BASE_URL = "http://localhost:8080/identity";

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Check Authentication & Role
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const data = await apiCall('/users/me');
        const user = data.result || data;

        const roles = user.roles || [];
        const isAdmin = roles.some(r => (r.name || r) === 'ADMIN');

        if (!isAdmin) {
            alert('Bạn không có quyền truy cập trang này.');
            window.location.href = 'home.html';
            return;
        }

        // Setup Initials
        const initials = (user.firstname || user.username || 'AD').substring(0, 2).toUpperCase();
        document.getElementById('admin-initials').textContent = initials;

    } catch (error) {
        console.error('Auth error:', error);
        window.location.href = 'login.html';
    }
});

// ===================================
// API WRAPPER & REFRESH LOGIC
// ===================================

let isRefreshing = false;
let refreshPromise = null;

async function refreshToken() {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token to refresh');
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });
        const data = await response.json();
        if (data.code === 1000 && data.result.token) {
            localStorage.setItem('token', data.result.token);
            return data.result.token;
        } else {
            throw new Error('Refresh failed');
        }
    } catch (error) {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
        throw error;
    }
}

async function apiCall(endpoint, options = {}, retryCount = 0) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        'Authorization': token ? `Bearer ${token}` : ''
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
        let data;
        try {
            data = await response.json();
        } catch (e) {
            console.error('Non-JSON response:', e);
            throw new Error('Server returned invalid JSON');
        }

        if (data.code === 1007 && retryCount === 0) {
            if (!isRefreshing) {
                isRefreshing = true;
                refreshPromise = refreshToken().finally(() => {
                    isRefreshing = false;
                    refreshPromise = null;
                });
            }
            await refreshPromise;
            return apiCall(endpoint, options, retryCount + 1);
        }

        return data;
    } catch (error) {
        console.error('API Call Error:', error);
        throw error;
    }
}

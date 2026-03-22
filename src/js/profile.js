const API_BASE_URL = "http://localhost:8080/identity";

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

        // Token expired
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

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Check Authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // 2. Load User Profile
    const user = await loadUserProfile();

    // 3. Setup Navigation (Tabs)
    setupNavigation();

    // 4. Handle URL actions (edit/password)
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    if (action === 'edit') {
        switchSection('section-edit');
    } else if (action === 'password') {
        switchSection('section-password');
    }

    // 5. Setup Forms
    setupInfoForm(user);
    setupPasswordForm();
});

async function loadUserProfile() {
    try {
        const data = await apiCall('/users/me');
        console.log('Profile data loaded:', data);
        
        // Handle wrapping in 'result' if present
        const user = data.result || data;

        if (user && (user.username || user.email || user.firstname)) {
            // Update Sidebar
            const fullName = `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.username || 'Người dùng';
            document.getElementById('sidebar-username').textContent = fullName;
            document.getElementById('sidebar-email').textContent = user.email;
            
            const initials = (user.firstname || user.username || 'U').substring(0, 2).toUpperCase();
            document.getElementById('profile-initials').textContent = initials;

            // Update Info Section
            console.log("Setting info-username to:", user.username);
            document.getElementById('info-username').innerText = user.username || 'Chưa cập nhật';
            document.getElementById('info-firstname').textContent = user.firstname || 'Chưa cập nhật';
            document.getElementById('info-lastname').textContent = user.lastname || 'Chưa cập nhật';
            document.getElementById('info-email').textContent = user.email;
            
            // Map 'dateOfBirth' correctly
            let displayDob = 'Chưa cập nhật';
            const dobValue = user.dateOfBirth;
            if (dobValue) {
                try {
                    const date = new Date(dobValue);
                    displayDob = date.toLocaleDateString('vi-VN');
                } catch(e) { displayDob = dobValue; }
            }
            document.getElementById('info-dob').textContent = displayDob;
            
            // Map 'roles' correctly
            const rolesArr = user.roles || [];
            const roleNames = rolesArr.map(r => r.name || r);
            document.getElementById('info-roles').textContent = roleNames.length > 0 ? roleNames.join(', ') : 'USER';

            // Show Admin Panel if applicable
            if (roleNames.includes('ADMIN')) {
                const adminBtn = document.getElementById('admin-nav-btn');
                if (adminBtn) adminBtn.style.display = 'flex';

                const adminEntry = document.getElementById('admin-entry-section');
                if (adminEntry) adminEntry.style.display = 'block';
            }

            // Pre-fill Edit Form
            document.getElementById('edit-username').value = user.username || '';
            document.getElementById('edit-firstname').value = user.firstname || '';
            document.getElementById('edit-lastname').value = user.lastname || '';
            document.getElementById('edit-dob').value = user.dateOfBirth || '';

            return user;
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        alert('Không thể tải thông tin hồ sơ.');
    }
}

function setupNavigation() {
    const btns = document.querySelectorAll('.nav-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
             const target = btn.dataset.target;
             switchSection(target);
        });
    });
}

function switchSection(sectionId) {
    // Update Buttons
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.nav-btn[data-target="${sectionId}"]`)?.classList.add('active');

    // Update Content
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId)?.classList.add('active');
}

function setupInfoForm(user) {
    const form = document.getElementById('edit-profile-form');
    const saveBtn = document.getElementById('save-info-btn');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const updateData = {
                username: document.getElementById('edit-username').value.trim(),
                firstname: document.getElementById('edit-firstname').value.trim(),
                lastname: document.getElementById('edit-lastname').value.trim(),
                dateOfBirth: document.getElementById('edit-dob').value
            };

            saveBtn.disabled = true;
            saveBtn.textContent = 'Đang lưu...';

            try {
                const data = await apiCall('/users/me', {
                    method: 'PUT',
                    body: JSON.stringify(updateData)
                });

                if (data.code === 1000) {
                    alert('Cập nhật thông tin thành công!');
                    location.reload(); // Refresh to update all UI parts
                } else {
                    alert(data.message || 'Lỗi cập nhật thông tin');
                }
            } catch (error) {
                console.error('Update error:', error);
            } finally {
                saveBtn.disabled = false;
                saveBtn.textContent = 'Lưu thay đổi';
            }
        });
    }
}

function setupPasswordForm() {
    const form = document.getElementById('change-password-form');
    const saveBtn = document.getElementById('save-password-btn');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const oldPassword = document.getElementById('old-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (newPassword !== confirmPassword) {
                alert('Mật khẩu mới không khớp!');
                return;
            }

            if (newPassword.length < 8) {
                alert('Mật khẩu mới phải có ít nhất 8 ký tự!');
                return;
            }

            saveBtn.disabled = true;
            saveBtn.textContent = 'Đang xử lý...';

            try {
                const data = await apiCall('/users/me/change-password', {
                    method: 'PUT',
                    body: JSON.stringify({ oldPassword, newPassword })
                });

                if (data.code === 1000) {
                    alert('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
                    localStorage.removeItem('token');
                    window.location.href = 'login.html';
                } else {
                    alert(data.message || 'Mật khẩu hiện tại không chính xác');
                }
            } catch (error) {
                console.error('Password change error:', error);
            } finally {
                saveBtn.disabled = false;
                saveBtn.textContent = 'Cập nhật mật khẩu';
            }
        });
    }
}

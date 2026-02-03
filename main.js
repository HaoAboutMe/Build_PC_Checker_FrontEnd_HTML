// ===================================
// API CONFIGURATION
// ===================================
const API_BASE_URL = 'http://localhost:8080/identity';

// ===================================
// ERROR CODES MAPPING
// ===================================
const ERROR_MESSAGES = {
    1000: 'Thành công',
    1001: 'Key message không hợp lệ',
    1002: 'Email đã tồn tại trong hệ thống',
    1003: 'Username phải có ít nhất 3 ký tự',
    1004: 'Mật khẩu phải có ít nhất 8 ký tự',
    1005: 'Email không đúng định dạng',
    1006: 'Người dùng không tồn tại',
    1007: 'Chưa đăng nhập hoặc token không hợp lệ',
    1008: 'Bạn không có quyền truy cập',
    1009: 'Tuổi không đủ yêu cầu (tối thiểu 5 tuổi)',
    9999: 'Lỗi không xác định'
};

// ===================================
// DOM ELEMENTS
// ===================================
const elements = {
    // Sections
    authSection: document.getElementById('auth-section'),
    infoSection: document.getElementById('info-section'),
    
    // Tabs
    loginTab: document.getElementById('login-tab'),
    registerTab: document.getElementById('register-tab'),
    
    // Forms
    loginForm: document.getElementById('login-form'),
    registerForm: document.getElementById('register-form'),
    
    // Login inputs
    loginEmail: document.getElementById('login-email'),
    loginPassword: document.getElementById('login-password'),
    loginBtn: document.getElementById('login-btn'),
    
    // Register inputs
    registerFirstname: document.getElementById('register-firstname'),
    registerLastname: document.getElementById('register-lastname'),
    registerUsername: document.getElementById('register-username'),
    registerEmail: document.getElementById('register-email'),
    registerPassword: document.getElementById('register-password'),
    registerDob: document.getElementById('register-dob'),
    registerBtn: document.getElementById('register-btn'),
    
    // User info
    userAvatar: document.getElementById('user-avatar'),
    avatarInitials: document.getElementById('avatar-initials'),
    userFullname: document.getElementById('user-fullname'),
    userUsername: document.getElementById('user-username'),
    userEmail: document.getElementById('user-email'),
    userDob: document.getElementById('user-dob'),
    userRoles: document.getElementById('user-roles'),
    logoutBtn: document.getElementById('logout-btn'),
    editProfileBtn: document.getElementById('edit-profile-btn'),
    editMyInfoBtn: document.getElementById('edit-my-info-btn'),
    adminPanelBtn: document.getElementById('admin-panel-btn'),
    
    // Admin Panel
    adminSection: document.getElementById('admin-section'),
    backToProfileBtn: document.getElementById('back-to-profile-btn'),
    usersTableBody: document.getElementById('users-table-body'),
    
    // Edit My Info Modal
    editMyInfoModal: document.getElementById('edit-my-info-modal'),
    editMyInfoOverlay: document.getElementById('edit-my-info-overlay'),
    closeEditMyInfoModal: document.getElementById('close-edit-my-info-modal'),
    editMyInfoForm: document.getElementById('edit-my-info-form'),
    editMyFirstname: document.getElementById('edit-my-firstname'),
    editMyLastname: document.getElementById('edit-my-lastname'),
    editMyUsername: document.getElementById('edit-my-username'),
    editMyDob: document.getElementById('edit-my-dob'),
    cancelEditMyInfo: document.getElementById('cancel-edit-my-info'),
    saveMyInfoBtn: document.getElementById('save-my-info-btn'),
    
    // Change Password Modal
    changePasswordBtn: document.getElementById('change-password-btn'),
    changePasswordModal: document.getElementById('change-password-modal'),
    changePasswordOverlay: document.getElementById('change-password-overlay'),
    closeChangePasswordModal: document.getElementById('close-change-password-modal'),
    changePasswordForm: document.getElementById('change-password-form'),
    oldPassword: document.getElementById('old-password'),
    newPassword: document.getElementById('new-password'),
    confirmPassword: document.getElementById('confirm-password'),
    cancelChangePassword: document.getElementById('cancel-change-password'),
    savePasswordBtn: document.getElementById('save-password-btn'),
    
    // Edit User Modal (Admin)
    editUserModal: document.getElementById('edit-user-modal'),
    editUserOverlay: document.getElementById('edit-user-overlay'),
    closeEditUserModal: document.getElementById('close-edit-user-modal'),
    editUserForm: document.getElementById('edit-user-form'),
    editUserId: document.getElementById('edit-user-id'),
    editUserFirstname: document.getElementById('edit-user-firstname'),
    editUserLastname: document.getElementById('edit-user-lastname'),
    editUserUsername: document.getElementById('edit-user-username'),
    editUserEmail: document.getElementById('edit-user-email'),
    editUserDob: document.getElementById('edit-user-dob'),
    cancelEditUser: document.getElementById('cancel-edit-user'),
    saveUserBtn: document.getElementById('save-user-btn'),
    
    // Admin Tabs
    adminTabs: document.getElementById('admin-tabs'),
    usersTabContent: document.getElementById('users-tab-content'),
    rolesTabContent: document.getElementById('roles-tab-content'),
    permissionsTabContent: document.getElementById('permissions-tab-content'),
    
    // Roles Management
    createRoleBtn: document.getElementById('create-role-btn'),
    rolesTableBody: document.getElementById('roles-table-body'),
    roleModal: document.getElementById('role-modal'),
    roleModalOverlay: document.getElementById('role-modal-overlay'),
    closeRoleModal: document.getElementById('close-role-modal'),
    roleModalTitle: document.getElementById('role-modal-title'),
    roleForm: document.getElementById('role-form'),
    roleOriginalName: document.getElementById('role-original-name'),
    roleName: document.getElementById('role-name'),
    roleDescription: document.getElementById('role-description'),
    rolePermissions: document.getElementById('role-permissions'),
    cancelRole: document.getElementById('cancel-role'),
    saveRoleBtn: document.getElementById('save-role-btn'),
    
    // Permissions Management
    createPermissionBtn: document.getElementById('create-permission-btn'),
    permissionsTableBody: document.getElementById('permissions-table-body'),
    permissionModal: document.getElementById('permission-modal'),
    permissionModalOverlay: document.getElementById('permission-modal-overlay'),
    closePermissionModal: document.getElementById('close-permission-modal'),
    permissionModalTitle: document.getElementById('permission-modal-title'),
    permissionForm: document.getElementById('permission-form'),
    permissionOriginalName: document.getElementById('permission-original-name'),
    permissionName: document.getElementById('permission-name'),
    permissionDescription: document.getElementById('permission-description'),
    cancelPermission: document.getElementById('cancel-permission'),
    savePermissionBtn: document.getElementById('save-permission-btn'),
    
    // Toast
    toast: document.getElementById('toast'),
    toastIcon: document.getElementById('toast-icon'),
    toastTitle: document.getElementById('toast-title'),
    toastMessage: document.getElementById('toast-message'),
    toastClose: document.getElementById('toast-close')
};

// ===================================
// UTILITY FUNCTIONS
// ===================================

/**
 * Show toast notification
 */
function showToast(title, message, type = 'info') {
    elements.toast.className = `toast ${type}`;
    elements.toastTitle.textContent = title;
    elements.toastMessage.textContent = message;
    
    setTimeout(() => {
        elements.toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        hideToast();
    }, 5000);
}

/**
 * Hide toast notification
 */
function hideToast() {
    elements.toast.classList.remove('show');
}

/**
 * Show error message under input field
 */
function showError(inputId, message) {
    const errorElement = document.getElementById(`${inputId}-error`);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

/**
 * Clear error message
 */
function clearError(inputId) {
    const errorElement = document.getElementById(`${inputId}-error`);
    if (errorElement) {
        errorElement.textContent = '';
    }
}

/**
 * Clear all errors in a form
 */
function clearAllErrors(formId) {
    const form = document.getElementById(formId);
    const errorElements = form.querySelectorAll('.error-message');
    errorElements.forEach(el => el.textContent = '');
}

/**
 * Set button loading state
 */
function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

/**
 * Format date from YYYY-MM-DD to DD/MM/YYYY
 */
function formatDate(dateString) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

/**
 * Calculate age from date of birth
 */
function calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

/**
 * Get initials from name
 */
function getInitials(firstname, lastname) {
    const firstInitial = firstname ? firstname.charAt(0).toUpperCase() : '';
    const lastInitial = lastname ? lastname.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
}

// ===================================
// VALIDATION FUNCTIONS
// ===================================

/**
 * Validate email format
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate username (min 3 characters)
 */
function validateUsername(username) {
    return username && username.length >= 3;
}

/**
 * Validate password (min 8 characters)
 */
function validatePassword(password) {
    return password && password.length >= 8;
}

/**
 * Validate date of birth (min age 5)
 */
function validateDateOfBirth(dob) {
    if (!dob) return false;
    const age = calculateAge(dob);
    return age >= 5;
}

/**
 * Validate login form
 */
function validateLoginForm() {
    let isValid = true;
    
    clearAllErrors('login-form');
    
    const email = elements.loginEmail.value.trim();
    const password = elements.loginPassword.value;
    
    if (!email) {
        showError('login-email', 'Vui lòng nhập email');
        isValid = false;
    } else if (!validateEmail(email)) {
        showError('login-email', 'Email không đúng định dạng');
        isValid = false;
    }
    
    if (!password) {
        showError('login-password', 'Vui lòng nhập mật khẩu');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Validate register form
 */
function validateRegisterForm() {
    let isValid = true;
    
    clearAllErrors('register-form');
    
    const firstname = elements.registerFirstname.value.trim();
    const lastname = elements.registerLastname.value.trim();
    const username = elements.registerUsername.value.trim();
    const email = elements.registerEmail.value.trim();
    const password = elements.registerPassword.value;
    const dob = elements.registerDob.value;
    
    if (!firstname) {
        showError('register-firstname', 'Vui lòng nhập họ');
        isValid = false;
    }
    
    if (!lastname) {
        showError('register-lastname', 'Vui lòng nhập tên');
        isValid = false;
    }
    
    if (!username) {
        showError('register-username', 'Vui lòng nhập tên người dùng');
        isValid = false;
    } else if (!validateUsername(username)) {
        showError('register-username', 'Username phải có ít nhất 3 ký tự');
        isValid = false;
    }
    
    if (!email) {
        showError('register-email', 'Vui lòng nhập email');
        isValid = false;
    } else if (!validateEmail(email)) {
        showError('register-email', 'Email không đúng định dạng');
        isValid = false;
    }
    
    if (!password) {
        showError('register-password', 'Vui lòng nhập mật khẩu');
        isValid = false;
    } else if (!validatePassword(password)) {
        showError('register-password', 'Mật khẩu phải có ít nhất 8 ký tự');
        isValid = false;
    }
    
    if (!dob) {
        showError('register-dob', 'Vui lòng chọn ngày sinh');
        isValid = false;
    } else if (!validateDateOfBirth(dob)) {
        showError('register-dob', 'Bạn phải trên 5 tuổi');
        isValid = false;
    }
    
    return isValid;
}

// ===================================
// API FUNCTIONS & TOKEN MANAGEMENT
// ===================================

/**
 * Flag to prevent multiple simultaneous refresh attempts
 */
let isRefreshing = false;
let refreshPromise = null;

/**
 * Refresh the access token
 */
async function refreshToken() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        throw new Error('No token to refresh');
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });
        
        const data = await response.json();
        
        if (data.code === 1000 && data.result.token) {
            // Save new token
            localStorage.setItem('token', data.result.token);
            console.log('✅ Token refreshed successfully');
            return data.result.token;
        } else {
            throw new Error('Refresh token failed');
        }
    } catch (error) {
        console.error('❌ Token refresh error:', error);
        // Clear token and redirect to login
        localStorage.removeItem('token');
        throw error;
    }
}

/**
 * API call wrapper with auto token refresh
 */
async function apiCall(endpoint, options = {}, retryCount = 0) {
    try {
        // Prepare headers - ensure Content-Type is always application/json
        const headers = {
            ...options.headers,
            'Content-Type': 'application/json'
        };
        
        // Prepare fetch options
        const fetchOptions = {
            ...options,
            headers: headers
        };
        
        console.log('API Call:', endpoint, fetchOptions); // Debug log
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);
        
        const data = await response.json();
        
        console.log('API Response:', data); // Debug log
        
        // Check for authentication error (token expired)
        if (data.code === 1007 && retryCount === 0) {
            console.warn('⚠️ Token expired, attempting refresh...');
            
            // Prevent multiple simultaneous refresh attempts
            if (!isRefreshing) {
                isRefreshing = true;
                refreshPromise = refreshToken()
                    .finally(() => {
                        isRefreshing = false;
                        refreshPromise = null;
                    });
            }
            
            try {
                // Wait for refresh to complete
                await refreshPromise;
                
                // Retry the original request with new token
                const newToken = localStorage.getItem('token');
                if (newToken && options.headers && options.headers.Authorization) {
                    options.headers.Authorization = `Bearer ${newToken}`;
                }
                
                console.log('🔄 Retrying request with new token...');
                return await apiCall(endpoint, options, retryCount + 1);
            } catch (refreshError) {
                // Refresh failed, logout user
                console.error('❌ Token refresh failed, logging out...');
                showToast('Phiên đăng nhập hết hạn', 'Vui lòng đăng nhập lại', 'error');
                
                setTimeout(() => {
                    localStorage.removeItem('token');
                    showAuthSection();
                }, 2000);
                
                throw refreshError;
            }
        }
        
        // If response has error code, log it
        if (data.code && data.code !== 1000) {
            console.error('API Error Code:', data.code, 'Message:', data.message);
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
    }
}

/**
 * Register new user
 */
async function registerUser(userData) {
    return await apiCall('/users', {
        method: 'POST',
        body: JSON.stringify(userData)
    });
}

/**
 * Login user
 */
async function loginUser(email, password) {
    return await apiCall('/auth/token', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
}

/**
 * Get current user info
 */
async function getMyInfo() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        throw new Error('No token found');
    }
    
    return await apiCall('/users/me', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}

/**
 * Logout user
 */
async function logoutUser() {
    const token = localStorage.getItem('token');
    
    if (token) {
        try {
            await apiCall('/auth/logout', {
                method: 'POST',
                body: JSON.stringify({ token })
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
    
    localStorage.removeItem('token');
}

/**
 * Update my info (for regular users)
 */
async function updateMyInfo(updateData) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        throw new Error('No token found');
    }
    
    return await apiCall('/users/me', {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
    });
}

/**
 * Get all users (admin only)
 */
async function getAllUsers() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        throw new Error('No token found');
    }
    
    return await apiCall('/users', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}

/**
 * Update user by ID (admin only)
 */
async function updateUserById(userId, updateData) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        throw new Error('No token found');
    }
    
    return await apiCall(`/users/${userId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
    });
}

/**
 * Delete user by ID (admin only)
 */
async function deleteUserById(userId) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        throw new Error('No token found');
    }
    
    return await apiCall(`/users/${userId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}

/**
 * Change password for current user
 */
async function changePassword(oldPassword, newPassword) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        throw new Error('No token found');
    }
    
    return await apiCall('/users/me/change-password', {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
    });
}

/**
 * Get all roles
 */
async function getAllRoles() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        throw new Error('No token found');
    }
    
    return await apiCall('/roles', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}

/**
 * Create new role
 */
async function createRole(roleData) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        throw new Error('No token found');
    }
    
    return await apiCall('/roles', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(roleData)
    });
}

/**
 * Delete role
 */
async function deleteRole(roleName) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        throw new Error('No token found');
    }
    
    return await apiCall(`/roles/${roleName}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}

/**
 * Get all permissions
 */
async function getAllPermissions() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        throw new Error('No token found');
    }
    
    return await apiCall('/permissions', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}

/**
 * Create new permission
 */
async function createPermission(permissionData) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        throw new Error('No token found');
    }
    
    return await apiCall('/permissions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(permissionData)
    });
}

/**
 * Delete permission
 */
async function deletePermission(permissionName) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        throw new Error('No token found');
    }
    
    return await apiCall(`/permissions/${permissionName}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}

// ===================================
// UI FUNCTIONS
// ===================================

/**
 * Check if user is admin based on roles
 */
function isAdmin(user) {
    if (!user || !user.roles) {
        return false;
    }
    
    // Check if user has ADMIN role
    return user.roles.some(role => {
        // Handle both string format and object format
        if (typeof role === 'string') {
            return role === 'ADMIN';
        }
        return role.name === 'ADMIN';
    });
}

/**
 * Check if user is super admin
 * @deprecated No longer needed - all admins have same permissions
 * Kept for backward compatibility, just returns isAdmin
 */
function isSuperAdmin(user) {
    return isAdmin(user);
}

/**
 * Switch between admin tabs
 */
function switchAdminTab(tabName) {
    // Update tab buttons
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Update tab content
    elements.usersTabContent.classList.toggle('active', tabName === 'users');
    elements.rolesTabContent.classList.toggle('active', tabName === 'roles');
    elements.permissionsTabContent.classList.toggle('active', tabName === 'permissions');
    
    // Load data for the active tab
    if (tabName === 'roles') {
        loadAllRoles();
    } else if (tabName === 'permissions') {
        loadAllPermissions();
    }
}

/**
 * Switch between login and register tabs
 */
function switchTab(tabName) {
    // Update tab buttons
    elements.loginTab.classList.toggle('active', tabName === 'login');
    elements.registerTab.classList.toggle('active', tabName === 'register');
    
    // Update forms
    elements.loginForm.classList.toggle('active', tabName === 'login');
    elements.registerForm.classList.toggle('active', tabName === 'register');
    
    // Clear all errors
    clearAllErrors('login-form');
    clearAllErrors('register-form');
}

// Store current user data globally
let currentUserData = null;

/**
 * Show user info section
 */
function showUserInfo(userData) {
    // Store current user data
    currentUserData = userData;
    
    // Hide auth section and admin section, show info section
    elements.authSection.style.display = 'none';
    elements.adminSection.classList.remove('active');
    elements.infoSection.classList.add('active');
    
    // Set avatar initials
    const initials = getInitials(userData.firstname, userData.lastname);
    elements.avatarInitials.textContent = initials;
    
    // Set user info
    elements.userFullname.textContent = `${userData.firstname} ${userData.lastname}`;
    elements.userUsername.textContent = `@${userData.username}`;
    elements.userEmail.textContent = userData.email;
    elements.userDob.textContent = formatDate(userData.dateOfBirth);
    
    // Set roles
    if (userData.roles && userData.roles.length > 0) {
        elements.userRoles.innerHTML = userData.roles
            .map(role => `<span class="role-badge">${role.name}</span>`)
            .join('');
    } else {
        elements.userRoles.innerHTML = '<span class="role-badge">USER</span>';
    }
    
    // Show/hide admin panel button based on user roles
    if (isAdmin(userData)) {
        elements.adminPanelBtn.style.display = 'flex';
    } else {
        elements.adminPanelBtn.style.display = 'none';
    }
}

/**
 * Show auth section
 */
function showAuthSection() {
    elements.authSection.style.display = 'block';
    elements.infoSection.classList.remove('active');
    elements.adminSection.classList.remove('active');
    
    // Reset forms
    elements.loginForm.reset();
    elements.registerForm.reset();
    clearAllErrors('login-form');
    clearAllErrors('register-form');
    
    // Switch to login tab
    switchTab('login');
    
    // Clear current user data
    currentUserData = null;
}

/**
 * Show admin panel
 */
async function showAdminPanel() {
    // Hide info section, show admin section
    elements.infoSection.classList.remove('active');
    elements.adminSection.classList.add('active');
    
    // Show admin tabs for all users with ADMIN role
    if (currentUserData && isAdmin(currentUserData)) {
        elements.adminTabs.style.display = 'flex';
    } else {
        elements.adminTabs.style.display = 'none';
    }
    
    // Switch to users tab and load users
    switchAdminTab('users');
    await loadAllUsers();
}

/**
 * Load all users into admin table
 */
async function loadAllUsers() {
    elements.usersTableBody.innerHTML = '<tr><td colspan="6" class="loading-row">Đang tải...</td></tr>';
    
    try {
        const response = await getAllUsers();
        
        if (response.code === 1000) {
            const users = response.result;
            
            if (users.length === 0) {
                elements.usersTableBody.innerHTML = '<tr><td colspan="6" class="loading-row">Không có người dùng nào</td></tr>';
                return;
            }
            
            elements.usersTableBody.innerHTML = users.map(user => `
                <tr>
                    <td><strong>${user.username}</strong></td>
                    <td>${user.firstname} ${user.lastname}</td>
                    <td>${user.email}</td>
                    <td>${formatDate(user.dateOfBirth)}</td>
                    <td>
                        ${user.roles && user.roles.length > 0 
                            ? user.roles.map(r => `<span class="role-badge" style="font-size: 0.75rem; padding: 0.25rem 0.75rem;">${r.name}</span>`).join(' ')
                            : '<span class="role-badge" style="font-size: 0.75rem; padding: 0.25rem 0.75rem;">USER</span>'}
                    </td>
                    <td>
                        <div class="table-actions">
                            <button class="btn btn-icon btn-edit" onclick="openEditUserModal('${user.id}')">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                                    <path d="M14.1667 2.49993C14.3856 2.28106 14.6454 2.10744 14.9314 1.98899C15.2173 1.87054 15.5238 1.80957 15.8334 1.80957C16.1429 1.80957 16.4494 1.87054 16.7353 1.98899C17.0213 2.10744 17.2811 2.28106 17.5 2.49993C17.7189 2.7188 17.8925 2.97863 18.011 3.2646C18.1294 3.55057 18.1904 3.85706 18.1904 4.16659C18.1904 4.47612 18.1294 4.78262 18.011 5.06859C17.8925 5.35455 17.7189 5.61439 17.5 5.83326L6.25002 17.0833L1.66669 18.3333L2.91669 13.7499L14.1667 2.49993Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                Sửa
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        } else {
            handleApiError(response);
            elements.usersTableBody.innerHTML = '<tr><td colspan="6" class="loading-row">Lỗi tải dữ liệu</td></tr>';
        }
    } catch (error) {
        showToast('Lỗi', error.message, 'error');
        elements.usersTableBody.innerHTML = '<tr><td colspan="6" class="loading-row">Lỗi kết nối</td></tr>';
    }
}

/**
 * Load all roles into roles table
 */
async function loadAllRoles() {
    elements.rolesTableBody.innerHTML = '<tr><td colspan="4" class="loading-row">Đang tải...</td></tr>';
    
    try {
        const response = await getAllRoles();
        
        if (response.code === 1000) {
            const roles = response.result;
            
            if (roles.length === 0) {
                elements.rolesTableBody.innerHTML = '<tr><td colspan="4" class="loading-row">Không có vai trò nào</td></tr>';
                return;
            }
            
            elements.rolesTableBody.innerHTML = roles.map(role => `
                <tr>
                    <td><strong>${role.name}</strong></td>
                    <td>${role.description}</td>
                    <td>
                        <div class="permission-badges">
                            ${role.permissions && role.permissions.length > 0 
                                ? role.permissions.map(p => `<span class="permission-badge">${p.name}</span>`).join('')
                                : '<span style="color: var(--text-light)">Không có quyền hạn</span>'
                            }
                        </div>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon btn-danger" onclick="handleDeleteRole('${role.name}')" title="Xóa">
                                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                                    <path d="M6 6L14 14M6 14L14 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        } else {
            handleApiError(response);
            elements.rolesTableBody.innerHTML = '<tr><td colspan="4" class="loading-row">Lỗi tải dữ liệu</td></tr>';
        }
    } catch (error) {
        showToast('Lỗi', error.message, 'error');
        elements.rolesTableBody.innerHTML = '<tr><td colspan="4" class="loading-row">Lỗi kết nối</td></tr>';
    }
}

/**
 * Load all permissions into permissions table
 */
async function loadAllPermissions() {
    elements.permissionsTableBody.innerHTML = '<tr><td colspan="3" class="loading-row">Đang tải...</td></tr>';
    
    try {
        const response = await getAllPermissions();
        
        if (response.code === 1000) {
            const permissions = response.result;
            
            if (permissions.length === 0) {
                elements.permissionsTableBody.innerHTML = '<tr><td colspan="3" class="loading-row">Không có quyền hạn nào</td></tr>';
                return;
            }
            
            elements.permissionsTableBody.innerHTML = permissions.map(permission => `
                <tr>
                    <td><strong>${permission.name}</strong></td>
                    <td>${permission.description}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon btn-danger" onclick="handleDeletePermission('${permission.name}')" title="Xóa">
                                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                                    <path d="M6 6L14 14M6 14L14 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        } else {
            handleApiError(response);
            elements.permissionsTableBody.innerHTML = '<tr><td colspan="3" class="loading-row">Lỗi tải dữ liệu</td></tr>';
        }
    } catch (error) {
        showToast('Lỗi', error.message, 'error');
        elements.permissionsTableBody.innerHTML = '<tr><td colspan="3" class="loading-row">Lỗi kết nối</td></tr>';
    }
}

/**
 * Open edit my info modal
 */
function openEditMyInfoModal() {
    if (!currentUserData) return;
    
    // Pre-fill form with current data
    elements.editMyFirstname.value = currentUserData.firstname;
    elements.editMyLastname.value = currentUserData.lastname;
    elements.editMyUsername.value = currentUserData.username;
    elements.editMyDob.value = currentUserData.dateOfBirth;
    
    // Clear errors
    clearAllErrors('edit-my-info-form');
    
    // Show modal
    elements.editMyInfoModal.classList.add('active');
}

/**
 * Close edit my info modal
 */
function closeEditMyInfoModal() {
    elements.editMyInfoModal.classList.remove('active');
    elements.editMyInfoForm.reset();
    clearAllErrors('edit-my-info-form');
}

/**
 * Open change password modal
 */
function openChangePasswordModal() {
    // Clear form
    elements.changePasswordForm.reset();
    clearAllErrors('change-password-form');
    
    // Show modal
    elements.changePasswordModal.classList.add('active');
}

/**
 * Close change password modal
 */
function closeChangePasswordModal() {
    elements.changePasswordModal.classList.remove('active');
    elements.changePasswordForm.reset();
    clearAllErrors('change-password-form');
}

/**
 * Open edit user modal (admin)
 */
async function openEditUserModal(userId) {
    try {
        // Get all users to find the specific user
        const response = await getAllUsers();
        
        if (response.code === 1000) {
            const user = response.result.find(u => u.id === userId);
            
            if (!user) {
                showToast('Lỗi', 'Không tìm thấy người dùng', 'error');
                return;
            }
            
            // Pre-fill form
            elements.editUserId.value = user.id;
            elements.editUserFirstname.value = user.firstname;
            elements.editUserLastname.value = user.lastname;
            elements.editUserUsername.value = user.username;
            elements.editUserEmail.value = user.email;
            elements.editUserDob.value = user.dateOfBirth;
            
            // Set roles checkboxes
            const adminCheckbox = document.querySelector('#edit-user-roles input[value="ADMIN"]');
            if (adminCheckbox) {
                const hasAdminRole = user.roles && user.roles.some(r => r.name === 'ADMIN');
                adminCheckbox.checked = hasAdminRole;
            }
            
            // Clear errors
            clearAllErrors('edit-user-form');
            
            // Show modal
            elements.editUserModal.classList.add('active');
        } else {
            showToast('Lỗi', 'Không thể tải thông tin người dùng', 'error');
        }
    } catch (error) {
        showToast('Lỗi', error.message, 'error');
    }
}

/**
 * Close edit user modal
 */
function closeEditUserModal() {
    elements.editUserModal.classList.remove('active');
    elements.editUserForm.reset();
    clearAllErrors('edit-user-form');
}

/**
 * Open create role modal
 */
async function openCreateRoleModal() {
    elements.roleModalTitle.textContent = 'Tạo vai trò mới';
    elements.roleOriginalName.value = '';
    elements.roleName.value = '';
    elements.roleDescription.value = '';
    elements.roleName.disabled = false;
    
    // Load permissions as checkboxes
    await loadPermissionsCheckboxes();
    
    clearAllErrors('role-form');
    elements.roleModal.classList.add('active');
}

/**
 * Close role modal
 */
function closeRoleModal() {
    elements.roleModal.classList.remove('active');
    elements.roleForm.reset();
    clearAllErrors('role-form');
}

/**
 * Load permissions as checkboxes for role form
 */
async function loadPermissionsCheckboxes() {
    elements.rolePermissions.innerHTML = '<p class="loading-text">Đang tải quyền hạn...</p>';
    
    try {
        const response = await getAllPermissions();
        
        if (response.code === 1000) {
            const permissions = response.result;
            
            if (permissions.length === 0) {
                elements.rolePermissions.innerHTML = '<p class="loading-text">Chưa có quyền hạn nào</p>';
                return;
            }
            
            elements.rolePermissions.innerHTML = permissions.map(permission => `
                <label class="checkbox-label">
                    <input type="checkbox" name="permissions" value="${permission.name}">
                    <span>${permission.name}</span>
                </label>
            `).join('');
        } else {
            elements.rolePermissions.innerHTML = '<p class="loading-text">Lỗi tải quyền hạn</p>';
        }
    } catch (error) {
        elements.rolePermissions.innerHTML = '<p class="loading-text">Lỗi kết nối</p>';
    }
}

/**
 * Open create permission modal
 */
function openCreatePermissionModal() {
    elements.permissionModalTitle.textContent = 'Tạo quyền hạn mới';
    elements.permissionOriginalName.value = '';
    elements.permissionName.value = '';
    elements.permissionDescription.value = '';
    elements.permissionName.disabled = false;
    
    clearAllErrors('permission-form');
    elements.permissionModal.classList.add('active');
}

/**
 * Close permission modal
 */
function closePermissionModal() {
    elements.permissionModal.classList.remove('active');
    elements.permissionForm.reset();
    clearAllErrors('permission-form');
}

/**
 * Handle API error response
 */
function handleApiError(response, formType = 'login') {
    const code = response.code;
    const message = ERROR_MESSAGES[code] || response.message || 'Có lỗi xảy ra';
    
    // Show specific errors based on code
    switch (code) {
        case 1002: // User already exists
            if (formType === 'register') {
                showError('register-email', message);
            } else if (formType === 'edit-user') {
                showError('edit-user-email', message);
            }
            break;
            
        case 1003: // Username too short
            if (formType === 'register') {
                showError('register-username', message);
            } else if (formType === 'edit-my-info') {
                showError('edit-my-username', message);
            } else if (formType === 'edit-user') {
                showError('edit-user-username', message);
            }
            break;
            
        case 1004: // Password too short
            if (formType === 'register') {
                showError('register-password', message);
            } else if (formType === 'login') {
                showError('login-password', message);
            } else if (formType === 'edit-my-info') {
                showError('edit-my-password', message);
            } else if (formType === 'change-password') {
                showError('new-password', message);
            }
            break;
            
        case 1005: // Invalid email
            if (formType === 'register') {
                showError('register-email', message);
            } else if (formType === 'login') {
                showError('login-email', message);
            } else if (formType === 'edit-user') {
                showError('edit-user-email', message);
            }
            break;
            
        case 1006: // User not found / Wrong password
            if (formType === 'change-password') {
                showError('old-password', 'Mật khẩu hiện tại không đúng');
            } else {
                showError('login-email', 'Email hoặc mật khẩu không đúng');
            }
            break;
            
        case 1007: // Unauthenticated
            showToast('Lỗi xác thực', message, 'error');
            break;
            
        case 1009: // Age requirement
            if (formType === 'register') {
                showError('register-dob', message);
            } else if (formType === 'edit-my-info') {
                showError('edit-my-dob', message);
            } else if (formType === 'edit-user') {
                showError('edit-user-dob', message);
            }
            break;
            
        default:
            showToast('Lỗi', message, 'error');
    }
}

// ===================================
// EVENT HANDLERS
// ===================================

/**
 * Handle login form submission
 */
async function handleLogin(event) {
    event.preventDefault();
    
    if (!validateLoginForm()) {
        return;
    }
    
    const email = elements.loginEmail.value.trim();
    const password = elements.loginPassword.value;
    
    setButtonLoading(elements.loginBtn, true);
    
    try {
        const response = await loginUser(email, password);
        
        if (response.code === 1000) {
            // Save token
            localStorage.setItem('token', response.result.token);
            
            // Get user info
            const userInfoResponse = await getMyInfo();
            
            if (userInfoResponse.code === 1000) {
                showToast('Đăng nhập thành công', `Chào mừng ${userInfoResponse.result.firstname}!`, 'success');
                
                // Show user info after a short delay
                setTimeout(() => {
                    showUserInfo(userInfoResponse.result);
                }, 500);
            } else {
                handleApiError(userInfoResponse);
            }
        } else {
            handleApiError(response, 'login');
        }
    } catch (error) {
        showToast('Lỗi kết nối', error.message, 'error');
    } finally {
        setButtonLoading(elements.loginBtn, false);
    }
}

/**
 * Handle register form submission
 */
async function handleRegister(event) {
    event.preventDefault();
    
    if (!validateRegisterForm()) {
        return;
    }
    
    const userData = {
        username: elements.registerUsername.value.trim(),
        firstname: elements.registerFirstname.value.trim(),
        lastname: elements.registerLastname.value.trim(),
        email: elements.registerEmail.value.trim(),
        password: elements.registerPassword.value,
        dateOfBirth: elements.registerDob.value
    };
    
    setButtonLoading(elements.registerBtn, true);
    
    try {
        const response = await registerUser(userData);
        
        if (response.code === 1000) {
            showToast('Đăng ký thành công', 'Vui lòng đăng nhập để tiếp tục', 'success');
            
            // Reset form
            elements.registerForm.reset();
            
            // Switch to login tab after a short delay
            setTimeout(() => {
                switchTab('login');
                // Pre-fill email in login form
                elements.loginEmail.value = userData.email;
            }, 1000);
        } else {
            handleApiError(response, 'register');
        }
    } catch (error) {
        showToast('Lỗi kết nối', error.message, 'error');
    } finally {
        setButtonLoading(elements.registerBtn, false);
    }
}

/**
 * Handle logout
 */
async function handleLogout() {
    try {
        await logoutUser();
        showToast('Đăng xuất thành công', 'Hẹn gặp lại bạn!', 'success');
        
        setTimeout(() => {
            showAuthSection();
        }, 500);
    } catch (error) {
        console.error('Logout error:', error);
        // Still logout even if API call fails
        localStorage.removeItem('token');
        showAuthSection();
    }
}

/**
 * Handle edit my info form submission
 */
async function handleEditMyInfo(event) {
    event.preventDefault();
    
    const updateData = {
        username: elements.editMyUsername.value.trim(),
        firstname: elements.editMyFirstname.value.trim(),
        lastname: elements.editMyLastname.value.trim(),
        dateOfBirth: elements.editMyDob.value
    };
    
    setButtonLoading(elements.saveMyInfoBtn, true);
    
    try {
        const response = await updateMyInfo(updateData);
        
        if (response.code === 1000) {
            showToast('Cập nhật thành công', 'Thông tin của bạn đã được cập nhật', 'success');
            closeEditMyInfoModal();
            
            // Refresh user info
            const userInfoResponse = await getMyInfo();
            if (userInfoResponse.code === 1000) {
                showUserInfo(userInfoResponse.result);
            }
        } else {
            handleApiError(response, 'edit-my-info');
        }
    } catch (error) {
        showToast('Lỗi kết nối', error.message, 'error');
    } finally {
        setButtonLoading(elements.saveMyInfoBtn, false);
    }
}

/**
 * Handle edit user form submission (admin)
 */
async function handleEditUser(event) {
    event.preventDefault();
    
    const userId = elements.editUserId.value;
    const updateData = {
        username: elements.editUserUsername.value.trim(),
        firstname: elements.editUserFirstname.value.trim(),
        lastname: elements.editUserLastname.value.trim(),
        email: elements.editUserEmail.value.trim(),
        dateOfBirth: elements.editUserDob.value,
        roles: []
    };
    
    // Get roles from checkboxes
    const adminCheckbox = document.querySelector('#edit-user-roles input[value="ADMIN"]');
    if (adminCheckbox && adminCheckbox.checked) {
        updateData.roles.push('ADMIN');
    }
    updateData.roles.push('USER'); // USER is always included
    
    setButtonLoading(elements.saveUserBtn, true);
    
    try {
        const response = await updateUserById(userId, updateData);
        
        if (response.code === 1000) {
            showToast('Cập nhật thành công', 'Thông tin người dùng đã được cập nhật', 'success');
            closeEditUserModal();
            
            // Reload users table
            await loadAllUsers();
        } else {
            handleApiError(response, 'edit-user');
        }
    } catch (error) {
        showToast('Lỗi kết nối', error.message, 'error');
    } finally {
        setButtonLoading(elements.saveUserBtn, false);
    }
}

/**
 * Handle change password form submission
 */
async function handleChangePassword(event) {
    event.preventDefault();
    
    const oldPasswordValue = elements.oldPassword.value;
    const newPasswordValue = elements.newPassword.value;
    const confirmPasswordValue = elements.confirmPassword.value;
    
    // Clear previous errors
    clearAllErrors('change-password-form');
    
    // Validate old password
    if (!oldPasswordValue) {
        showError('old-password', 'Vui lòng nhập mật khẩu hiện tại');
        return;
    }
    
    // Validate new password
    if (!newPasswordValue) {
        showError('new-password', 'Vui lòng nhập mật khẩu mới');
        return;
    }
    
    if (newPasswordValue.length < 8) {
        showError('new-password', 'Mật khẩu phải có ít nhất 8 ký tự');
        return;
    }
    
    // Validate confirm password
    if (!confirmPasswordValue) {
        showError('confirm-password', 'Vui lòng xác nhận mật khẩu mới');
        return;
    }
    
    if (newPasswordValue !== confirmPasswordValue) {
        showError('confirm-password', 'Mật khẩu xác nhận không khớp');
        return;
    }
    
    // Check if new password is same as old password
    if (oldPasswordValue === newPasswordValue) {
        showError('new-password', 'Mật khẩu mới phải khác mật khẩu hiện tại');
        return;
    }
    
    setButtonLoading(elements.savePasswordBtn, true);
    
    try {
        const response = await changePassword(oldPasswordValue, newPasswordValue);
        
        if (response.code === 1000) {
            showToast('Đổi mật khẩu thành công', 'Mật khẩu của bạn đã được cập nhật', 'success');
            closeChangePasswordModal();
        } else {
            handleApiError(response, 'change-password');
        }
    } catch (error) {
        showToast('Lỗi kết nối', error.message, 'error');
    } finally {
        setButtonLoading(elements.savePasswordBtn, false);
    }
}

/**
 * Handle create role form submission
 */
async function handleCreateRole(event) {
    event.preventDefault();
    
    const name = elements.roleName.value.trim();
    const description = elements.roleDescription.value.trim();
    
    // Get selected permissions
    const selectedPermissions = Array.from(
        document.querySelectorAll('#role-permissions input[type="checkbox"]:checked')
    ).map(cb => cb.value);
    
    // Clear previous errors
    clearAllErrors('role-form');
    
    // Validate
    if (!name) {
        showError('role-name', 'Vui lòng nhập tên vai trò');
        return;
    }
    
    if (!description) {
        showError('role-description', 'Vui lòng nhập mô tả');
        return;
    }
    
    setButtonLoading(elements.saveRoleBtn, true);
    
    try {
        const roleData = {
            name: name.toUpperCase(),
            description,
            permissions: selectedPermissions
        };
        
        const response = await createRole(roleData);
        
        if (response.code === 1000) {
            showToast('Thành công', 'Vai trò đã được tạo', 'success');
            closeRoleModal();
            await loadAllRoles();
        } else {
            handleApiError(response, 'role');
        }
    } catch (error) {
        showToast('Lỗi kết nối', error.message, 'error');
    } finally {
        setButtonLoading(elements.saveRoleBtn, false);
    }
}

/**
 * Handle delete role
 */
async function handleDeleteRole(roleName) {
    if (!confirm(`Bạn có chắc muốn xóa vai trò "${roleName}"?`)) {
        return;
    }
    
    try {
        const response = await deleteRole(roleName);
        
        if (response.code === 1000) {
            showToast('Thành công', 'Vai trò đã được xóa', 'success');
            await loadAllRoles();
        } else {
            handleApiError(response);
        }
    } catch (error) {
        showToast('Lỗi kết nối', error.message, 'error');
    }
}

/**
 * Handle create permission form submission
 */
async function handleCreatePermission(event) {
    event.preventDefault();
    
    const name = elements.permissionName.value.trim();
    const description = elements.permissionDescription.value.trim();
    
    // Clear previous errors
    clearAllErrors('permission-form');
    
    // Validate
    if (!name) {
        showError('permission-name', 'Vui lòng nhập tên quyền hạn');
        return;
    }
    
    if (!description) {
        showError('permission-description', 'Vui lòng nhập mô tả');
        return;
    }
    
    setButtonLoading(elements.savePermissionBtn, true);
    
    try {
        const permissionData = {
            name: name.toUpperCase(),
            description
        };
        
        const response = await createPermission(permissionData);
        
        if (response.code === 1000) {
            showToast('Thành công', 'Quyền hạn đã được tạo', 'success');
            closePermissionModal();
            await loadAllPermissions();
        } else {
            handleApiError(response, 'permission');
        }
    } catch (error) {
        showToast('Lỗi kết nối', error.message, 'error');
    } finally {
        setButtonLoading(elements.savePermissionBtn, false);
    }
}

/**
 * Handle delete permission
 */
async function handleDeletePermission(permissionName) {
    if (!confirm(`Bạn có chắc muốn xóa quyền hạn "${permissionName}"?`)) {
        return;
    }
    
    try {
        const response = await deletePermission(permissionName);
        
        if (response.code === 1000) {
            showToast('Thành công', 'Quyền hạn đã được xóa', 'success');
            await loadAllPermissions();
        } else {
            handleApiError(response);
        }
    } catch (error) {
        showToast('Lỗi kết nối', error.message, 'error');
    }
}

/**
 * Check if user is already logged in
 */
async function checkAuth() {
    const token = localStorage.getItem('token');
    
    if (token) {
        try {
            const response = await getMyInfo();
            
            if (response.code === 1000) {
                showUserInfo(response.result);
            } else {
                // Token invalid, clear it
                localStorage.removeItem('token');
                showAuthSection();
            }
        } catch (error) {
            console.error('Auth check error:', error);
            localStorage.removeItem('token');
            showAuthSection();
        }
    } else {
        showAuthSection();
    }
}

// ===================================
// EVENT LISTENERS
// ===================================

// Tab switching
elements.loginTab.addEventListener('click', () => switchTab('login'));
elements.registerTab.addEventListener('click', () => switchTab('register'));

// Form submissions
elements.loginForm.addEventListener('submit', handleLogin);
elements.registerForm.addEventListener('submit', handleRegister);

// Logout
elements.logoutBtn.addEventListener('click', handleLogout);

// Edit profile buttons
if (elements.editProfileBtn) {
    elements.editProfileBtn.addEventListener('click', openEditMyInfoModal);
}
if (elements.editMyInfoBtn) {
    elements.editMyInfoBtn.addEventListener('click', openEditMyInfoModal);
}

// Admin panel
if (elements.adminPanelBtn) {
    elements.adminPanelBtn.addEventListener('click', showAdminPanel);
}
if (elements.backToProfileBtn) {
    elements.backToProfileBtn.addEventListener('click', () => {
        elements.adminSection.classList.remove('active');
        elements.infoSection.classList.add('active');
    });
}

// Edit My Info Modal
if (elements.closeEditMyInfoModal) {
    elements.closeEditMyInfoModal.addEventListener('click', closeEditMyInfoModal);
}
if (elements.editMyInfoOverlay) {
    elements.editMyInfoOverlay.addEventListener('click', closeEditMyInfoModal);
}
if (elements.cancelEditMyInfo) {
    elements.cancelEditMyInfo.addEventListener('click', closeEditMyInfoModal);
}
if (elements.editMyInfoForm) {
    elements.editMyInfoForm.addEventListener('submit', handleEditMyInfo);
}

// Change Password Modal
if (elements.changePasswordBtn) {
    elements.changePasswordBtn.addEventListener('click', openChangePasswordModal);
}
if (elements.closeChangePasswordModal) {
    elements.closeChangePasswordModal.addEventListener('click', closeChangePasswordModal);
}
if (elements.changePasswordOverlay) {
    elements.changePasswordOverlay.addEventListener('click', closeChangePasswordModal);
}
if (elements.cancelChangePassword) {
    elements.cancelChangePassword.addEventListener('click', closeChangePasswordModal);
}
if (elements.changePasswordForm) {
    elements.changePasswordForm.addEventListener('submit', handleChangePassword);
}

// Edit User Modal
if (elements.closeEditUserModal) {
    elements.closeEditUserModal.addEventListener('click', closeEditUserModal);
}
if (elements.editUserOverlay) {
    elements.editUserOverlay.addEventListener('click', closeEditUserModal);
}
if (elements.cancelEditUser) {
    elements.cancelEditUser.addEventListener('click', closeEditUserModal);
}
if (elements.editUserForm) {
    elements.editUserForm.addEventListener('submit', handleEditUser);
}

// Toast close
elements.toastClose.addEventListener('click', hideToast);

// Clear error on input
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', (e) => {
        const inputId = e.target.id;
        clearError(inputId);
    });
});

// Admin Tabs
document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        switchAdminTab(tab.dataset.tab);
    });
});

// Role Management
if (elements.createRoleBtn) {
    elements.createRoleBtn.addEventListener('click', openCreateRoleModal);
}
if (elements.closeRoleModal) {
    elements.closeRoleModal.addEventListener('click', closeRoleModal);
}
if (elements.roleModalOverlay) {
    elements.roleModalOverlay.addEventListener('click', closeRoleModal);
}
if (elements.cancelRole) {
    elements.cancelRole.addEventListener('click', closeRoleModal);
}
if (elements.roleForm) {
    elements.roleForm.addEventListener('submit', handleCreateRole);
}

// Permission Management
if (elements.createPermissionBtn) {
    elements.createPermissionBtn.addEventListener('click', openCreatePermissionModal);
}
if (elements.closePermissionModal) {
    elements.closePermissionModal.addEventListener('click', closePermissionModal);
}
if (elements.permissionModalOverlay) {
    elements.permissionModalOverlay.addEventListener('click', closePermissionModal);
}
if (elements.cancelPermission) {
    elements.cancelPermission.addEventListener('click', closePermissionModal);
}
if (elements.permissionForm) {
    elements.permissionForm.addEventListener('submit', handleCreatePermission);
}

// Make functions global for onclick handlers
window.openEditUserModal = openEditUserModal;
window.handleDeleteRole = handleDeleteRole;
window.handleDeletePermission = handleDeletePermission;

// ===================================
// INITIALIZATION
// ===================================

// Check authentication status on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

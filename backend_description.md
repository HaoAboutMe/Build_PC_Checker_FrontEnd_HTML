# API Documentation cho Frontend Development

## Thông tin chung về hệ thống

### Base URL
```
http://localhost:8080/identity
```

### Cấu trúc Response chung
Tất cả các API đều trả về response theo cấu trúc sau:

```json
{
  "code": 1000,
  "message": "string (optional)",
  "result": {} // Data object hoặc array
}
```

- `code`: Mã trạng thái (1000 = thành công, các mã khác xem phần Error Codes)
- `message`: Thông báo lỗi (chỉ có khi có lỗi)
- `result`: Dữ liệu trả về (có thể là object hoặc array)

### Authentication
Hệ thống sử dụng JWT Token. Sau khi đăng nhập thành công, cần gửi token trong header:

```
Authorization: Bearer <your_jwt_token>
```

### JWT Token Expiration
- **Access Token**: 300 giây (5 phút)
- **Refresh Token**: 1200 giây (20 phút)

---

## 1. AUTHENTICATION APIs

### 1.1. Đăng nhập (Login)
**Endpoint:** `POST /identity/auth/token`  
**Mô tả:** Xác thực người dùng và trả về JWT token  
**Public:** ✅ Không cần authentication

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response thành công:**
```json
{
  "code": 1000,
  "result": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "authenticated": true
  }
}
```

**Ví dụ JavaScript:**
```javascript
async function login(email, password) {
  const response = await fetch('http://localhost:8080/identity/auth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  if (data.code === 1000) {
    // Lưu token vào localStorage
    localStorage.setItem('token', data.result.token);
    return data.result;
  } else {
    throw new Error(data.message);
  }
}
```

---

### 1.2. Kiểm tra Token (Introspect)
**Endpoint:** `POST /identity/auth/introspect`  
**Mô tả:** Kiểm tra xem token có còn hợp lệ không  
**Public:** ✅ Không cần authentication

**Request Body:**
```json
{
  "token": "your_jwt_token_here"
}
```

**Response:**
```json
{
  "code": 1000,
  "result": {
    "valid": true
  }
}
```

**Ví dụ JavaScript:**
```javascript
async function checkToken(token) {
  const response = await fetch('http://localhost:8080/identity/auth/introspect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token })
  });
  
  const data = await response.json();
  return data.result.valid;
}
```

---

### 1.3. Đăng xuất (Logout)
**Endpoint:** `POST /identity/auth/logout`  
**Mô tả:** Vô hiệu hóa token hiện tại  
**Public:** ✅ Không cần authentication

**Request Body:**
```json
{
  "token": "your_jwt_token_here"
}
```

**Response:**
```json
{
  "code": 1000
}
```

**Ví dụ JavaScript:**
```javascript
async function logout() {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:8080/identity/auth/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token })
  });
  
  // Xóa token khỏi localStorage
  localStorage.removeItem('token');
  return await response.json();
}
```

---

### 1.4. Refresh Token
**Endpoint:** `POST /identity/auth/refresh`  
**Mô tả:** Làm mới token khi hết hạn  
**Public:** ✅ Không cần authentication

**Request Body:**
```json
{
  "token": "your_refresh_token_here"
}
```

**Response:**
```json
{
  "code": 1000,
  "result": {
    "token": "new_jwt_token_here",
    "authenticated": true
  }
}
```

**Ví dụ JavaScript:**
```javascript
async function refreshToken(oldToken) {
  const response = await fetch('http://localhost:8080/identity/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token: oldToken })
  });
  
  const data = await response.json();
  if (data.code === 1000) {
    // Cập nhật token mới
    localStorage.setItem('token', data.result.token);
    return data.result.token;
  }
}
```

---

## 2. USER APIs

### 2.1. Tạo User mới (Đăng ký)
**Endpoint:** `POST /identity/users`  
**Mô tả:** Đăng ký tài khoản mới  
**Public:** ✅ Không cần authentication

**Request Body:**
```json
{
  "username": "john_doe",
  "firstname": "John",
  "lastname": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "dateOfBirth": "2000-01-15"
}
```

**Validation Rules:**
- `username`: Tối thiểu 3 ký tự
- `email`: Phải là email hợp lệ, không được null
- `password`: Tối thiểu 8 ký tự
- `dateOfBirth`: Người dùng phải trên 5 tuổi (format: YYYY-MM-DD)

**Response thành công:**
```json
{
  "code": 1000,
  "result": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "dateOfBirth": "2000-01-15",
    "roles": []
  }
}
```

**Ví dụ JavaScript:**
```javascript
async function registerUser(userData) {
  const response = await fetch('http://localhost:8080/identity/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  
  return await response.json();
}
```

---

### 2.2. Lấy danh sách Users
**Endpoint:** `GET /identity/users`  
**Mô tả:** Lấy tất cả users trong hệ thống  
**Authentication:** ✅ Yêu cầu JWT token

**Headers:**
```
Authorization: Bearer your_jwt_token_here
```

**Response:**
```json
{
  "code": 1000,
  "result": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "john_doe",
      "firstname": "John",
      "lastname": "Doe",
      "email": "john@example.com",
      "dateOfBirth": "2000-01-15",
      "roles": [
        {
          "name": "USER",
          "description": "User role",
          "permissions": []
        }
      ]
    }
  ]
}
```

**Ví dụ JavaScript:**
```javascript
async function getAllUsers() {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:8080/identity/users', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  return await response.json();
}
```

---

### 2.3. Lấy thông tin User đang đăng nhập
**Endpoint:** `GET /identity/users/me`  
**Mô tả:** Lấy thông tin của user hiện tại (từ token)  
**Authentication:** ✅ Yêu cầu JWT token

**Response:**
```json
{
  "code": 1000,
  "result": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "dateOfBirth": "2000-01-15",
    "roles": [
      {
        "name": "USER",
        "description": "User role",
        "permissions": []
      }
    ]
  }
}
```

**Ví dụ JavaScript:**
```javascript
async function getMyInfo() {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:8080/identity/users/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
}
```

---

### 2.4. Lấy thông tin User theo ID
**Endpoint:** `GET /identity/users/{userId}`  
**Mô tả:** Lấy thông tin của một user cụ thể  
**Authentication:** ✅ Yêu cầu JWT token

**Path Parameters:**
- `userId`: ID của user cần lấy thông tin

**Response:**
```json
{
  "code": 1000,
  "result": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "dateOfBirth": "2000-01-15",
    "roles": []
  }
}
```

**Ví dụ JavaScript:**
```javascript
async function getUserById(userId) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:8080/identity/users/${userId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
}
```

---

### 2.5. Cập nhật User (Admin)
**Endpoint:** `PUT /identity/users/{userId}`  
**Mô tả:** Cập nhật thông tin user (có thể gán roles)  
**Authentication:** ✅ Yêu cầu JWT token (thường cần quyền admin)

**Path Parameters:**
- `userId`: ID của user cần cập nhật

**Request Body:**
```json
{
  "username": "john_doe_updated",
  "firstname": "John",
  "lastname": "Doe",
  "email": "john.updated@example.com",
  "password": "newpassword123",
  "dateOfBirth": "2000-01-15",
  "roles": ["ADMIN", "USER"]
}
```

**Validation Rules:**
- `dateOfBirth`: Người dùng phải trên 18 tuổi

**Response:**
```json
{
  "code": 1000,
  "result": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe_updated",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john.updated@example.com",
    "dateOfBirth": "2000-01-15",
    "roles": [
      {
        "name": "ADMIN",
        "description": "Admin role",
        "permissions": []
      }
    ]
  }
}
```

**Ví dụ JavaScript:**
```javascript
async function updateUser(userId, updateData) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:8080/identity/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updateData)
  });
  
  return await response.json();
}
```

---

### 2.6. Cập nhật thông tin của chính mình
**Endpoint:** `PUT /identity/users/me`  
**Mô tả:** User tự cập nhật thông tin của mình (không thể đổi roles)  
**Authentication:** ✅ Yêu cầu JWT token

**Request Body:**
```json
{
  "username": "john_doe_updated",
  "firstname": "John",
  "lastname": "Doe",
  "password": "newpassword123",
  "dateOfBirth": "2000-01-15"
}
```

**Note:** Không có field `email` và `roles` trong request này

**Response:**
```json
{
  "code": 1000,
  "result": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe_updated",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "dateOfBirth": "2000-01-15",
    "roles": []
  }
}
```

**Ví dụ JavaScript:**
```javascript
async function updateMyInfo(updateData) {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:8080/identity/users/me', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updateData)
  });
  
  return await response.json();
}
```

---

### 2.7. Xóa User
**Endpoint:** `DELETE /identity/users/{userId}`  
**Mô tả:** Xóa user khỏi hệ thống  
**Authentication:** ✅ Yêu cầu JWT token (thường cần quyền admin)

**Path Parameters:**
- `userId`: ID của user cần xóa

**Response:**
```json
{
  "code": 1000,
  "result": "User deleted successfully!"
}
```

**Ví dụ JavaScript:**
```javascript
async function deleteUser(userId) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:8080/identity/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
}
```

---

## 3. ROLE APIs

### 3.1. Tạo Role mới
**Endpoint:** `POST /identity/roles`  
**Mô tả:** Tạo role mới trong hệ thống  
**Authentication:** ✅ Yêu cầu JWT token

**Request Body:**
```json
{
  "name": "MODERATOR",
  "description": "Moderator role",
  "permissions": ["CREATE_POST", "EDIT_POST", "DELETE_POST"]
}
```

**Response:**
```json
{
  "code": 1000,
  "result": {
    "name": "MODERATOR",
    "description": "Moderator role",
    "permissions": [
      {
        "name": "CREATE_POST",
        "description": "Create post permission"
      },
      {
        "name": "EDIT_POST",
        "description": "Edit post permission"
      }
    ]
  }
}
```

**Ví dụ JavaScript:**
```javascript
async function createRole(roleData) {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:8080/identity/roles', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(roleData)
  });
  
  return await response.json();
}
```

---

### 3.2. Lấy danh sách Roles
**Endpoint:** `GET /identity/roles`  
**Mô tả:** Lấy tất cả roles trong hệ thống  
**Authentication:** ✅ Yêu cầu JWT token

**Response:**
```json
{
  "code": 1000,
  "result": [
    {
      "name": "ADMIN",
      "description": "Administrator role",
      "permissions": [
        {
          "name": "FULL_ACCESS",
          "description": "Full system access"
        }
      ]
    },
    {
      "name": "USER",
      "description": "Regular user role",
      "permissions": []
    }
  ]
}
```

**Ví dụ JavaScript:**
```javascript
async function getAllRoles() {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:8080/identity/roles', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
}
```

---

### 3.3. Xóa Role
**Endpoint:** `DELETE /identity/roles/{role}`  
**Mô tả:** Xóa role khỏi hệ thống  
**Authentication:** ✅ Yêu cầu JWT token

**Path Parameters:**
- `role`: Tên của role cần xóa

**Response:**
```json
{
  "code": 1000
}
```

**Ví dụ JavaScript:**
```javascript
async function deleteRole(roleName) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:8080/identity/roles/${roleName}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
}
```

---

## 4. PERMISSION APIs

### 4.1. Tạo Permission mới
**Endpoint:** `POST /identity/permissions`  
**Mô tả:** Tạo permission mới trong hệ thống  
**Authentication:** ✅ Yêu cầu JWT token

**Request Body:**
```json
{
  "name": "DELETE_USER",
  "description": "Permission to delete users"
}
```

**Response:**
```json
{
  "code": 1000,
  "result": {
    "name": "DELETE_USER",
    "description": "Permission to delete users"
  }
}
```

**Ví dụ JavaScript:**
```javascript
async function createPermission(permissionData) {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:8080/identity/permissions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(permissionData)
  });
  
  return await response.json();
}
```

---

### 4.2. Lấy danh sách Permissions
**Endpoint:** `GET /identity/permissions`  
**Mô tả:** Lấy tất cả permissions trong hệ thống  
**Authentication:** ✅ Yêu cầu JWT token

**Response:**
```json
{
  "code": 1000,
  "result": [
    {
      "name": "CREATE_USER",
      "description": "Create user permission"
    },
    {
      "name": "EDIT_USER",
      "description": "Edit user permission"
    },
    {
      "name": "DELETE_USER",
      "description": "Delete user permission"
    }
  ]
}
```

**Ví dụ JavaScript:**
```javascript
async function getAllPermissions() {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:8080/identity/permissions', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
}
```

---

### 4.3. Xóa Permission
**Endpoint:** `DELETE /identity/permissions/{permission}`  
**Mô tả:** Xóa permission khỏi hệ thống  
**Authentication:** ✅ Yêu cầu JWT token

**Path Parameters:**
- `permission`: Tên của permission cần xóa

**Response:**
```json
{
  "code": 1000
}
```

**Ví dụ JavaScript:**
```javascript
async function deletePermission(permissionName) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:8080/identity/permissions/${permissionName}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
}
```

---

## 5. ERROR CODES

Danh sách các mã lỗi có thể gặp phải:

| Code | Message | HTTP Status | Mô tả |
|------|---------|-------------|-------|
| 1000 | Success | 200 | Thành công |
| 1001 | Invalid message key | 400 | Key message không hợp lệ |
| 1002 | User already exists | 400 | Email đã tồn tại trong hệ thống |
| 1003 | Username must be at least {min} characters | 400 | Username quá ngắn |
| 1004 | Password must be at least {min} characters | 400 | Password quá ngắn (tối thiểu 8 ký tự) |
| 1005 | Email is not valid | 400 | Email không đúng định dạng |
| 1006 | User not exist | 404 | User không tồn tại |
| 1007 | Unauthenticated | 401 | Chưa đăng nhập hoặc token không hợp lệ |
| 1008 | You don't have permission | 403 | Không có quyền truy cập |
| 1009 | Your age must be at least {min} | 400 | Tuổi không đủ yêu cầu |
| 9999 | Uncategorized error | 500 | Lỗi không xác định |

**Ví dụ xử lý lỗi:**
```javascript
async function handleApiCall(apiFunction) {
  try {
    const response = await apiFunction();
    
    if (response.code === 1000) {
      // Thành công
      return response.result;
    } else {
      // Có lỗi
      switch(response.code) {
        case 1007:
          // Token hết hạn, redirect về trang login
          window.location.href = '/login.html';
          break;
        case 1008:
          alert('Bạn không có quyền thực hiện thao tác này!');
          break;
        default:
          alert(response.message || 'Có lỗi xảy ra!');
      }
    }
  } catch (error) {
    console.error('Network error:', error);
    alert('Không thể kết nối đến server!');
  }
}
```

---

## 6. UTILITY FUNCTIONS - Các hàm hỗ trợ Frontend

### 6.1. API Helper Class
```javascript
class ApiHelper {
  constructor(baseUrl = 'http://localhost:8080/identity') {
    this.baseUrl = baseUrl;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  setToken(token) {
    localStorage.setItem('token', token);
  }

  clearToken() {
    localStorage.removeItem('token');
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token && !options.skipAuth) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json();

      if (data.code === 1007) {
        // Token hết hạn, redirect về login
        this.clearToken();
        window.location.href = '/login.html';
        return null;
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, body, skipAuth = false) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      skipAuth
    });
  }

  // PUT request
  async put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// Sử dụng
const api = new ApiHelper();

// Login
const loginResult = await api.post('/auth/token', {
  email: 'user@example.com',
  password: 'password123'
}, true); // skipAuth = true vì đây là public endpoint

// Get users (cần auth)
const users = await api.get('/users');
```

---

### 6.2. Form Validation Helper
```javascript
const ValidationRules = {
  username: {
    minLength: 3,
    pattern: /^[a-zA-Z0-9_]+$/,
    message: 'Username phải có ít nhất 3 ký tự và chỉ chứa chữ, số, gạch dưới'
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Email không đúng định dạng'
  },
  password: {
    minLength: 8,
    message: 'Password phải có ít nhất 8 ký tự'
  },
  dateOfBirth: {
    minAge: 5,
    message: 'Bạn phải trên 5 tuổi'
  }
};

function validateForm(formData) {
  const errors = {};

  // Validate username
  if (formData.username && formData.username.length < ValidationRules.username.minLength) {
    errors.username = ValidationRules.username.message;
  }

  // Validate email
  if (formData.email && !ValidationRules.email.pattern.test(formData.email)) {
    errors.email = ValidationRules.email.message;
  }

  // Validate password
  if (formData.password && formData.password.length < ValidationRules.password.minLength) {
    errors.password = ValidationRules.password.message;
  }

  // Validate date of birth
  if (formData.dateOfBirth) {
    const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age < ValidationRules.dateOfBirth.minAge) {
      errors.dateOfBirth = ValidationRules.dateOfBirth.message;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Sử dụng
const formData = {
  username: 'john',
  email: 'john@example.com',
  password: 'pass123',
  dateOfBirth: '2020-01-01'
};

const validation = validateForm(formData);
if (!validation.isValid) {
  console.log('Validation errors:', validation.errors);
}
```

---

### 6.3. Date Formatter
```javascript
function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

function formatDateForApi(dateString) {
  // Convert từ DD/MM/YYYY sang YYYY-MM-DD cho API
  if (!dateString) return '';
  
  const parts = dateString.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateString;
}

function getCurrentDateForInput() {
  // Trả về ngày hiện tại dạng YYYY-MM-DD cho input type="date"
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}
```

---

## 7. SAMPLE UI FLOWS - Luồng giao diện mẫu

### 7.1. Luồng Đăng nhập
```javascript
// login.html - Form submit handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  const api = new ApiHelper();
  
  try {
    const response = await api.post('/auth/token', { email, password }, true);
    
    if (response.code === 1000) {
      // Lưu token
      api.setToken(response.result.token);
      
      // Redirect về trang chủ
      window.location.href = '/dashboard.html';
    } else {
      // Hiển thị lỗi
      document.getElementById('errorMessage').textContent = response.message;
    }
  } catch (error) {
    document.getElementById('errorMessage').textContent = 'Không thể kết nối đến server!';
  }
});
```

---

### 7.2. Luồng Đăng ký
```javascript
// register.html - Form submit handler
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = {
    username: document.getElementById('username').value,
    firstname: document.getElementById('firstname').value,
    lastname: document.getElementById('lastname').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
    dateOfBirth: document.getElementById('dateOfBirth').value
  };
  
  // Validate trước khi gửi
  const validation = validateForm(formData);
  if (!validation.isValid) {
    displayErrors(validation.errors);
    return;
  }
  
  const api = new ApiHelper();
  
  try {
    const response = await api.post('/users', formData, true);
    
    if (response.code === 1000) {
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      window.location.href = '/login.html';
    } else if (response.code === 1002) {
      document.getElementById('emailError').textContent = 'Email đã tồn tại!';
    } else {
      alert(response.message || 'Có lỗi xảy ra!');
    }
  } catch (error) {
    alert('Không thể kết nối đến server!');
  }
});

function displayErrors(errors) {
  // Clear previous errors
  document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
  
  // Display new errors
  for (const [field, message] of Object.entries(errors)) {
    const errorElement = document.getElementById(`${field}Error`);
    if (errorElement) {
      errorElement.textContent = message;
    }
  }
}
```

---

### 7.3. Luồng Dashboard - Hiển thị thông tin User
```javascript
// dashboard.html - Load user info
async function loadUserInfo() {
  const api = new ApiHelper();
  
  try {
    const response = await api.get('/users/me');
    
    if (response.code === 1000) {
      const user = response.result;
      
      // Hiển thị thông tin user
      document.getElementById('username').textContent = user.username;
      document.getElementById('email').textContent = user.email;
      document.getElementById('fullname').textContent = 
        `${user.firstname} ${user.lastname}`;
      document.getElementById('dateOfBirth').textContent = 
        formatDate(user.dateOfBirth);
      
      // Hiển thị roles
      const rolesContainer = document.getElementById('roles');
      rolesContainer.innerHTML = user.roles
        .map(role => `<span class="badge">${role.name}</span>`)
        .join('');
    }
  } catch (error) {
    console.error('Error loading user info:', error);
  }
}

// Load khi trang được mở
document.addEventListener('DOMContentLoaded', loadUserInfo);
```

---

### 7.4. Luồng Quản lý Users (Admin)
```javascript
// admin-users.html - Load danh sách users
async function loadUsers() {
  const api = new ApiHelper();
  
  try {
    const response = await api.get('/users');
    
    if (response.code === 1000) {
      const users = response.result;
      displayUsersTable(users);
    } else if (response.code === 1008) {
      alert('Bạn không có quyền truy cập trang này!');
      window.location.href = '/dashboard.html';
    }
  } catch (error) {
    console.error('Error loading users:', error);
  }
}

function displayUsersTable(users) {
  const tbody = document.getElementById('usersTableBody');
  
  tbody.innerHTML = users.map(user => `
    <tr>
      <td>${user.username}</td>
      <td>${user.email}</td>
      <td>${user.firstname} ${user.lastname}</td>
      <td>${formatDate(user.dateOfBirth)}</td>
      <td>${user.roles.map(r => r.name).join(', ')}</td>
      <td>
        <button onclick="editUser('${user.id}')" class="btn-edit">Sửa</button>
        <button onclick="deleteUserConfirm('${user.id}')" class="btn-delete">Xóa</button>
      </td>
    </tr>
  `).join('');
}

async function deleteUserConfirm(userId) {
  if (!confirm('Bạn có chắc muốn xóa user này?')) {
    return;
  }
  
  const api = new ApiHelper();
  
  try {
    const response = await api.delete(`/users/${userId}`);
    
    if (response.code === 1000) {
      alert('Xóa user thành công!');
      loadUsers(); // Reload danh sách
    } else {
      alert(response.message || 'Có lỗi xảy ra!');
    }
  } catch (error) {
    alert('Không thể xóa user!');
  }
}
```

---

### 7.5. Luồng Logout
```javascript
// Logout button handler
document.getElementById('logoutBtn').addEventListener('click', async () => {
  const api = new ApiHelper();
  const token = api.getToken();
  
  if (!token) {
    window.location.href = '/login.html';
    return;
  }
  
  try {
    await api.post('/auth/logout', { token }, true);
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Dù có lỗi hay không cũng clear token và redirect
    api.clearToken();
    window.location.href = '/login.html';
  }
});
```

---

## 8. SECURITY NOTES - Lưu ý bảo mật

### 8.1. Token Management
- **Lưu token ở đâu?** Nên lưu trong `localStorage` hoặc `sessionStorage`
- **Thời gian sống:** Access token có thời gian sống ngắn (5 phút), cần implement refresh token
- **Auto refresh:** Nên có cơ chế tự động refresh token trước khi hết hạn

```javascript
class TokenManager {
  constructor() {
    this.checkTokenExpiration();
  }

  checkTokenExpiration() {
    setInterval(() => {
      const token = localStorage.getItem('token');
      if (token) {
        // Decode JWT để kiểm tra expiration
        // Hoặc gọi introspect API
        this.introspectToken(token);
      }
    }, 60000); // Check mỗi phút
  }

  async introspectToken(token) {
    const api = new ApiHelper();
    const response = await api.post('/auth/introspect', { token }, true);
    
    if (response.code === 1000 && !response.result.valid) {
      // Token hết hạn, thử refresh
      await this.refreshToken(token);
    }
  }

  async refreshToken(oldToken) {
    const api = new ApiHelper();
    const response = await api.post('/auth/refresh', { token: oldToken }, true);
    
    if (response.code === 1000) {
      api.setToken(response.result.token);
    } else {
      // Refresh thất bại, redirect về login
      api.clearToken();
      window.location.href = '/login.html';
    }
  }
}

// Khởi động token manager
const tokenManager = new TokenManager();
```

---

### 8.2. CORS Configuration
Nếu gặp lỗi CORS khi gọi API từ frontend, cần config CORS ở backend hoặc sử dụng proxy.

---

### 8.3. Input Sanitization
Luôn validate và sanitize input trước khi gửi lên server:

```javascript
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, ''); // Remove < và >
}
```

---

## 9. TESTING - Kiểm thử API

### 9.1. Test với Postman
Import các endpoint sau vào Postman để test:

**Collection structure:**
```
BuildPC Checker API
├── Authentication
│   ├── Login (POST /identity/auth/token)
│   ├── Introspect (POST /identity/auth/introspect)
│   ├── Logout (POST /identity/auth/logout)
│   └── Refresh Token (POST /identity/auth/refresh)
├── Users
│   ├── Create User (POST /identity/users)
│   ├── Get All Users (GET /identity/users)
│   ├── Get My Info (GET /identity/users/me)
│   ├── Get User By ID (GET /identity/users/{userId})
│   ├── Update User (PUT /identity/users/{userId})
│   ├── Update My Info (PUT /identity/users/me)
│   └── Delete User (DELETE /identity/users/{userId})
├── Roles
│   ├── Create Role (POST /identity/roles)
│   ├── Get All Roles (GET /identity/roles)
│   └── Delete Role (DELETE /identity/roles/{role})
└── Permissions
    ├── Create Permission (POST /identity/permissions)
    ├── Get All Permissions (GET /identity/permissions)
    └── Delete Permission (DELETE /identity/permissions/{permission})
```

---

### 9.2. Test với cURL
```bash
# Login
curl -X POST http://localhost:8080/identity/auth/token \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@example.com\",\"password\":\"password123\"}"

# Get users (với token)
curl -X GET http://localhost:8080/identity/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 10. DEPLOYMENT - Triển khai

### 10.1. Environment Variables
Khi deploy frontend, cần config base URL theo môi trường:

```javascript
// config.js
const config = {
  development: {
    apiBaseUrl: 'http://localhost:8080/identity'
  },
  production: {
    apiBaseUrl: 'https://api.yourdomain.com/identity'
  }
};

const ENV = 'development'; // Đổi thành 'production' khi deploy
export const API_BASE_URL = config[ENV].apiBaseUrl;
```

---

## 11. CHANGELOG

### Version 1.0.0 (Current)
- Authentication với JWT
- User Management (CRUD)
- Role & Permission Management
- Token refresh mechanism

---

## 12. SUPPORT & CONTACT

Nếu có vấn đề hoặc câu hỏi, vui lòng liên hệ team phát triển.

**Base URL:** http://localhost:8080/identity  
**Database:** MySQL (identity_service)  
**Port:** 8080

---

## PHỤ LỤC: Quick Reference

### HTTP Methods
- **GET**: Lấy dữ liệu
- **POST**: Tạo mới
- **PUT**: Cập nhật
- **DELETE**: Xóa

### Authentication Required
- ✅ Yêu cầu JWT token trong header
- ❌ Không yêu cầu authentication (public endpoint)

### Date Format
- **Input/Output API**: `YYYY-MM-DD` (ví dụ: `2000-01-15`)
- **Display**: `DD/MM/YYYY` (ví dụ: `15/01/2000`)

### Public Endpoints (không cần token)
- `POST /identity/users` - Đăng ký
- `POST /identity/auth/token` - Đăng nhập
- `POST /identity/auth/introspect` - Kiểm tra token
- `POST /identity/auth/logout` - Đăng xuất
- `POST /identity/auth/refresh` - Refresh token

### Protected Endpoints (cần token)
- Tất cả các endpoint còn lại đều cần JWT token

---

**Document Version:** 1.0.0  
**Last Updated:** 2026-02-02  
**Author:** BuildPC Checker Team


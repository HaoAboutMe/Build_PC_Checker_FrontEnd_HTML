# Auto Token Refresh Implementation

## 🔐 Tính năng

Hệ thống tự động refresh token khi hết hạn, giúp user không bị gián đoạn khi sử dụng web.

## ⚙️ Cách hoạt động

### 1. **Phát hiện token hết hạn**
- Khi API trả về code `1007` (Unauthenticated)
- Hệ thống tự động gọi endpoint refresh token

### 2. **Refresh token**
```javascript
POST /identity/auth/refresh
{
  "token": "current_token"
}
```

### 3. **Retry request**
- Sau khi refresh thành công, tự động retry request ban đầu
- User không cảm nhận được sự gián đoạn

### 4. **Xử lý lỗi**
- Nếu refresh thất bại → Hiển thị toast "Phiên đăng nhập hết hạn"
- Tự động logout sau 2 giây
- Redirect về trang login

## 🎯 Ưu điểm

✅ **Seamless UX**: User không bị logout đột ngột  
✅ **Auto retry**: Request tự động retry sau khi refresh  
✅ **Prevent race condition**: Chỉ 1 refresh request tại 1 thời điểm  
✅ **Graceful degradation**: Nếu refresh fail, logout an toàn  

## 📝 Token Lifetime

- **Access Token**: 5 phút
- **Refresh Token**: 20 phút
- Hệ thống tự động refresh khi access token hết hạn

## 🔍 Debug

Mở Console (F12) để xem logs:
- `⚠️ Token expired, attempting refresh...` - Token hết hạn
- `✅ Token refreshed successfully` - Refresh thành công
- `🔄 Retrying request with new token...` - Retry request
- `❌ Token refresh failed, logging out...` - Refresh thất bại

## 🚀 Test

1. Đăng nhập vào hệ thống
2. Đợi 5 phút (hoặc set token expire ngắn hơn ở backend)
3. Thực hiện 1 action (edit profile, change password, etc.)
4. Hệ thống sẽ tự động refresh token và thực hiện action thành công

## 🛠️ Implementation Details

### Prevent Multiple Refresh Attempts
```javascript
let isRefreshing = false;
let refreshPromise = null;

// Chỉ 1 refresh request tại 1 thời điểm
if (!isRefreshing) {
    isRefreshing = true;
    refreshPromise = refreshToken();
}
```

### Retry Logic
```javascript
// Retry count để tránh infinite loop
async function apiCall(endpoint, options = {}, retryCount = 0) {
    // Chỉ retry 1 lần
    if (data.code === 1007 && retryCount === 0) {
        // Refresh and retry
    }
}
```

## ⚠️ Lưu ý

- Refresh token chỉ hoạt động khi có token trong localStorage
- Nếu refresh token cũng hết hạn, user phải đăng nhập lại
- Hệ thống tự động clear token và redirect về login khi refresh fail

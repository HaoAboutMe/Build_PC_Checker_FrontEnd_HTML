# Kế hoạch Chuyển đổi Dự án Build PC Support sang Next.js (TypeScript)

Bản kế hoạch này chi tiết lộ trình chuyển đổi giao diện từ HTML/CSS/JS thuần sang framework **Next.js** sử dụng **TypeScript**, đảm bảo giữ nguyên bản sắc thiết kế nhưng tối ưu hóa hiệu năng, trải nghiệm người dùng và khả năng bảo trì.

## 1. Mục tiêu & Công nghệ Đề xuất

### 1.1. Công nghệ (Stack)
- **Framework:** [Next.js](https://nextjs.org/) (App Router) - Tối ưu SEO, tốc độ tải trang và Routing mạnh mẽ.
- **Ngôn ngữ:** TypeScript - Tăng tính an toàn và hạn chế lỗi runtime cho các logic phức tạp (kiểm tra tương thích linh kiện).
- **Quản lý trạng thái (State Management):**
    - [Zustand](https://zustand-demo.pmnd.rs/): Nhẹ, nhanh, dùng cho Auth và lưu trữ cấu hình PC đang build.
    - [TanStack Query (React Query)](https://tanstack.com/query/latest): Quản lý dữ liệu từ API (caching, loading, error handling).
- **Styling:** CSS Modules (vanilla CSS nâng cao) - Giữ nguyên bộ CSS hiện tại nhưng được đóng gói theo từng Component để tránh xung đột.
- **Icons:** FontAwesome 6 (Giữ nguyên) & Lucide React (cho các UI micro-interactions).

### 1.2. Cải thiện trải nghiệm (UX)
- **Client-side Routing:** Chuyển trang ngay lập tức không cần load lại toàn bộ Page.
- **Optimistic UI:** Hiển thị kết quả build hoặc thay đổi thông tin ngay khi người dùng thao tác.
- **Skeleton Loading:** Trải nghiệm mượt mà hơn khi đang tải dữ liệu linh kiện thay vì dùng Spinner đơn điệu.
- **Responsive:** Tối ưu hóa triệt để cho Mobile (hiện tại giao diện chủ yếu cho Desktop).

---

## 2. Cấu trúc Thư mục Dự kiến

```text
/src
  /app                  # Next.js App Router (Pages & Layouts)
    /login, /register   # Auth pages
    /build-pc           # Core PC Builder logic
    /my-builds          # Saved configurations
    /profile            # User settings
    /admin              # Dashboard quản trị
  /components           # Reusable UI components
    /common             # Header, Footer, Button, Input...
    /pc-builder         # ComponentCard, CompatibilityChecker...
    /shared             # Toast, Modal, Skeleton...
  /services             # API calls (Axios/Fetch wrappers)
  /store                # Zustand stores (useAuth, useBuild)
  /hooks                # Custom React hooks (useDebounce, useMediaQuery)
  /types                # TypeScript definitions for CPU, RAM, VGA...
  /styles               # Toàn bộ CSS hiện tại sẽ được module hóa
  /utils                # Helper functions (formatPrice, checkCompatibility)
```

---

## 3. Lộ trình Triển khai (Phân kỳ)

### Giai đoạn 1: Thiết lập Nền tảng (Dự kiến 3-5 ngày)
1. **Khởi tạo dự án:** `npx create-next-app@latest` với TypeScript và CSS Modules.
2. **Hệ thống Design System:** Chuyển đổi các biến CSS (colors, spacing, shadows) từ `home.css` vào `:root` trong `globals.css`.
3. **Components dùng chung:** Xây dựng `Header`, `Footer`, `Sidebar` và Layout bao quanh (Persistent Layout).
4. **API Integration:** Thiết lập Axios client với Interceptors để xử lý JWT và tự động Refresh Token (từ logic `apiCall` trong `home.js`).

### Giai đoạn 2: Auth & Profile (Dự kiến 4-6 ngày)
1. **Hệ thống Login/Register/Forgot Password:** Chuyển đổi logic từ `login.js` sang React Hook Form và Zod (validation).
2. **Trạng thái Người dùng:** Xây dựng `useAuthStore` để quản lý thông tin User toàn cục.
3. **Trang Profile:** Chuyển đổi logic cập nhật thông tin và đổi mật khẩu.

### Giai đoạn 3: Tính năng cốt loi - PC Builder (Dự kiến 7-10 ngày)
Đây là phần quan trọng nhất, chuyển đổi logic từ `build-pc.js` (gần 50,000 dòng code JS thuần).
1. **Dữ liệu Linh kiện:** Sử dụng React Query để fetch và cache danh sách CPU, Mainboard, RAM...
2. **Logic Tương thích:** Chuyển đổi toàn bộ hàm `checkCompatibility` sang TypeScript để tận dụng Type Safety (đảm bảo Socket CPU khớp với Mainboard, TDP đủ với PSU...).
3. **Xây dựng cấu hình:** Tạo `useBuildStore` để lưu trữ cấu hình PC hiện tại, hỗ trợ tính tổng tiền, tổng công suất và kiểm tra lỗi theo thời gian thực.
4. **Lưu/Chỉnh sửa cấu hình:** Kết nối với các trang `my-builds` và `edit-build`.

### Giai đoạn 4: Community & Chi tiết Linh kiện (Dự kiến 3-5 ngày)
1. **Danh mục linh kiện:** Tối ưu hóa bộ lọc (Filters) và phân trang (Pagination) mượt mà hơn.
2. **Chi tiết linh kiện:** Tái cấu trúc `item-details` thành các dynamic route `/items/[id]`.
3. **Admin Dashboard:** Chuyển đổi các bảng quản lý và CRUD linh kiện (nếu cần thiết ở frontend này).

---

## 4. Các điểm cần chú ý khi Migration

1. **CSS Porting:** Sử dụng tính năng `:global` trong CSS Modules nếu muốn giữ nguyên các selector hiện tại mà không phải sửa class quá nhiều trong HTML.
2. **External Assets:** Chuyển toàn bộ ảnh trong `public/images/` sang thư mục `public/` của Next.js để sử dụng component `next/image` (tự động tối ưu dung lượng ảnh).
3. **Compatibility Logic:** Cần kiểm tra kỹ các điều kiện Logic trong `build-pc.js` vì đây là phần phức tạp nhất. Khi chuyển sang TS, chúng ta sẽ có Interface rõ ràng cho từng linh kiện.
    - *Ví dụ:* `interface CPU { socket: string; tdp: number; hasIntegratedGraphics: boolean; ... }`
4. **Broken Assets:** Thay thế các đường dẫn ảnh Figma bị lỗi (đã phát hiện trong `home.html`) bằng icon FontAwesome hoặc ảnh cục bộ ổn định hơn.

## 5. Kết luận & Đề xuất tiếp theo

Dự án hiện tại có cấu trúc rất rõ ràng giữa các file HTML/JS, điều này giúp việc tách Component trong React trở nên thuận lợi. 

**Đề xuất:** Hãy bắt đầu với việc khởi tạo dự án Next.js và chuyển đổi **Trang Chủ** đầu tiên để thiết lập phong cách code và cấu trúc Component chuẩn. Sau đó mới đi sâu vào Logic "Build PC".

---
*Kế hoạch này được lập bởi Antigravity AI dựa trên yêu cầu của bạn.*

/**
 * MY BUILDS LOGIC - BuildPC Checker
 */

const API_BASE_URL = "http://localhost:8080/identity";

// Global State
let userBuilds = [];
let isRefreshing = false;
let refreshPromise = null;

/**
 * INITIALIZATION
 */
document.addEventListener("DOMContentLoaded", async () => {
    // 1. Load User Profile (for sidebar)
    await loadUserInfo();

    // 2. Fetch and render builds
    await loadMyBuilds();

    // 3. Setup Modal Close Events
    setupModalEvents();
});

/**
 * USER & AUTH LOGIC
 */
async function loadUserInfo() {
    const token = localStorage.getItem("token");
    const userBrief = document.getElementById("user-brief");
    const logoutBtn = document.getElementById("logout-btn");
    const adminNav = document.getElementById("admin-nav-item");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        
        if (data.code === 1000 && data.result) {
            const user = data.result;
            const displayName = user.username || user.firstname || "Người dùng";
            const initials = displayName.substring(0, 1).toUpperCase();
            
            userBrief.innerHTML = `
                <div class="user-avatar">${initials}</div>
                <div class="user-info">
                    <span class="name">${displayName}</span>
                    <span class="role">Thành viên</span>
                </div>
            `;

            const roles = (user.roles || []).map((r) => r.name || r);
            if (roles.includes("ADMIN") && adminNav) {
                adminNav.style.display = "block";
            }
        } else {
            // Token might be invalid or expired
            console.error("Auth failed:", data.message);
            // Don't redirect immediately to allow retry or refresh in other parts if needed, 
            // but for my-builds we often need auth.
            if(data.code === 1007) { // Token expired
                 // refreshToken will be called by apiCall later, but for sidebar we can try once
                 await refreshToken().catch(() => window.location.href = "login.html");
                 return loadUserInfo(); 
            }
        }
    } catch (e) {
        console.error("Auth check failed", e);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("token");
            window.location.href = "login.html";
        });
    }
}

/**
 * CORE API WRAPPER
 */
async function refreshToken() {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token to refresh");

    try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
        });
        const data = await response.json();
        if (data.code === 1000 && data.result.token) {
            localStorage.setItem("token", data.result.token);
            return data.result.token;
        } else {
            throw new Error("Refresh failed");
        }
    } catch (error) {
        localStorage.removeItem("token");
        window.location.href = 'login.html';
        throw error;
    }
}

async function apiCall(endpoint, method = "GET", body = null, retryCount = 0) {
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null,
        });

        const data = await response.json();

        if (data.code === 1007 && retryCount === 0) {
            if (!isRefreshing) {
                isRefreshing = true;
                refreshPromise = refreshToken().finally(() => {
                    isRefreshing = false;
                    refreshPromise = null;
                });
            }
            try {
                await refreshPromise;
                return apiCall(endpoint, method, body, retryCount + 1);
            } catch (err) {
                return data;
            }
        }

        return data;
    } catch (e) {
        console.error("API Fetch Error:", e);
        return { code: 9999, message: "Lỗi kết nối máy chủ" };
    }
}

/**
 * DATA LOADING & RENDERING
 */
async function loadMyBuilds() {
    const grid = document.getElementById("builds-grid");
    
    const res = await apiCall("/builds");
    
    // Hide loader
    const loader = document.getElementById("builds-loader");
    if (loader) loader.style.display = "none";

    if (res.code === 1000 && res.result) {
        userBuilds = res.result;
        renderBuildsGrid();
    } else {
        grid.innerHTML = `
            <div class="empty-builds">
                <i class="fas fa-exclamation-circle" style="color: var(--danger)"></i>
                <h3>Lỗi tải dữ liệu</h3>
                <p>${res.message || "Không thể kết nối đến máy chủ"}</p>
                <button class="btn-secondary" onclick="location.reload()">Thử lại</button>
            </div>
        `;
    }
}

function renderBuildsGrid() {
    const grid = document.getElementById("builds-grid");
    grid.innerHTML = "";

    if (userBuilds.length === 0) {
        grid.innerHTML = `
            <div class="empty-builds">
                <i class="fas fa-folder-open"></i>
                <h3>Chưa có cấu hình nào</h3>
                <p>Bạn chưa lưu bộ PC nào cả. Hãy bắt đầu xây dựng cấu hình đầu tiên ngay!</p>
                <a href="build-pc.html" class="btn-primary" style="text-decoration: none;">
                    <i class="fas fa-plus"></i> Bắt đầu ngay
                </a>
            </div>
        `;
        return;
    }

    userBuilds.forEach(build => {
        const card = document.createElement("div");
        card.className = "build-card";
        
        // Parts icons logic
        let partsHtml = "";
        const parts = build.parts || {};
        const partMappings = [
            { key: "CPU", icon: "fas fa-microchip" },
            { key: "MAINBOARD", icon: "fas fa-square" },
            { key: "RAM", icon: "fas fa-memory" },
            { key: "GPU", icon: "fas fa-video" },
            { key: "PSU", icon: "fas fa-plug" }
        ];

        partMappings.forEach(mapping => {
            if (parts[mapping.key]) {
                partsHtml += `<span class="part-tag"><i class="${mapping.icon}"></i> ${mapping.key}</span>`;
            }
        });

        const date = new Date(build.createdAt || Date.now()).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });

        card.innerHTML = `
            <div class="build-card-header">
                <div>
                    <h3 class="build-title">${build.name}</h3>
                    <span class="build-date"><i class="far fa-calendar-alt"></i> ${date}</span>
                </div>
                <div class="dropdown">
                    <button class="btn-circle" style="width: 32px; height: 32px;" onclick="toggleBuildOps(event, '${build.id}')">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>
            </div>
            <p class="build-desc">${build.description || "Không có mô tả chi tiết cho cấu hình này."}</p>
            <div class="build-parts-summary">
                ${partsHtml}
                ${Object.keys(parts).length > 5 ? `<span class="part-tag">+${Object.keys(parts).length - 5}</span>` : ""}
            </div>
            <div class="build-card-footer">
                <button class="btn-primary flex-1" onclick="openBuildDetail('${build.id}')">
                    <i class="fas fa-eye"></i> Xem chi tiết
                </button>
                <button class="btn-secondary" style="color: var(--danger)" onclick="confirmDeleteBuild(event, '${build.id}')" title="Xóa">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;

        card.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                openBuildDetail(build.id);
            }
        });

        grid.appendChild(card);
    });
}

/**
 * ACTIONS
 */
async function openBuildDetail(id) {
    window.location.href = `edit-build.html?id=${id}`;
}

function showConfirm(title, message, onOk) {
    const modal = document.getElementById("custom-confirm-modal");
    if (!modal) return;
    
    document.getElementById("confirm-title").innerText = title;
    document.getElementById("confirm-message").innerText = message;
    
    modal.classList.add("active");
    
    const okBtn = document.getElementById("confirm-ok-btn");
    const cancelBtn = document.getElementById("confirm-cancel-btn");
    
    okBtn.onclick = () => {
        modal.classList.remove("active");
        if (onOk) onOk();
    };
    
    cancelBtn.onclick = () => {
        modal.classList.remove("active");
    };
}

async function confirmDeleteBuild(event, id) {
    if (event) event.stopPropagation();
    
    showConfirm(
        "Xác nhận xóa", 
        "Bạn có chắc chắn muốn xóa vĩnh viễn cấu hình này không? Thao tác này không thể hoàn tác.",
        async () => {
            const res = await apiCall(`/builds/${id}`, "DELETE");
            if (res.code === 1000) {
                triggerToast("Đã xóa cấu hình", "success");
                userBuilds = userBuilds.filter(b => b.id !== id);
                renderBuildsGrid();
            } else {
                triggerToast(res.message || "Lỗi khi xóa", "error");
            }
        }
    );
}

function setupModalEvents() {
    const modal = document.getElementById("build-detail-modal");
    const closeBtn = document.getElementById("close-detail-btn");
    const closeBtnBot = document.getElementById("detail-close-btn-bottom");

    const hide = () => modal.classList.remove("active");

    closeBtn.onclick = hide;
    closeBtnBot.onclick = hide;
    modal.onclick = (e) => {
        if (e.target === modal) hide();
    };
}

// Global scope attachments
window.openBuildDetail = openBuildDetail;
window.confirmDeleteBuild = confirmDeleteBuild;

function triggerToast(msg, type = "success") {
    if (typeof window.showToast === "function") {
        window.showToast(msg, type);
    } else {
        alert(msg);
    }
}

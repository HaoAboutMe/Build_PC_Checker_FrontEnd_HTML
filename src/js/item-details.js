// item-details.js

const API_BASE_URL = "http://localhost:8080/identity";

const ENTITIES = {
    cpu: { url: "/cpus", title: "CPU" },
    mainboard: { url: "/mainboards", title: "Mainboard" },
    ram: { url: "/rams", title: "RAM" },
    vga: { url: "/vgas", title: "VGA" },
    ssd: { url: "/ssds", title: "SSD" },
    hdd: { url: "/hdds", title: "HDD" },
    psu: { url: "/psus", title: "PSU" },
    case: { url: "/cases", title: "Case" },
    cooler: { url: "/coolers", title: "Cooler" }
};

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

// ===================================
// PAGE LOGIC
// ===================================

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Check Authentication (Guest mode enabled)
    const token = localStorage.getItem('token');
    
    // 2. Load User or Guest Mode UI
    if (token) {
        await loadUserInfo();
    } else {
        setupGuestMode();
    }
    setupDropdown();

    // 3. Get Params
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    const id = urlParams.get('id');

    if (!type || !id) {
        alert('Thiếu thông tin linh kiện.');
        window.location.href = 'home.html';
        return;
    }

    // 4. Load Details
    await loadItemDetails(type, id);
});

async function loadItemDetails(type, id) {
    const entity = ENTITIES[type];
    if (!entity) return;

    try {
        const data = await apiCall(`${entity.url}/${id}`);
        // Result is wrapped in 'result' (based on current backend specs)
        const item = data.result || data;

        if (!item) throw new Error('Item not found');

        renderDetails(item, entity.title);
    } catch (error) {
        console.error('Error loading item details:', error);
        document.getElementById('item-name').textContent = 'Lỗi tải dữ liệu';
        document.getElementById('specs-grid').innerHTML = '<p class="error-msg">Không thể tìm thấy linh kiện hoặc có lỗi xảy ra.</p>';
    }
}

function renderDetails(item, categoryTitle) {
    // Get type from URL for back linking
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');

    // Update breadcrumb & titles
    const breadcrumbCat = document.getElementById('breadcrumb-cat');
    breadcrumbCat.textContent = categoryTitle;
    breadcrumbCat.href = `home.html?category=${type}`;

    document.getElementById('item-category').textContent = categoryTitle;
    document.getElementById('item-name').textContent = item.name || item.id;
    document.getElementById('breadcrumb-item').textContent = item.name || item.id;
    
    // Update Back button to go to specific category
    const backBtn = document.querySelector('.back-link-btn');
    if (backBtn) {
        backBtn.onclick = () => window.location.href = `home.html?category=${type}`;
    }

    // Update description
    const descEl = document.getElementById('item-description');
    if (item.description) {
        descEl.textContent = item.description;
        descEl.style.display = 'block';
    } else {
        descEl.style.display = 'none';
    }

    // Update image
    const imgUrl = item.imageUrl || item.coverImageUrl || 'https://via.placeholder.com/400?text=PC+Part';
    document.getElementById('item-image').src = imgUrl;

    // Filter and render specs
    const grid = document.getElementById('specs-grid');
    grid.innerHTML = '';

    // Fields to exclude from specs grid
    const excludedFields = ['score', 'id', 'imageUrl', 'coverImageUrl', 'name', 'description', 'enabled', 'deleted', 'code', 'result', 'message'];

    // Iterate through all keys in the item object
    Object.entries(item).forEach(([key, value]) => {
        if (excludedFields.includes(key) || value === null || value === undefined) return;

        let displayValue = value;

        // Custom formatting for complex types
        if (typeof value === 'object') {
            displayValue = (value.name || value.title || JSON.stringify(value));
        } else if (typeof value === 'boolean') {
            displayValue = value ? 'Có' : 'Không';
        }

        // Append units if applicable
        if (UNIT_MAP[key] && typeof displayValue === 'number') {
            displayValue = `${displayValue} ${UNIT_MAP[key]}`;
        } else if (UNIT_MAP[key] && typeof displayValue === 'string' && !isNaN(displayValue) && displayValue !== '') {
            displayValue = `${displayValue} ${UNIT_MAP[key]}`;
        }

        const specItem = document.createElement('div');
        specItem.className = 'spec-item';
        specItem.innerHTML = `
            <span class="spec-label">${formatLabel(key)}</span>
            <span class="spec-value">${displayValue}</span>
        `;
        grid.appendChild(specItem);
    });

    if (grid.children.length === 0) {
        grid.innerHTML = '<p style="color:#6c757d;">Thông số đang được cập nhật...</p>';
    }
}

const LABEL_MAP = {
    // Shared
    socket: "Socket",
    tdp: "Công suất (TDP)",
    tdpSupport: "Hỗ trợ TDP",
    pcieVersion: "Phiên bản PCIe",
    pcieVersionId: "Phiên bản PCIe",
    imageUrl: "Hình ảnh",
    description: "Mô tả",
    
    // CPU
    vrmMin: "VRM Tối thiểu",
    igpu: "Có iGPU",
    
    // Mainboard
    vrmPhase: "Số Pha VRM",
    cpuTdpSupport: "Hỗ trợ TDP CPU",
    ramType: "Loại RAM",
    ramTypeId: "Loại RAM",
    ramBusMax: "Bus RAM Tối đa",
    ramSlot: "Số khe RAM",
    ramMaxCapacity: "Dung lượng RAM MAX",
    pcieVgaVersion: "Chuẩn PCIe VGA",
    m2Slot: "Số khe M.2",
    sataSlot: "Số khe SATA",
    
    // RAM
    ramBus: "Tốc độ RAM",
    ramCas: "Độ trễ (CAS)",
    capacityPerStick: "Dung lượng/cây",
    
    // VGA
    vramGb: "VRAM (GB)",
    lengthMm: "Độ dài (mm)",
    powerConnector: "Nguồn phụ",
    
    // Storage
    capacity: "Dung lượng",
    formFactor: "Kích thước (FF)",
    interfaceType: "Chuẩn giao tiếp",
    ssdType: "Loại SSD",
    
    // PSU
    wattage: "Công suất (W)",
    efficiency: "Hiệu suất",
    sataConnector: "Cổng SATA",
    
    // Case
    size: "Kích cỡ Case",
    
    // Cooler
    radiatorSize: "Cỡ Radiator",
    heightMm: "Chiều cao (mm)",
    coolerType: "Loại Tản"
};

const UNIT_MAP = {
    // Power
    tdp: "W",
    tdpSupport: "W",
    cpuTdpSupport: "W",
    wattage: "W",
    
    // Speed
    ramBus: "MHz",
    ramBusMax: "MHz",
    
    // Capacity
    ramMaxCapacity: "GB",
    capacityPerStick: "GB",
    vramGb: "GB",
    capacity: "GB",
    minRamGb: "GB",
    minVramGb: "GB",
    minStorageGb: "GB",
    
    // Dimensions
    lengthMm: "mm",
    heightMm: "mm",
    radiatorSize: "mm"
};

// ===================================
// USER & GUEST HELPERS
// ===================================

async function loadUserInfo() {
    try {
        const data = await apiCall('/users/me');
        const user = data.result || data;
        if (user && (user.username || user.email)) {
            const fullName = `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.username || 'Người dùng';
            document.getElementById('display-username').textContent = fullName;
            document.getElementById('display-email').textContent = user.email || '';
            const text = user.firstname || user.username || 'U';
            document.getElementById('user-initials').textContent = text.substring(0, 2).toUpperCase();
        }
    } catch (error) {
        console.error('Error fetching user info:', error);
        setupGuestMode();
    }
}

function setupGuestMode() {
    const usernameEl = document.getElementById('display-username');
    const emailEl = document.getElementById('display-email');
    const initialsEl = document.getElementById('user-initials');
    if (usernameEl) usernameEl.textContent = 'Khách';
    if (emailEl) emailEl.textContent = 'Đăng nhập để dùng thêm';
    if (initialsEl) {
        initialsEl.textContent = '?';
        initialsEl.style.background = '#64748b';
    }
    const dropdown = document.getElementById('profile-dropdown');
    if (dropdown) {
        dropdown.innerHTML = `
            <a href="login.html" class="dropdown-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/></svg>
                Đăng nhập
            </a>
            <a href="register.html" class="dropdown-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>
                Tạo tài khoản
            </a>
        `;
    }
}

function setupDropdown() {
    const trigger = document.getElementById('user-menu-trigger');
    const menu = document.getElementById('profile-dropdown');
    if (trigger && menu) {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('active');
        });
        document.addEventListener('click', () => menu.classList.remove('active'));
    }
}

function formatLabel(key) {
    // Try to translate using the map, else fall back to auto-formatting
    if (LABEL_MAP[key]) return LABEL_MAP[key];

    // Fallback for keys ending in Id (e.g., socketId -> Socket)
    const cleanerKey = key.endsWith('Id') ? key.slice(0, -2) : key;
    if (LABEL_MAP[cleanerKey]) return LABEL_MAP[cleanerKey];

    // Auto-formatting (CamelCase to Space Case)
    const result = cleanerKey.replace(/([A-Z])/g, " $1");
    const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
    return finalResult.replace('_', ' ');
}

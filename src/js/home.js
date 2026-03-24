// home.js

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

// Filter Mapping
const FILTERS_CONFIG = {
  cpu: [{ key: "socketId", label: "Socket", api: "/sockets" }],
  mainboard: [
    { key: "socketId", label: "Socket", api: "/sockets" },
    { key: "ramTypeId", label: "Loại RAM", api: "/ram-types" },
    { key: "sizeId", label: "Kích cỡ", api: "/case-sizes" },
  ],
  ram: [{ key: "ramTypeId", label: "Loại RAM", api: "/ram-types" }],
  vga: [{ key: "pcieVersionId", label: "Chuẩn PCIe", api: "/pcie-versions" }],
  psu: [{ key: "efficiency", label: "Hiệu suất" }],
  ssd: [
    { key: "ssdTypeId", label: "Loại SSD", api: "/ssd-types" },
    { key: "formFactorId", label: "Kích thước", api: "/form-factors" },
  ],
  hdd: [{ key: "formFactorId", label: "Kích thước", api: "/form-factors" }],
  cooler: [{ key: "coolerTypeId", label: "Loại tản", api: "/cooler-types" }],
  case: [{ key: "sizeId", label: "Kích cỡ Case", api: "/case-sizes" }],
};

let currentCategoryItems = [];
let filteredItems = [];
let activeCategory = "";
let activeFilters = {};
let currentPage = 1;
const ITEMS_PER_PAGE = 12;

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Check Authentication (Guest mode enabled)
  const token = localStorage.getItem("token");

  // 2. Load User Info Or Guest
  if (token) {
    await loadUserInfo();
  } else {
    setupGuestMode();
  }

  // 3. Setup Dropdown
  setupDropdown();

  // 4. Setup Category Cards
  setupCategoryCards();

  // 5. Handle initial category from URL
  const urlParams = new URLSearchParams(window.location.search);
  const initialCat = urlParams.get("category");
  if (initialCat && ENTITIES[initialCat]) {
    fetchCategoryData(initialCat);
  }

  // 6. Global Search in Header
  const globalSearch = document.getElementById("global-search");
  if (globalSearch) {
    globalSearch.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase();

      // Sync with category search if results section is open
      const resSection = document.getElementById("results-display");
      const catSearch = document.getElementById("category-search");
      if (resSection.style.display === "block" && catSearch) {
        catSearch.value = e.target.value;
      }

      currentPage = 1;
      applyFilters();
    });
  }

  // 7. Category Results Search
  const catSearch = document.getElementById("category-search");
  if (catSearch) {
    catSearch.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase();

      // Sync with global header search
      const globalSearch = document.getElementById("global-search");
      if (globalSearch) globalSearch.value = e.target.value;

      currentPage = 1;
      applyFilters();
    });
  }

  // 8. Pagination Events
  document.getElementById("prev-page")?.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderPartsPage();
      document.getElementById("results-display").scrollIntoView();
    }
  });

  document.getElementById("next-page")?.addEventListener("click", () => {
    if (currentPage < Math.ceil(filteredItems.length / ITEMS_PER_PAGE)) {
      currentPage++;
      renderPartsPage();
      document.getElementById("results-display").scrollIntoView();
    }
  });

  // 6. Logout
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.href = "login.html";
    });
  }

  // 7. Close results display
  document.getElementById("close-results")?.addEventListener("click", () => {
    document.getElementById("results-display").style.display = "none";
    const catSearch = document.getElementById("category-search");
    if (catSearch) catSearch.value = "";

    // Remove category param from URL
    window.history.pushState({}, "", window.location.pathname);
  });
});

async function loadUserInfo() {
  try {
    const data = await apiCall("/users/me");

    // Handle result wrapping
    const user = data.result || data;

    if (user && (user.username || user.email)) {
      const fullName =
        `${user.firstname || ""} ${user.lastname || ""}`.trim() ||
        user.username ||
        "Người dùng";
      document.getElementById("display-username").textContent = fullName;
      document.getElementById("display-email").textContent = user.email || "";

      // Set initials - use first char of firstname or username
      const text = user.firstname || user.username || "U";
      const initials = text.substring(0, 2).toUpperCase();
      document.getElementById("user-initials").textContent = initials;
    }
  } catch (error) {
    console.error("Error fetching user info:", error);
    setupGuestMode();
  }
}

function setupGuestMode() {
  const usernameEl = document.getElementById("display-username");
  const emailEl = document.getElementById("display-email");
  const initialsEl = document.getElementById("user-initials");

  if (usernameEl) usernameEl.textContent = "Khách";
  if (emailEl) emailEl.textContent = "Đăng nhập để dùng thêm";
  if (initialsEl) {
    initialsEl.textContent = "?";
    initialsEl.style.background = "#64748b";
  }

  // Replace Profile/Logout with Login in the dropdown
  const dropdown = document.getElementById("profile-dropdown");
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
  const trigger = document.getElementById("user-menu-trigger");
  const menu = document.getElementById("profile-dropdown");

  if (trigger && menu) {
    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.toggle("active");
    });

    document.addEventListener("click", () => {
      menu.classList.remove("active");
    });

    menu.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }
}

function setupCategoryCards() {
  const cards = document.querySelectorAll(".category-card");
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const cat = card.dataset.category;
      fetchCategoryData(cat);
    });
  });
}

async function fetchCategoryData(categoryKey) {
  const entity = ENTITIES[categoryKey];
  if (!entity) return;

  activeCategory = categoryKey;
  activeFilters = {};
  currentPage = 1;

  // Update URL without refreshing to support 'Back' button
  const newUrl = `${window.location.pathname}?category=${categoryKey}`;
  window.history.pushState({ category: categoryKey }, "", newUrl);

  const resultsSection = document.getElementById("results-display");
  const partsList = document.getElementById("parts-list");
  const title = document.getElementById("current-cat-title");
  const count = document.getElementById("items-count");
  const catSearch = document.getElementById("category-search");

  // UI Feedback
  title.textContent = entity.title;
  if (catSearch) catSearch.value = "";
  resultsSection.style.display = "block";
  resultsSection.scrollIntoView({ behavior: "smooth" });
  partsList.innerHTML = '<div class="loading-spinner"></div>';
  count.textContent = "Đang tải dữ liệu...";

  // Render filters lookups
  renderFilters(categoryKey);

  try {
    const data = await apiCall(entity.url);
    let items = [];

    if (Array.isArray(data)) items = data;
    else if (data.result && Array.isArray(data.result)) items = data.result;
    else if (
      data.result &&
      data.result.content &&
      Array.isArray(data.result.content)
    )
      items = data.result.content;

    currentCategoryItems = items;
    applyFilters();
  } catch (error) {
    console.error(`Error fetching ${categoryKey}:`, error);
    partsList.innerHTML = `<div class="error-msg" style="color: #dc2626; text-align:center; padding: 20px;">Lỗi tải dữ liệu. Vui lòng thử lại sau.</div>`;
    document.getElementById("category-pagination").style.display = "none";
  }
}

async function renderFilters(compId) {
  const filters = FILTERS_CONFIG[compId] || [];
  const container = document.getElementById("category-filters");
  container.innerHTML = "";

  if (filters.length === 0) {
    container.style.display = "none";
    return;
  }
  container.style.display = "flex";

  for (const f of filters) {
    const group = document.createElement("div");
    group.className = "filter-group";
    group.innerHTML = `<label>${f.label}</label><select id="filter-${f.key}"><option value="">Tất cả</option></select>`;
    container.appendChild(group);

    const select = group.querySelector("select");

    if (f.api) {
      apiCall(f.api).then((res) => {
        if (res.code === 1000) {
          const list = res.result.data || res.result || [];
          list.forEach((item) => {
            const opt = document.createElement("option");
            opt.value = item.id || item.name;
            opt.innerText = item.name || item;
            select.appendChild(opt);
          });
        }
      });
    } else if (f.key === "efficiency") {
      [
        "80 Plus",
        "80 Plus Bronze",
        "80 Plus Silver",
        "80 Plus Gold",
        "80 Plus Platinum",
        "80 Plus Titanium",
      ].forEach((val) => {
        const opt = document.createElement("option");
        opt.value = val;
        opt.innerText = val;
        select.appendChild(opt);
      });
    }

    select.addEventListener("change", (e) => {
      activeFilters[f.key] = e.target.value;
      currentPage = 1;
      applyFilters();
    });
  }
}

function applyFilters() {
  const query = document
    .getElementById("category-search")
    .value.toLowerCase()
    .trim();

  filteredItems = currentCategoryItems.filter((item) => {
    // 1. Search Query
    if (query) {
      const nameMatch = (item.name || "").toLowerCase().includes(query);
      const descMatch = (item.description || "").toLowerCase().includes(query);
      let nestedMatch = Object.values(item).some((val) => {
        if (val && typeof val === "object" && val.name) {
          return val.name.toLowerCase().includes(query);
        }
        return false;
      });

      if (!nameMatch && !descMatch && !nestedMatch) return false;
    }

    // 2. Active Filters
    for (const [key, val] of Object.entries(activeFilters)) {
      if (!val) continue;

      let itemVal = item[key];
      // Fallback: If key is 'socketId', check for 'socket' object
      if (itemVal === undefined && key.endsWith("Id")) {
        const altKey = key.slice(0, -2);
        itemVal = item[altKey];
      }

      let actualVal = itemVal;
      if (typeof itemVal === "object" && itemVal !== null) {
        actualVal = itemVal.id || itemVal.name;
      }

      if (String(actualVal) !== String(val)) return false;
    }

    return true;
  });

  renderPartsPage();

  const countEl = document.getElementById("items-count");
  if (countEl) {
    if (query || Object.values(activeFilters).some((v) => v)) {
      countEl.textContent = `${filteredItems.length} mục phù hợp`;
    } else {
      countEl.textContent = `${currentCategoryItems.length} mục được tìm thấy`;
    }
  }
}

function renderPartsPage() {
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE) || 1;
  const pagination = document.getElementById("category-pagination");

  if (totalPages > 1) {
    pagination.style.display = "flex";
    document.getElementById("page-info").textContent = `Trang ${currentPage} / ${totalPages}`;
    document.getElementById("prev-page").disabled = currentPage <= 1;
    document.getElementById("next-page").disabled = currentPage >= totalPages;
  } else {
    pagination.style.display = "none";
  }

  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filteredItems.slice(start, start + ITEMS_PER_PAGE);

  const partsList = document.getElementById("parts-list");

  if (pageItems.length === 0) {
    partsList.innerHTML =
      '<div style="grid-column: 1/-1; text-align:center; color:#6c757d; padding:40px;">Không tìm thấy linh kiện nào.</div>';
    return;
  }

  partsList.innerHTML = pageItems
    .map((item) => {
      const img =
        item.imageUrl || item.coverImageUrl || "https://via.placeholder.com/64?text=PC";
      const name = item.name || item.id || "N/A";
      const summary = getPartSummary(activeCategory, item);

      return `
            <div class="part-item" onclick="viewDetail('${activeCategory}', '${item.id}')">
                <img src="${img}" alt="${name}" class="part-thumb" onerror="this.src='https://via.placeholder.com/64?text=PC'">
                <div class="part-info">
                    <h4>${name}</h4>
                    <p class="part-specs">${summary}</p>
                </div>
            </div>
        `;
    })
    .join("");
}

function getPartSummary(category, item) {
  let specs = [];
    
    // Helper to get name from lookup object or return the ID/Value
    const getVal = (field) => {
        if (!field) return null;
        return typeof field === 'object' ? field.name : field;
    };

    switch (category) {
        case 'cpu':
            const cpuSocket = getVal(item.socket);
            if (cpuSocket) specs.push(`Socket: ${cpuSocket}`);
            if (item.tdp) specs.push(`TDP: ${item.tdp}W`);
            break;
        case 'mainboard':
            const mbSocket = getVal(item.socket);
            if (mbSocket) specs.push(`Socket: ${mbSocket}`);
            if (item.vrmPhase) specs.push(`VRM: ${item.vrmPhase} Phase`);
            break;
        case 'ram':
            const rType = getVal(item.ramType);
            if (rType) specs.push(rType);
            if (item.ramBus) specs.push(`${item.ramBus}MHz`);
            if (item.capacityPerStick) specs.push(`${item.capacityPerStick}GB`);
            break;
        case 'vga':
            if (item.vramGb) specs.push(`${item.vramGb}GB VRAM`);
            if (item.score) specs.push(`Score: ${item.score}`);
            break;
        case 'psu':
            if (item.wattage) specs.push(`${item.wattage}W`);
            if (item.efficiency) specs.push(item.efficiency);
            break;
        case 'ssd':
        case 'hdd':
            if (item.capacity) specs.push(`${item.capacity}GB`);
            const iType = getVal(item.interfaceType);
            if (iType) specs.push(iType);
            break;
        case 'case':
            const cSize = getVal(item.size);
            if (cSize) specs.push(cSize);
            break;
        case 'cooler':
            const coType = getVal(item.coolerType);
            if (coType) specs.push(coType);
            if (item.tdpSupport) specs.push(`${item.tdpSupport}W TDP`);
            break;
        default:
            return 'Linh kiện chất lượng cao';
    }
    return specs.length > 0 ? specs.join(' • ') : 'Thông số đang cập nhật';
}

function renderParts(items) {
    const partsList = document.getElementById('parts-list');
    
    if (items.length === 0) {
        partsList.innerHTML = '<div style="grid-column: 1/-1; text-align:center; color:#6c757d; padding:40px;">Không tìm thấy linh kiện nào.</div>';
        return;
    }

    partsList.innerHTML = items.map(item => {
        const img = item.imageUrl || item.coverImageUrl || 'https://via.placeholder.com/64?text=PC';
        const name = item.name || item.id || 'N/A';
        const summary = getPartSummary(activeCategory, item);
        
        return `
            <div class="part-item" onclick="viewDetail('${activeCategory}', '${item.id}')">
                <img src="${img}" alt="${name}" class="part-thumb" onerror="this.src='https://via.placeholder.com/64?text=PC'">
                <div class="part-info">
                    <h4>${name}</h4>
                    <p class="part-specs">${summary}</p>
                </div>
            </div>
        `;
    }).join('');
}

function performSearch(query) {
    if (!currentCategoryItems || currentCategoryItems.length === 0) return;

    if (!query) {
        renderParts(currentCategoryItems);
        const count = document.getElementById('items-count');
        if (count) count.textContent = `${currentCategoryItems.length} mục được tìm thấy`;
        return;
    }

    const filtered = currentCategoryItems.filter(item => {
        // 1. Search in main properties (Name, Description)
        const nameMatch = (item.name || "").toLowerCase().includes(query);
        const descMatch = (item.description || "").toLowerCase().includes(query);
        
        if (nameMatch || descMatch) return true;

        // 2. Search in Nested Objects (Socket name, RAM type name, etc.)
        // We look for any property that is an object with a 'name' field
        return Object.values(item).some(val => {
            if (val && typeof val === 'object' && val.name) {
                return val.name.toLowerCase().includes(query);
            }
            return false;
        });
    });

    renderParts(filtered);
    const count = document.getElementById('items-count');
    if (count) count.textContent = `${filtered.length} mục phù hợp với "${query}"`;
}

function viewDetail(category, id) {
    window.location.href = `item-details.html?type=${category}&id=${id}`;
}

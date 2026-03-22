/**
 * BUILD PC LOGIC - BuildPC Checker
 */

const API_BASE_URL = "http://localhost:8080/identity";

// Global State
const buildState = {
  cpuId: null,
  mainboardId: null,
  ramId: null,
  vgaId: null,
  ssdIds: [],
  hddIds: [],
  psuId: null,
  caseId: null,
  coolerId: null,
  selectedGameIds: [],
  selectedGames: [],
};

// Component Definitions (Adapted with FontAwesome)
const componentsConfig = [
  {
    id: "cpu",
    name: "Bộ xử lý (CPU)",
    api: "/cpus",
    multi: false,
    icon: "fas fa-microchip",
  },
  {
    id: "mainboard",
    name: "Bo mạch chủ (Mainboard)",
    api: "/mainboards",
    multi: false,
    icon: "fas fa-square",
  },
  {
    id: "ram",
    name: "Bộ nhớ RAM",
    api: "/rams",
    multi: false,
    icon: "fas fa-memory",
  },
  {
    id: "vga",
    name: "Card đồ họa (VGA)",
    api: "/vgas",
    multi: false,
    icon: "fas fa-video",
  },
  {
    id: "ssd",
    name: "Ổ cứng SSD",
    api: "/ssds",
    multi: true,
    max: 2,
    icon: "fas fa-hdd",
  },
  {
    id: "hdd",
    name: "Ổ cứng HDD",
    api: "/hdds",
    multi: true,
    max: 2,
    icon: "fas fa-compact-disc",
  },
  {
    id: "psu",
    name: "Nguồn máy tính (PSU)",
    api: "/psus",
    multi: false,
    icon: "fas fa-plug",
  },
  {
    id: "cooler",
    name: "Tản nhiệt (Cooler)",
    api: "/coolers",
    multi: false,
    icon: "fas fa-fan",
  },
  {
    id: "case",
    name: "Vỏ máy tính (Case)",
    api: "/cases",
    multi: false,
    icon: "fas fa-box",
  },
];

/**
 * LABEL & UNIT MAPPING (Synced with item-details.js)
 */
const LABEL_MAP = {
  socket: "Socket",
  tdp: "Công suất (TDP)",
  tdpSupport: "Hỗ trợ TDP",
  pcieVersion: "Phiên bản PCIe",
  pcieVersionId: "Phiên bản PCIe",
  vrmMin: "VRM Tối thiểu",
  igpu: "Có iGPU",
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
  ramBus: "Tốc độ RAM",
  ramCas: "Độ trễ (CAS)",
  capacityPerStick: "Dung lượng/cây",
  vramGb: "VRAM (GB)",
  lengthMm: "Độ dài (mm)",
  powerConnector: "Nguồn phụ",
  capacity: "Dung lượng",
  formFactor: "Kích thước (FF)",
  interfaceType: "Chuẩn giao tiếp",
  ssdType: "Loại SSD",
  wattage: "Công suất (W)",
  efficiency: "Hiệu suất",
  sataConnector: "Cổng SATA",
  size: "Kích cỡ Case",
  radiatorSize: "Cỡ Radiator",
  heightMm: "Chiều cao (mm)",
  coolerType: "Loại Tản",
  coreCount: "Số nhân",
  threadCount: "Số luồng",
  baseClockInfo: "Xung cơ bản",
  boostClockInfo: "Xung Boost",
  hasIntegratedGraphics: "Đồ họa tích hợp",
  vram: "VRAM (GB)",
  length: "Chiều dài (mm)",
  recommendedPsuWattage: "Nguồn khuyến nghị",
  efficiencyRating: "Chuẩn hiệu suất",
  modularType: "Chuẩn cáp PSU",
  type: "Loại linh kiện",
  readSpeed: "Tốc độ Đọc",
  writeSpeed: "Tốc độ Ghi",
  rpm: "Vòng quay (RPM)",
  cache: "Bộ nhớ đệm (Cache)",
  coolerHeight: "Chiều cao tản",
  maxGpuLength: "Chiều dài VGA tối đa",
  maxCpuCoolerHeight: "Tản CPU cao tối đa",
};

const UNIT_MAP = {
  tdp: "W",
  tdpSupport: "W",
  cpuTdpSupport: "W",
  wattage: "W",
  recommendedPsuWattage: "W",
  ramBus: "MHz",
  ramBusMax: "MHz",
  ramMaxCapacity: "GB",
  capacityPerStick: "GB",
  vramGb: "GB",
  vram: "GB",
  capacity: "GB",
  lengthMm: "mm",
  heightMm: "mm",
  length: "mm",
  radiatorSize: "mm",
  readSpeed: "MB/s",
  writeSpeed: "MB/s",
  rpm: "RPM",
  cache: "MB",
  maxGpuLength: "mm",
  maxCpuCoolerHeight: "mm",
};

function formatLabel(key) {
  if (LABEL_MAP[key]) return LABEL_MAP[key];
  const cleanerKey = key.endsWith("Id") ? key.slice(0, -2) : key;
  if (LABEL_MAP[cleanerKey]) return LABEL_MAP[cleanerKey];
  const result = cleanerKey.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
}

/**
 * INITIALIZATION
 */
document.addEventListener("DOMContentLoaded", async () => {
  // 1. Initial UI setup
  initBuildSlots();
  setupCoreEvents();
  setupGameEvents();

  // 2. Load User Profile
  await loadUserInfo();

  // 3. Compatibility Initial State
  resetSummaryView();
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
    userBrief.innerHTML = `
            <div class="user-avatar" style="background:#475569"><i class="fas fa-user-secret"></i></div>
            <div class="user-info">
                <span class="name">Khách</span>
                <span class="role"><a href="login.html" style="color:var(--primary-light); text-decoration:none;">Đăng nhập</a></span>
            </div>
        `;
    logoutBtn.style.display = "none";
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    const user = data.result || data;

    if (user) {
      const initials = (user.firstname || user.username || "U")
        .substring(0, 1)
        .toUpperCase();
      userBrief.innerHTML = `
                <div class="user-avatar">${initials}</div>
                <div class="user-info">
                    <span class="name">${user.username}</span>
                    <span class="role">Thành viên</span>
                </div>
            `;

      // Check roles for admin nav
      const roles = (user.roles || []).map((r) => r.name || r);
      if (roles.includes("ADMIN")) {
        adminNav.style.display = "block";
      }
    }
  } catch (e) {
    console.error("Auth check failed", e);
  }

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  });
}

/**
 * BUILD UI LOGIC
 */
function initBuildSlots() {
  const list = document.getElementById("build-components-list");
  list.innerHTML = "";
  componentsConfig.forEach((comp) => {
    const slot = document.createElement("div");
    slot.className = "component-slot";
    slot.id = `slot-${comp.id}`;
    renderSlotContent(slot, comp, null);
    list.appendChild(slot);
  });
}

function renderSlotContent(el, comp, partData) {
  const isFilled = partData !== null;
  if (isFilled) {
    el.classList.add("filled");
    const img = partData.imageUrl || "https://via.placeholder.com/80?text=Part";
    el.innerHTML = `
            <div class="part-icon-wrap">
                <img src="${img}" alt="${partData.name}">
            </div>
            <div class="part-info">
                <div class="part-category">${comp.name}</div>
                <div class="part-name" title="${partData.name}">${partData.name}</div>
            </div>
            <div class="part-actions">
                <button class="btn-secondary btn-action" onclick="openPicker('${comp.id}')">Đổi</button>
                <button class="btn-remove-part" onclick="removePart('${comp.id}')" title="Gỡ bỏ">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
  } else {
    el.classList.remove("filled");
    el.innerHTML = `
            <div class="part-icon-wrap">
                <i class="${comp.icon}" style="color:var(--secondary)"></i>
            </div>
            <div class="part-info">
                <div class="part-category">${comp.name}</div>
                <div class="part-empty-text">Chưa chọn linh kiện</div>
            </div>
            <div class="part-actions">
                <button class="btn-primary btn-select-part" onclick="openPicker('${comp.id}')">
                    <i class="fas fa-plus"></i> Chọn
                </button>
            </div>
        `;
  }
  updatePartsCount();
}

function updatePartsCount() {
  let count = 0;
  if (buildState.cpuId) count++;
  if (buildState.mainboardId) count++;
  if (buildState.ramId) count++;
  if (buildState.vgaId) count++;
  if (buildState.psuId) count++;
  if (buildState.caseId) count++;
  if (buildState.coolerId) count++;
  count += buildState.ssdIds.length;
  count += buildState.hddIds.length;

  document.getElementById("parts-count").innerText =
    `${count}/${componentsConfig.length} linh kiện`;

  // Save button state
  const saveBtn = document.getElementById("save-build-btn");
  saveBtn.disabled = count === 0;
}

/**
 * CORE API WRAPPER
 */
let isRefreshing = false;
let refreshPromise = null;

async function refreshToken() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token to refresh");

  try {
    console.log("Attempting to refresh token...");
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = await response.json();
    if (data.code === 1000 && data.result.token) {
      console.log("Token refreshed successfully.");
      localStorage.setItem("token", data.result.token);
      return data.result.token;
    } else {
      throw new Error("Refresh failed");
    }
  } catch (error) {
    console.error("Refresh failed, logging out...", error);
    localStorage.removeItem("token");
    // window.location.href = 'login.html'; // Optional: allow guest mode in build-pc
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

    // Handle expired token (Code 1007 based on profile.js logic)
    if (data.code === 1007 && retryCount === 0) {
      console.warn("Token expired, attempting refresh...");
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
      } catch (refreshErr) {
        console.error("Auto-refresh failed:", refreshErr);
        return data; // Return original unauthorized error
      }
    }

    return data;
  } catch (e) {
    console.error("API Fetch Error:", e);
    return { code: 9999, message: "Lỗi kết nối máy chủ" };
  }
}

/**
 * PICKER LOGIC (MODAL)
 */
let currentPickerComp = null;
let pickerItems = [];
let filteredItems = [];
let pickerPage = 1;
const ITEMS_PER_PAGE = 8;

function setupCoreEvents() {
  document
    .getElementById("close-picker-btn")
    .addEventListener("click", closePicker);
  document
    .getElementById("close-save-build-btn")
    .addEventListener("click", closeSaveModal);
  document
    .getElementById("reset-build-btn")
    .addEventListener("click", resetBuild);
  document
    .getElementById("check-bottleneck-btn")
    .addEventListener("click", analyzeBottleneck);
  document
    .getElementById("save-build-btn")
    .addEventListener("click", openSaveModal);
  document
    .getElementById("confirm-save-build-btn")
    .addEventListener("click", handleSaveBuild);
  document
    .getElementById("close-compat-error-btn")
    .addEventListener("click", () =>
      document.getElementById("compat-error-modal").classList.remove("active"),
    );
  document
    .getElementById("confirm-compat-error-btn")
    .addEventListener("click", () =>
      document.getElementById("compat-error-modal").classList.remove("active"),
    );

  // Search
  document.getElementById("picker-search").addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    filteredItems = pickerItems.filter((item) =>
      item.name.toLowerCase().includes(query),
    );
    pickerPage = 1;
    renderPickerPage();
  });

  // Pagination
  document.getElementById("page-prev-btn").addEventListener("click", () => {
    if (pickerPage > 1) {
      pickerPage--;
      renderPickerPage();
    }
  });
  document.getElementById("page-next-btn").addEventListener("click", () => {
    if (pickerPage < Math.ceil(filteredItems.length / ITEMS_PER_PAGE)) {
      pickerPage++;
      renderPickerPage();
    }
  });

  // Details back
  document.getElementById("detail-back-btn").addEventListener("click", () => {
    document.getElementById("picker-list-view").style.display = "block";
    document.getElementById("picker-detail-view").style.display = "none";
    document.getElementById("picker-title").innerText =
      `Chọn ${currentPickerComp.name}`;
  });

  // Modal overlays (closing)
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.classList.remove("active");
    });
  });
}

function resetBuild() {
  if (!confirm("Bạn có chắc chắn muốn làm mới toàn bộ cấu hình không?")) return;
  buildState.cpuId = null;
  buildState.mainboardId = null;
  buildState.ramId = null;
  buildState.vgaId = null;
  buildState.ssdIds = [];
  buildState.hddIds = [];
  buildState.psuId = null;
  buildState.caseId = null;
  buildState.coolerId = null;
  initBuildSlots();
  resetSummaryView();
  triggerToast("Đã làm mới", "success");
}

async function openPicker(compId) {
  const comp = componentsConfig.find((c) => c.id === compId);
  currentPickerComp = comp;
  pickerPage = 1;
  document.getElementById("picker-title").innerText = `Chọn ${comp.name}`;
  document.getElementById("picker-search").value = "";
  document.getElementById("picker-items").innerHTML =
    '<div class="w-100 text-center py-5"><i class="fas fa-circle-notch fa-spin fa-2x"></i></div>';
  document.getElementById("picker-modal").classList.add("active");
  document.getElementById("picker-list-view").style.display = "block";
  document.getElementById("picker-detail-view").style.display = "none";

  const res = await apiCall(comp.api);
  if (res.code === 1000) {
    pickerItems = res.result.data || res.result || [];
    filteredItems = pickerItems;
    renderPickerPage();
  } else {
    triggerToast("Không thể tải danh sách", "error");
  }
}

function renderPickerPage() {
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE) || 1;
  document.getElementById("page-info").innerText =
    `Trang ${pickerPage} / ${totalPages}`;
  document.getElementById("page-prev-btn").disabled = pickerPage <= 1;
  document.getElementById("page-next-btn").disabled = pickerPage >= totalPages;

  const start = (pickerPage - 1) * ITEMS_PER_PAGE;
  const items = filteredItems.slice(start, start + ITEMS_PER_PAGE);

  const container = document.getElementById("picker-items");
  container.innerHTML = "";

  if (items.length === 0) {
    container.innerHTML =
      '<div class="w-100 text-center py-5 text-muted">Không tìm thấy linh kiện nào</div>';
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "part-card";
    card.innerHTML = `
            <img src="${item.imageUrl || "https://via.placeholder.com/150"}" class="part-card-img">
            <div class="part-card-title">${item.name}</div>
            <div class="part-card-specs">${item.socket?.name || item.ramType?.name || item.formFactor || ""}</div>
            <div class="card-footer-actions">
                <button class="btn-primary flex-1 btn-card-select">Chọn</button>
                <button class="btn-secondary flex-1 btn-card-detail">Chi tiết</button>
            </div>
        `;

    card.querySelector(".btn-card-select").onclick = (e) => {
      e.stopPropagation();
      selectPart(item);
    };

    card.querySelector(".btn-card-detail").onclick = (e) => {
      e.stopPropagation();
      showDetail(item);
    };

    card.onclick = () => showDetail(item);
    container.appendChild(card);
  });
}

function showDetail(item) {
  document.getElementById("picker-title").innerText = "Chi tiết linh kiện";
  document.getElementById("picker-list-view").style.display = "none";
  const detailView = document.getElementById("picker-detail-view");
  detailView.style.display = "block";

  const content = document.getElementById("detail-content");

  // Construct Specs Grid dynamically (Synced with item-details.js)
  let specsHtml = "";
  const excludedFields = [
    "score",
    "id",
    "imageUrl",
    "coverImageUrl",
    "name",
    "description",
    "enabled",
    "deleted",
    "code",
    "result",
    "message",
  ];

  Object.entries(item).forEach(([key, value]) => {
    if (excludedFields.includes(key) || value === null || value === undefined)
      return;

    let displayValue = value;
    if (typeof value === "object") {
      displayValue = value.name || value.title || JSON.stringify(value);
    } else if (typeof value === "boolean") {
      displayValue = value ? "Có" : "Không";
    }

    // Apply Units
    if (
      UNIT_MAP[key] &&
      (typeof displayValue === "number" ||
        (!isNaN(displayValue) && displayValue !== ""))
    ) {
      displayValue = `${displayValue} ${UNIT_MAP[key]}`;
    }

    specsHtml += `
            <div class="spec-item-box">
                <span class="spec-label">${formatLabel(key)}</span>
                <span class="spec-value">${displayValue}</span>
            </div>
        `;
  });

  content.innerHTML = `
        <div class="item-details-layout">
            <!-- Col 1: Visual -->
            <div class="item-visual-col">
                 <div class="item-image-wrapper">
                      <img src="${item.imageUrl || "https://via.placeholder.com/300"}" alt="${item.name}">
                 </div>
            </div>

            <!-- Col 2: Info & Description -->
            <div class="item-info-col">
                <div class="item-header-meta">
                    <span class="item-badge-cat">${currentPickerComp.name}</span>
                    <h2 class="item-name-heading">${item.name}</h2>
                    <div class="item-desc-section">
                        <h4 class="mini-title">Mô tả sản phẩm</h4>
                        <div class="item-desc-text">${item.description || "Sản phẩm chưa có mô tả chi tiết từ nhà sản xuất."}</div>
                    </div>
                </div>
            </div>

            <!-- Col 3: Technical Specs -->
            <div class="item-specs-col">
                <h4 class="specs-heading">Thông số kỹ thuật</h4>
                <div class="item-specs-grid">
                    ${specsHtml || '<p class="text-muted">Không có thông số kỹ thuật chi tiết.</p>'}
                </div>
            </div>
        </div>
    `;

  document.getElementById("detail-select-btn").onclick = () => selectPart(item);
}

function selectPart(item) {
  const comp = currentPickerComp;
  if (comp.multi) {
    // Multi slot logic (simplfied for now)
    buildState[`${comp.id}Ids`] = [item.id];
  } else {
    buildState[`${comp.id}Id`] = item.id;
  }

  renderSlotContent(document.getElementById(`slot-${comp.id}`), comp, item);
  closePicker();
  checkCompatibility();
}

function removePart(compId) {
  const comp = componentsConfig.find((c) => c.id === compId);
  if (comp.multi) buildState[`${comp.id}Ids`] = [];
  else buildState[`${comp.id}Id`] = null;

  renderSlotContent(document.getElementById(`slot-${comp.id}`), comp, null);
  checkCompatibility();
}

function closePicker() {
  document.getElementById("picker-modal").classList.remove("active");
}

/**
 * COMPATIBILITY & ANALYTICS
 */
async function checkCompatibility() {
  const payload = {};
  if (buildState.cpuId) payload.cpuId = buildState.cpuId;
  if (buildState.mainboardId) payload.mainboardId = buildState.mainboardId;
  if (buildState.ramId) payload.ramId = buildState.ramId;
  if (buildState.vgaId) payload.vgaId = buildState.vgaId;
  if (buildState.psuId) payload.psuId = buildState.psuId;
  if (buildState.caseId) payload.caseId = buildState.caseId;
  if (buildState.coolerId) payload.coolerId = buildState.coolerId;
  if (buildState.ssdIds.length > 0) payload.ssdIds = buildState.ssdIds;
  if (buildState.hddIds.length > 0) payload.hddIds = buildState.hddIds;

  if (Object.keys(payload).length === 0) {
    resetSummaryView();
    return;
  }

  const res = await apiCall("/builds/check-compatibility", "POST", payload);
  if (res.code === 1000 && res.result) {
    updateSummaryView(res.result);
  }
}

function resetSummaryView() {
  const stat = document.getElementById("compat-status");
  stat.className = "analysis-card status-card neutral";
  document.getElementById("compat-status-title").innerText = "Bắt đầu lựa chọn";
  document.getElementById("compat-status-desc").innerText =
    "Hãy chọn linh kiện để bắt đầu kiểm tra tương thích.";
  document.getElementById("psu-recommend-value").innerText = "0W";
  document.getElementById("error-group").style.display = "none";
  document.getElementById("warning-group").style.display = "none";
  hideBottleneckResults();
}

function updateSummaryView(result) {
  const stat = document.getElementById("compat-status");
  const title = document.getElementById("compat-status-title");
  const desc = document.getElementById("compat-status-desc");
  const icon = stat.querySelector(".status-icon i");

  if (result.errors?.length > 0) {
    stat.className = "analysis-card status-card error";
    title.innerText = "Không tương thích";
    desc.innerText = "Vui lòng xem các lỗi nghiêm trọng bên dưới";
    icon.className = "fas fa-times-circle";
  } else if (result.warnings?.length > 0) {
    stat.className = "analysis-card status-card warning";
    title.innerText = "Tương thích (Cảnh báo)";
    desc.innerText = "Các linh kiện khớp nhau nhưng có lưu ý tối ưu";
    icon.className = "fas fa-exclamation-triangle";
  } else {
    stat.className = "analysis-card status-card success";
    title.innerText = "Tương thích hoàn hảo";
    desc.innerText = "Cấu hình này ổn định và sẵn sàng hoạt động!";
    icon.className = "fas fa-check-circle";
  }

  document.getElementById("psu-recommend-value").innerText =
    `${result.recommendedPsuWattage || 0}W`;

  // Errors
  const eGroup = document.getElementById("error-group");
  const eList = document.getElementById("error-list");
  if (result.errors?.length > 0) {
    eList.innerHTML = result.errors.map((m) => `<li>${m}</li>`).join("");
    eGroup.style.display = "block";
  } else {
    eGroup.style.display = "none";
  }

  // Warnings
  const wGroup = document.getElementById("warning-group");
  const wList = document.getElementById("warning-list");
  if (result.warnings?.length > 0) {
    wList.innerHTML = result.warnings.map((m) => `<li>${m}</li>`).join("");
    wGroup.style.display = "block";
  } else {
    wGroup.style.display = "none";
  }
}

async function analyzeBottleneck() {
  if (!buildState.cpuId || !buildState.vgaId) {
    triggerToast("Thiếu linh kiện trọng yếu (CPU/VGA)", "error");
    return;
  }

  const btn = document.getElementById("check-bottleneck-btn");
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ...';
  btn.disabled = true;

  const res = await apiCall("/builds/analyze", "POST", {
    cpuId: buildState.cpuId,
    vgaId: buildState.vgaId,
    gpuId: buildState.vgaId,
  });

  btn.innerHTML = '<i class="fas fa-search"></i> Phân tích';
  btn.disabled = false;

  if (res.code === 1000 && res.result) {
    document.getElementById("bottleneck-empty").style.display = "none";
    document.getElementById("bottleneck-results-content").style.display =
      "block";

    const data = res.result.results;
    const colorMap = {
      NONE: "#10b981",
      LOW: "#63b3ed",
      MEDIUM: "#f6ad55",
      HIGH: "#f56565",
    };

    const resDisplay = (key, id) => {
      const el = document.getElementById(id);
      const val = data[key] || { severity: "NONE" };
      el.innerText = val.severity === "NONE" ? "Tốt" : val.severity;
      el.style.color = colorMap[val.severity] || "inherit";
    };

    resDisplay("1080p", "bottleneck-1080p");
    resDisplay("2k", "bottleneck-2k");
    resDisplay("4k", "bottleneck-4k");

    document.getElementById("bottleneck-message").innerHTML = `
            <p><strong>Cân bằng:</strong> ${data["1080p"].message}</p>
        `;
  }
}

function hideBottleneckResults() {
  document.getElementById("bottleneck-empty").style.display = "block";
  document.getElementById("bottleneck-results-content").style.display = "none";
}

/**
 * GAME FEATURES
 */
let allGames = [];
let tempSelectedGameIds = [];
let gamePage = 1;
const G_PER_PAGE = 12;

function setupGameEvents() {
  document
    .getElementById("view-game-list-btn")
    .addEventListener("click", openGamePicker);
  document
    .getElementById("close-game-picker-btn")
    .addEventListener("click", () =>
      document.getElementById("game-picker-modal").classList.remove("active"),
    );
  document
    .getElementById("confirm-game-selection-btn")
    .addEventListener("click", confirmGameSelection);

  document.getElementById("game-page-prev").addEventListener("click", () => {
    if (gamePage > 1) {
      gamePage--;
      renderGamePage();
    }
  });
  document.getElementById("game-page-next").addEventListener("click", () => {
    if (gamePage < Math.ceil(allGames.length / G_PER_PAGE)) {
      gamePage++;
      renderGamePage();
    }
  });

  // Check buttons
  document
    .getElementById("check-multi-compat-btn")
    .addEventListener("click", () => {
      console.log("Compat Clicked");
      checkMultiCompatibility();
    });
  document
    .getElementById("check-multi-fps-btn")
    .addEventListener("click", () => {
      console.log("FPS Clicked");
      estimateMultiFPS();
    });

  document
    .getElementById("game-picker-search")
    .addEventListener("input", (e) => {
      gamePage = 1;
      renderGamePage(e.target.value);
    });

  // Initial render
  renderSelectedGamesList();
}

async function openGamePicker() {
  document.getElementById("game-picker-modal").classList.add("active");
  tempSelectedGameIds = [...buildState.selectedGameIds];
  updateGameSelCount();

  if (allGames.length === 0) {
    document.getElementById("game-picker-items").innerHTML =
      '<div class="w-100 text-center py-5"><i class="fas fa-spinner fa-spin fa-2x"></i></div>';
    const res = await apiCall("/games?size=200");
    allGames = res.result?.content || res.result?.data || res.result || [];
    renderGamePage();
  } else {
    renderGamePage();
  }
}

function renderGamePage(query = "") {
  const list = document.getElementById("game-picker-items");
  list.innerHTML = "";
  const filtered = allGames.filter((g) =>
    g.name.toLowerCase().includes(query.toLowerCase()),
  );
  const totalPages = Math.ceil(filtered.length / G_PER_PAGE) || 1;
  document.getElementById("game-page-info").innerText =
    `Trang ${gamePage} / ${totalPages}`;

  const start = (gamePage - 1) * G_PER_PAGE;
  const items = filtered.slice(start, start + G_PER_PAGE);

  items.forEach((game) => {
    const isSelected = tempSelectedGameIds.includes(game.id);
    const card = document.createElement("div");
    card.className = "game-card-mini";
    card.innerHTML = `
            <div class="game-checkbox-overlay ${isSelected ? "active" : ""}">
                <i class="fas fa-check"></i>
            </div>
            <img src="${game.coverImageUrl || "https://via.placeholder.com/150x200"}" alt="${game.name}">
            <div class="game-name-label">${game.name}</div>
        `;
    card.onclick = () => toggleGameTempSelection(game.id);
    list.appendChild(card);
  });
}

function toggleGameTempSelection(gameId) {
  const idx = tempSelectedGameIds.indexOf(gameId);
  if (idx > -1) tempSelectedGameIds.splice(idx, 1);
  else tempSelectedGameIds.push(gameId);

  renderGamePage();
  updateGameSelCount();
}

function updateGameSelCount() {
  document.getElementById("game-sel-count").innerText =
    `Đã chọn ${tempSelectedGameIds.length} game`;
}

function confirmGameSelection() {
  buildState.selectedGameIds = [...tempSelectedGameIds];
  buildState.selectedGames = allGames.filter((g) =>
    buildState.selectedGameIds.includes(g.id),
  );

  document.getElementById("game-picker-modal").classList.remove("active");
  renderSelectedGamesList();
}

function renderSelectedGamesList() {
  const container = document.getElementById("selected-games-list");
  const actions = document.getElementById("game-actions");
  const resWrap = document.getElementById("resolution-selector-wrap");
  const btnText = document.getElementById("view-game-list-btn");

  btnText.innerHTML = `<i class="fas fa-plus"></i> Chọn Games (${buildState.selectedGames.length})`;

  if (buildState.selectedGames.length === 0) {
    container.innerHTML =
      '<div class="empty-games-placeholder">Chưa có game nào được chọn</div>';
    actions.style.display = "none";
    resWrap.style.display = "none";
    return;
  }

  actions.style.display = "flex";
  resWrap.style.display = "block";

  container.innerHTML = buildState.selectedGames
    .map(
      (game) => `
        <div class="selected-game-item" id="sel-game-${game.id}">
            <img src="${game.coverImageUrl || "https://via.placeholder.com/32"}" alt="">
            <div class="game-name">${game.name}</div>
            <div class="game-status-badge" id="status-badge-${game.id}"></div>
            <button class="remove-game" onclick="removeSelectedGame('${game.id}')"><i class="fas fa-times"></i></button>
        </div>
    `,
    )
    .join("");
}

function removeSelectedGame(id) {
  buildState.selectedGameIds = buildState.selectedGameIds.filter(
    (gid) => gid !== id,
  );
  buildState.selectedGames = buildState.selectedGames.filter(
    (g) => g.id !== id,
  );
  renderSelectedGamesList();
}

// Multi-Compatibility Check
async function checkMultiCompatibility() {
  if (!buildState.cpuId || !buildState.vgaId || !buildState.ramId) {
    triggerToast("Thiếu linh kiện cốt lõi (CPU/VGA/RAM) để thực hiện", "error");
    return;
  }

  triggerToast("Đang kiểm tra độ tương thích...", "info");

  for (const game of buildState.selectedGames) {
    const badge = document.getElementById(`status-badge-${game.id}`);
    badge.innerText = "⌛";
    badge.style.background = "#e2e8f0";
    const payload = {
      cpuId: buildState.cpuId,
      vgaId: buildState.vgaId,
      ramId: buildState.ramId,
    };
    console.log(`Checking compatibility for game ${game.id}:`, payload);

    const res = await apiCall(
      `/games/${game.id}/check-compatibility`,
      "POST",
      payload,
    );
    console.log("Check Compatible Response:", res);

    if (res.code === 1000 && res.result) {
      // Support both direct child and .data child just in case
      const compatibility =
        res.result.compatibility || res.result.data?.compatibility;
      const isRec = compatibility === "RECOMMENDED";
      badge.innerText = isRec ? "REC" : "MIN";
      badge.style.background = isRec ? "var(--success)" : "var(--accent)";
      badge.style.color = "white";
    } else {
      console.error("Compatibility Check Failed", res);
      badge.innerText = "Error";
      badge.style.background = "var(--danger)";
    }
  }
}

// Multi-FPS Estimation
async function estimateMultiFPS() {
  console.log("estimateMultiFPS called");
  if (!buildState.cpuId || !buildState.vgaId) {
    triggerToast("Thiếu CPU hoặc VGA để dự toán FPS", "error");
    return;
  }

  const resInput = document.querySelector('input[name="res-choice"]:checked');
  if (!resInput) {
    triggerToast("Vui lòng chọn độ phân giải", "warning");
    return;
  }
  const resolution = resInput.value;
  triggerToast(`Đang dự toán FPS (${resolution})...`, "info");

  for (const game of buildState.selectedGames) {
    const badge = document.getElementById(`status-badge-${game.id}`);
    badge.innerText = "FPS...";
    badge.style.background = "#e2e8f0";

    console.log(`Estimating FPS for game ${game.id} at ${resolution}`);
    const res = await apiCall(`/games/${game.id}/estimate-fps`, "POST", {
      cpuId: buildState.cpuId,
      vgaId: buildState.vgaId,
      resolution: resolution,
    });
    console.log("Estimate FPS Response:", res);

    if (res.code === 1000 && res.result) {
      const fpsData = res.result.fpsEstimates;
      badge.innerHTML = `
                <div class="fps-multi-wrap">
                    <div class="fps-tag low" title="${fpsData.low.message}">
                        <span class="label">Low</span>
                        <span class="value">${fpsData.low.estimatedFps}</span>
                    </div>
                    <div class="fps-tag med" title="${fpsData.medium.message}">
                        <span class="label">Med</span>
                        <span class="value">${fpsData.medium.estimatedFps}</span>
                    </div>
                    <div class="fps-tag high" title="${fpsData.high.message}">
                        <span class="label">High</span>
                        <span class="value">${fpsData.high.estimatedFps}</span>
                    </div>
                </div>
            `;
      badge.style.background = "transparent";
      badge.style.padding = "0";
      badge.style.minWidth = "auto";
    } else {
      badge.innerText = "Lỗi";
      badge.style.background = "var(--danger)";
    }
  }
}

async function checkAllGames() {
  if (!buildState.cpuId || !buildState.vgaId) {
    triggerToast("Thiếu CPU/VGA", "error");
    return;
  }
  const modal = document.getElementById("game-compat-list-modal");
  modal.classList.add("active");
  const list = document.getElementById("game-compat-results");
  list.innerHTML =
    '<div class="text-center py-5"><i class="fas fa-spinner fa-spin fa-2x"></i><p>Đang kiểm tra tất cả game...</p></div>';

  const res = await apiCall("/games/check-compatible", "POST", {
    cpuId: buildState.cpuId,
    vgaId: buildState.vgaId,
    ramId: buildState.ramId,
  });

  if (res.code === 1000) {
    document.getElementById("pc-spec-summary").innerHTML = `
            <div><strong>CPU Score:</strong> ${res.result.pcSummary.cpuScore}</div>
            <div><strong>GPU Score:</strong> ${res.result.pcSummary.gpuScore}</div>
            <div><strong>Total RAM:</strong> ${res.result.pcSummary.totalRamGb}GB</div>
        `;
    list.innerHTML = res.result.results
      .map(
        (g) => `
            <div class="game-res-row" style="display:flex; align-items:center; gap:16px; padding:12px; border-bottom:1px solid var(--border);">
                <img src="${g.coverImageUrl}" style="width:40px; height:40px; border-radius:4px; object-fit:cover;">
                <div style="flex:1">
                    <div style="font-weight:600; font-size:13px;">${g.gameName}</div>
                    <div style="font-size:11px; color:var(--text-muted);">${g.detail}</div>
                </div>
                <span class="badge" style="background:${g.status === "RECOMMENDED" ? "#dcfce7" : "#fef3c7"}; color:${g.status === "RECOMMENDED" ? "#166534" : "#92400e"}">${g.status}</span>
            </div>
        `,
      )
      .join("");
  }
}

function openFpsModal() {
  document.getElementById("fps-modal").classList.add("active");
  document.querySelector('.res-tab[data-res="1080p"]').click();
}

async function calculateFps(res) {
  const loading = document.getElementById("fps-loading");
  const container = document.getElementById("fps-result-container");
  loading.style.display = "block";
  container.style.display = "none";

  const response = await apiCall(
    `/games/${buildState.selectedGame.id}/estimate-fps`,
    "POST",
    {
      cpuId: buildState.cpuId,
      vgaId: buildState.vgaId,
      resolution: res,
    },
  );

  loading.style.display = "none";
  if (response.code === 1000) {
    container.style.display = "block";
    const data = response.result.fpsEstimates;
    document.getElementById("fps-estimates").innerHTML = `
            <div class="fps-cell" style="text-align:center; padding:16px; background:#f8fafc; border-radius:12px;">
                <div style="font-size:11px; font-weight:700; color:var(--text-muted);">LOW</div>
                <div style="font-size:24px; font-weight:800; color:var(--success);">${data.low.estimatedFps}</div>
                <div style="font-size:10px;">${data.low.verdict}</div>
            </div>
            <div class="fps-cell" style="text-align:center; padding:16px; background:#f8fafc; border-radius:12px;">
                <div style="font-size:11px; font-weight:700; color:var(--text-muted);">MEDIUM</div>
                <div style="font-size:24px; font-weight:800; color:var(--primary);">${data.medium.estimatedFps}</div>
                <div style="font-size:10px;">${data.medium.verdict}</div>
            </div>
            <div class="fps-cell" style="text-align:center; padding:16px; background:#f8fafc; border-radius:12px;">
                <div style="font-size:11px; font-weight:700; color:var(--text-muted);">HIGH</div>
                <div style="font-size:24px; font-weight:800; color:var(--accent);">${data.high.estimatedFps}</div>
                <div style="font-size:10px;">${data.high.verdict}</div>
            </div>
        `;
    document.getElementById("fps-advice").innerText =
      response.result.upgradeAdvice;
  }
}

/**
 * SAVE FEATURE
 */
function openSaveModal() {
  const token = localStorage.getItem("token");
  if (!token) {
    triggerToast("Vui lòng đăng nhập để lưu", "error");
    setTimeout(() => (window.location.href = "login.html"), 1500);
    return;
  }
  document.getElementById("save-build-modal").classList.add("active");
}

function closeSaveModal() {
  document.getElementById("save-build-modal").classList.remove("active");
}

async function handleSaveBuild() {
  const name = document.getElementById("build-name").value.trim();
  if (!name) {
    document.getElementById("build-name-error").style.display = "block";
    return;
  }

  const btn = document.getElementById("confirm-save-build-btn");
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';

  const parts = {};
  if (buildState.cpuId) parts.cpu = buildState.cpuId;
  if (buildState.mainboardId) parts.mainboard = buildState.mainboardId;
  if (buildState.ramId) parts.ram = buildState.ramId;
  if (buildState.vgaId) parts.gpu = buildState.vgaId;
  if (buildState.psuId) parts.psu = buildState.psuId;
  if (buildState.caseId) parts.case = buildState.caseId;
  if (buildState.coolerId) parts.cooler = buildState.coolerId;
  if (buildState.ssdIds.length > 0) parts.ssd = buildState.ssdIds[0];
  if (buildState.hddIds.length > 0) parts.hdd = buildState.hddIds[0];

  const res = await apiCall("/builds", "POST", {
    name,
    description: document.getElementById("build-description").value,
    parts,
  });

  if (res.code === 1000) {
    triggerToast("Lưu cấu hình thành công!", "success");
    closeSaveModal();
  } else if (res.code === 5005) {
    const errors = res.result?.errors || ["Cấu hình không tương thích"];
    showCompatErrorModal(errors);
  } else {
    triggerToast(res.message || "Lỗi khi lưu", "error");
  }

  btn.disabled = false;
  btn.innerHTML = "Lưu ngay";
}

function showCompatErrorModal(errors) {
  const list = document.getElementById("compat-error-list");
  list.innerHTML = errors.map((e) => `<li>${e}</li>`).join("");
  document.getElementById("compat-error-modal").classList.add("active");
}

// Use the global showToast from toast.js or fallback to alert
function triggerToast(msg, type = "success") {
  if (
    typeof window.showToast === "function" &&
    window.showToast !== triggerToast
  ) {
    window.showToast(msg, type);
  } else {
    alert(msg);
  }
}
// Replace internal showToast usage with triggerToast or just use the global showToast directly.
// However, since we already have many showToast calls, we can just rename the local one.
// Let's just remove the local definition and let it use the one from toast.js.

// Attach globals for inline onclicks
window.openPicker = openPicker;
window.removePart = removePart;
window.removeSelectedGame = removeSelectedGame;

// API Configuration
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
  selectedGame: null,
};

// Component Definitions
const componentsConfig = [
  { id: "cpu", name: "CPU", api: "/cpus", multi: false, icon: "🖥️" },
  {
    id: "mainboard",
    name: "Mainboard",
    api: "/mainboards",
    multi: false,
    icon: "🛹",
  },
  { id: "ram", name: "RAM", api: "/rams", multi: false, icon: "🎛️" },
  { id: "vga", name: "VGA", api: "/vgas", multi: false, icon: "🎮" },
  {
    id: "ssd",
    name: "Ổ cứng SSD",
    api: "/ssds",
    multi: true,
    max: 2,
    icon: "💽",
  },
  {
    id: "hdd",
    name: "Ổ cứng HDD",
    api: "/hdds",
    multi: true,
    max: 2,
    icon: "💿",
  },
  { id: "psu", name: "Nguồn (PSU)", api: "/psus", multi: false, icon: "🔋" },
  {
    id: "cooler",
    name: "Tản nhiệt",
    api: "/coolers",
    multi: false,
    icon: "❄️",
  },
  {
    id: "case",
    name: "Vỏ máy (Case)",
    api: "/cases",
    multi: false,
    icon: "🗄️",
  },
];

// Helper to make API calls
async function apiCall(endpoint, method = "GET", body = null) {
  const headers = { "Content-Type": "application/json" };

  // Add token if exists (though build check might be public)
  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });
    const data = await res.json();
    return data; // returns { code, message, result }
  } catch (err) {
    console.error("API Error:", err);
    return { code: 9999, message: err.message, result: null };
  }
}

// Initialize Page
document.addEventListener("DOMContentLoaded", () => {
  initBuildSlots();
  setupModalEvents();

  document
    .getElementById("reset-build-btn")
    .addEventListener("click", resetBuild);
  
  // Update Save Build button state on page load
  updateSaveBuildButtonState();

  // Bottleneck check trigger
  document.getElementById("check-bottleneck-btn").addEventListener("click", analyzeBottleneck);

  // Game Feature Events
  setupGameEvents();
});

// Setup Initial Slots
function initBuildSlots() {
  const container = document.getElementById("build-components-list");
  container.innerHTML = "";

  componentsConfig.forEach((comp) => {
    container.appendChild(createSlotElement(comp));
  });
}

function createSlotElement(comp) {
  const el = document.createElement("div");
  el.className = "component-slot";
  el.id = `slot-${comp.id}`;

  // Render Empty State
  renderSlotContent(el, comp, null);
  return el;
}

function renderSlotContent(el, comp, partData) {
  const isFilled = partData !== null;

  if (isFilled) {
    el.classList.add("filled");
    const imgUrl =
      partData.imageUrl || "https://via.placeholder.com/60?text=No+Image";
    el.innerHTML = `
            <div class="part-icon-wrap">
                <img src="${imgUrl}" alt="${partData.name}" onerror="this.src='https://via.placeholder.com/60?text=Load+Error'">
            </div>
            <div class="part-info">
                <div class="part-category">${comp.name}</div>
                <div class="part-name" title="${partData.name}">${partData.name}</div>
            </div>
            <div class="part-actions">
                <button class="btn btn-secondary btn-change-part" onclick="openPicker('${comp.id}')">Đổi</button>
                <button class="btn-remove-part" onclick="removePart('${comp.id}')" title="Bỏ chọn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
        `;
  } else {
    el.classList.remove("filled");
    el.innerHTML = `
            <div class="part-icon-wrap">${comp.icon}</div>
            <div class="part-info">
                <div class="part-category">${comp.name}</div>
                <div class="part-empty-text">Chưa chọn linh kiện</div>
            </div>
            <div class="part-actions">
                <button class="btn btn-primary btn-select-part" onclick="openPicker('${comp.id}')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:0.4rem"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Chọn
                </button>
            </div>
        `;
  }
}

// ---- Picker Logic ----
let currentPickingComponent = null;
let currentPage = 1;
const ITEMS_PER_PAGE = 6;
let currentFilteredItems = [];

function setupModalEvents() {
  document
    .getElementById("close-picker-btn")
    .addEventListener("click", closePicker);
  document
    .getElementById("picker-overlay")
    .addEventListener("click", closePicker);

  const searchInput = document.getElementById("picker-search");
  searchInput.addEventListener("input", (e) =>
    filterPickerItems(e.target.value),
  );

  document
    .getElementById("detail-back-btn")
    .addEventListener("click", closeDetailView);
  document.getElementById("detail-select-btn").addEventListener("click", () => {
    if (currentlyViewingItem) {
      selectPart(currentlyViewingItem);
    }
  });

  document.getElementById("page-prev-btn").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderPickerPage();
    }
  });

  document.getElementById("page-next-btn").addEventListener("click", () => {
    const totalPages =
      Math.ceil(currentFilteredItems.length / ITEMS_PER_PAGE) || 1;
    if (currentPage < totalPages) {
      currentPage++;
      renderPickerPage();
    }
  });

  // Save Build Modal Events
  document
    .getElementById("save-build-btn")
    .addEventListener("click", openSaveBuildModal);
  document
    .getElementById("close-save-build-btn")
    .addEventListener("click", closeSaveBuildModal);
  document
    .getElementById("cancel-save-build-btn")
    .addEventListener("click", closeSaveBuildModal);
  document
    .getElementById("save-build-overlay")
    .addEventListener("click", closeSaveBuildModal);
  document
    .getElementById("confirm-save-build-btn")
    .addEventListener("click", handleSaveBuild);
  
  // Character counter for description
  const descriptionInput = document.getElementById("build-description");
  const charCountSpan = document.getElementById("desc-char-count");
  descriptionInput.addEventListener("input", () => {
    charCountSpan.textContent = descriptionInput.value.length;
  });
  
  // Real-time validation for build name
  const buildNameInput = document.getElementById("build-name");
  buildNameInput.addEventListener("input", () => {
    const errorEl = document.getElementById("build-name-error");
    if (buildNameInput.value.trim()) {
      errorEl.style.display = "none";
      buildNameInput.classList.remove("error");
    }
  });
  
  // Keyboard support - ESC to close modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const saveBuildModal = document.getElementById("save-build-modal");
      if (saveBuildModal.classList.contains("active")) {
        closeSaveBuildModal();
      }
      const compatErrorModal = document.getElementById("compat-error-modal");
      if (compatErrorModal && compatErrorModal.classList.contains("active")) {
        closeCompatErrorModal();
      }
      closePicker();
    }
  });

  // Compatibility Error Modal Events
  document
    .getElementById("close-compat-error-btn")
    .addEventListener("click", closeCompatErrorModal);
  document
    .getElementById("confirm-compat-error-btn")
    .addEventListener("click", closeCompatErrorModal);
  const compatOverlay = document.getElementById("compat-error-overlay");
  if (compatOverlay) {
    compatOverlay.addEventListener("click", closeCompatErrorModal);
  }
}

function openPicker(compId) {
  currentPickingComponent = componentsConfig.find((c) => c.id === compId);
  if (!currentPickingComponent) return;

  document.getElementById("picker-title").innerText =
    `Chọn ${currentPickingComponent.name}`;
  document.getElementById("picker-search").value = "";

  closeDetailView(); // Ensure we always start in list view

  const modal = document.getElementById("picker-modal");
  modal.classList.add("active");

  loadPickerData();
}

function closePicker() {
  document.getElementById("picker-modal").classList.remove("active");
  currentPickingComponent = null;
}

let pickerCache = {};

async function loadPickerData() {
  const listEl = document.getElementById("picker-items");
  listEl.innerHTML =
    '<div class="loader-view">Đang tải danh sách linh kiện...</div>';

  const comp = currentPickingComponent;

  if (!pickerCache[comp.id]) {
    const res = await apiCall(comp.api);
    if (res.code === 1000 && res.result && res.result.data) {
      pickerCache[comp.id] = res.result.data; // Page response .data holds the array
    } else if (res.code === 1000 && Array.isArray(res.result)) {
      // Fallback if APIs return direct array
      pickerCache[comp.id] = res.result;
    } else {
      listEl.innerHTML = `<div class="loader-view error-view">Lỗi tải dữ liệu. Cố thử lại sau!</div>`;
      return;
    }
  }

  currentFilteredItems = pickerCache[comp.id];
  currentPage = 1;
  renderPickerPage();
}

function filterPickerItems(query) {
  if (!currentPickingComponent || !pickerCache[currentPickingComponent.id])
    return;

  const q = query.toLowerCase().trim();
  if (!q) {
    currentFilteredItems = pickerCache[currentPickingComponent.id];
  } else {
    currentFilteredItems = pickerCache[currentPickingComponent.id].filter(
      (item) => item.name && item.name.toLowerCase().includes(q),
    );
  }

  currentPage = 1;
  renderPickerPage();
}

function renderPickerPage() {
  const totalPages =
    Math.ceil(currentFilteredItems.length / ITEMS_PER_PAGE) || 1;
  if (currentPage > totalPages) currentPage = totalPages;

  // Update pagination UI
  const pageInfo = document.getElementById("page-info");
  const pagePrev = document.getElementById("page-prev-btn");
  const pageNext = document.getElementById("page-next-btn");

  if (pageInfo) pageInfo.innerText = `Trang ${currentPage} / ${totalPages}`;
  if (pagePrev) pagePrev.disabled = currentPage <= 1;
  if (pageNext) pageNext.disabled = currentPage >= totalPages;

  // Get items for current page
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = currentFilteredItems.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  renderPickerList(paginatedItems);
}

function renderPickerList(items) {
  const listEl = document.getElementById("picker-items");
  listEl.innerHTML = "";

  if (!items || items.length === 0) {
    listEl.innerHTML =
      '<div class="loader-view">Không tìm thấy linh kiện nào.</div>';
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "part-card";
    card.onclick = () => viewPartDetail(item);

    const imgUrl =
      item.imageUrl || "https://via.placeholder.com/150?text=No+Image";

    let subTexts = [];
    if (item.socket && item.socket.name)
      subTexts.push(`Socket: ${item.socket.name}`);
    if (item.ramType && item.ramType.name)
      subTexts.push(`RAM: ${item.ramType.name}`);
    if (item.wattage) subTexts.push(`Nguồn: ${item.wattage}W`);
    if (item.formFactor) subTexts.push(`Size: ${item.formFactor}`);

    let subText = subTexts.join(" | ");

    card.innerHTML = `
            <img src="${imgUrl}" alt="${item.name}" class="part-card-img" onerror="this.src='https://via.placeholder.com/150?text=Load+Error'">
            <div class="part-card-title" title="${item.name}">${item.name}</div>
            <div class="part-card-specs">${subText}</div>
            <div class="part-card-actions">
                <button class="btn btn-secondary part-card-select">Chọn</button>
                <button class="btn btn-secondary part-card-detail">Chi tiết</button>
            </div>
        `;

    const selectBtn = card.querySelector(".part-card-select");
    selectBtn.onclick = (e) => {
      e.stopPropagation();
      selectPart(item);
    };

    const detailBtn = card.querySelector(".part-card-detail");
    detailBtn.onclick = (e) => {
      e.stopPropagation();
      viewPartDetail(item);
    };

    listEl.appendChild(card);
  });
}

// ---- Detail View Logic ----
let currentlyViewingItem = null;

function viewPartDetail(item) {
  currentlyViewingItem = item;
  const listView = document.getElementById("picker-list-view");
  const detailView = document.getElementById("picker-detail-view");
  const detailContent = document.getElementById("detail-content");

  let html = `<div style="display: flex; gap: 1.5rem; flex-wrap: wrap; align-items: flex-start;">`;

  // Left column: Image & Specs
  const imgUrl =
    item.imageUrl || "https://via.placeholder.com/300?text=No+Image";
  html += `<div style="flex: 1; min-width: 280px; max-width: 380px; display: flex; flex-direction: column; gap: 1.5rem;">
                <!-- Hình ảnh vuông -->
                <div style="width: 100%; aspect-ratio: 1/1; background: white; padding: 1.5rem; border: 1px solid var(--border-color); border-radius: var(--border-radius); display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.1));">
                    <img src="${imgUrl}" alt="${item.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                </div>
                
                <!-- Thông số kỹ thuật -->
                <div style="background: white; padding: 1.5rem; border: 1px solid var(--border-color); border-radius: var(--border-radius); box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.1));">
                    <h4 style="margin-top: 0; margin-bottom: 1rem; font-weight: 600; color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">Thông số kỹ thuật</h4>
                    <div style="display: flex; flex-direction: column;">`;

  // Extract dynamic specs based on item object keys
  const formatSpec = (label, value) => {
    if (value === null || value === undefined || value === "") return "";

    let displayValue = value;
    if (typeof value === "object")
      displayValue = value.name || JSON.stringify(value);
    else if (typeof value === "boolean") displayValue = value ? "Có" : "Không";

    return `<div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px dashed var(--border-color);">
                <div style="font-size: 0.9rem; color: var(--text-secondary); padding-right: 1rem;">${label}</div>
                <div style="font-weight: 600; color: var(--text-primary); text-align: right; font-size: 0.95rem;">${displayValue}</div>
            </div>`;
  };

  if (item.socket) html += formatSpec("Socket", item.socket);
  if (item.coreCount) html += formatSpec("Nhân (Cores)", item.coreCount);
  if (item.threadCount) html += formatSpec("Luồng (Threads)", item.threadCount);
  if (item.baseClockInfo) html += formatSpec("Xung cơ bản", item.baseClockInfo);
  if (item.boostClockInfo)
    html += formatSpec("Xung tối đa", item.boostClockInfo);
  if (item.tdp) html += formatSpec("TDP", item.tdp + " W");
  if (item.hasIntegratedGraphics !== undefined)
    html += formatSpec("Đồ họa tích hợp", item.hasIntegratedGraphics);

  // Mainboard specific
  if (item.formFactor) html += formatSpec("Form Factor", item.formFactor);
  if (item.ramType) html += formatSpec("Loại RAM", item.ramType);
  if (item.ramSlots) html += formatSpec("Khe cắm RAM", item.ramSlots);
  if (item.maxRamCapacity)
    html += formatSpec("RAM tối đa", item.maxRamCapacity + " GB");
  if (item.pcieVersion) html += formatSpec("PCIe Version", item.pcieVersion);
  if (item.pcieSlots) html += formatSpec("Khe cắm PCIe", item.pcieSlots);
  if (item.m2Slots) html += formatSpec("Khe cắm M.2", item.m2Slots);
  if (item.sataPorts) html += formatSpec("Cổng SATA", item.sataPorts);

  // RAM specific
  if (item.capacity) html += formatSpec("Dung lượng", item.capacity + " GB");
  if (item.busSpeed) html += formatSpec("Tốc độ Bus", item.busSpeed + " MHz");
  if (item.latency) html += formatSpec("Độ trễ", item.latency);
  if (item.voltage) html += formatSpec("Điện áp", item.voltage + " V");
  if (item.moduleCount) html += formatSpec("Số thanh (Kit)", item.moduleCount);

  // VGA specific
  if (item.vram) html += formatSpec("VRAM", item.vram + " GB");
  if (item.length) html += formatSpec("Chiều dài", item.length + " mm");
  if (item.powerConnector)
    html += formatSpec("Đầu cấp nguồn", item.powerConnector);
  if (item.recommendedPsuWattage && !item.wattage)
    html += formatSpec("Nguồn khuyến nghị", item.recommendedPsuWattage + " W");

  // PSU specific
  if (item.wattage) html += formatSpec("Công suất", item.wattage + " W");
  if (item.efficiencyRating)
    html += formatSpec("Chuẩn hiệu suất", item.efficiencyRating);
  if (item.modularType) html += formatSpec("Chuẩn cáp", item.modularType);

  // Storage
  if (item.type) html += formatSpec("Loại", item.type);
  if (item.interfaceType)
    html += formatSpec("Chuẩn kết nối", item.interfaceType);
  if (item.readSpeed)
    html += formatSpec("Tốc độ đọc", item.readSpeed + " MB/s");
  if (item.writeSpeed)
    html += formatSpec("Tốc độ ghi", item.writeSpeed + " MB/s");
  if (item.rpm) html += formatSpec("Tốc độ vòng quay", item.rpm + " RPM");
  if (item.cache) html += formatSpec("Bộ nhớ đệm", item.cache + " MB");

  // Cooler
  if (item.coolerType) html += formatSpec("Loại tản nhiệt", item.coolerType);
  if (item.height) html += formatSpec("Chiều cao tản", item.height + " mm");
  if (item.radiatorSize)
    html += formatSpec("Kích thước Radiator", item.radiatorSize + " mm");
  if (item.supportedSockets) {
    html += formatSpec(
      "Socket hỗ trợ",
      item.supportedSockets.map((s) => s.name).join(", "),
    );
  }

  // Case
  if (item.caseSize) html += formatSpec("Cỡ Case", item.caseSize);
  if (item.maxGpuLength)
    html += formatSpec("VGA max length", item.maxGpuLength + " mm");
  if (item.maxCpuCoolerHeight)
    html += formatSpec("Tản màu cao max", item.maxCpuCoolerHeight + " mm");

  html += `</div></div></div>`;

  // Right column: Content
  html += `<div style="flex: 2; min-width: 300px; display: flex; flex-direction: column;">
                <div style="background: white; padding: 1.5rem; border: 1px solid var(--border-color); border-radius: var(--border-radius); box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.1)); height: 100%;">
                    <h2 style="font-size: 1.6rem; font-weight: 800; color: var(--text-primary); margin: 0 0 1rem 0;">${item.name}</h2>
                    <h4 style="margin: 0 0 0.5rem 0; font-weight: 600; color: var(--text-primary);">Mô tả sản phẩm</h4>
                    <div style="color: var(--text-secondary); line-height: 1.6; white-space: pre-wrap; font-size: 0.95rem;">${item.description || "Chưa có mô tả chung cho sản phẩm này."}</div>
                </div>
           </div>`;

  html += `</div>`;

  detailContent.innerHTML = html;
  const priceEl = document.getElementById("detail-price");
  if (priceEl) priceEl.innerText = ""; // Bỏ giá liên hệ

  listView.style.display = "none";
  detailView.style.display = "flex";
}

function closeDetailView() {
  currentlyViewingItem = null;
  document.getElementById("picker-list-view").style.display = "flex";
  document.getElementById("picker-detail-view").style.display = "none";
}

function selectPart(item) {
  const comp = currentPickingComponent;

  // Update State
  if (comp.multi) {
    // Multi logic (SSD, HDD). Just replacing first slot for simplicity in this demo, easily extensible
    buildState[`${comp.id}Ids`] = [item.id];
  } else {
    buildState[`${comp.id}Id`] = item.id;
  }

  // Render Selection in UI
  const slotEl = document.getElementById(`slot-${comp.id}`);
  renderSlotContent(slotEl, comp, item);

  closePicker();

  // Update Save Build button state
  updateSaveBuildButtonState();

  // Trigger compatibility check (keep it automatic)
  checkCompatibility();
  
  // Reset bottleneck results when component changed
  hideBottleneckResults();
}

function removePart(compId) {
  const comp = componentsConfig.find((c) => c.id === compId);

  if (comp.multi) {
    buildState[`${comp.id}Ids`] = [];
  } else {
    buildState[`${comp.id}Id`] = null;
  }

  const slotEl = document.getElementById(`slot-${comp.id}`);
  renderSlotContent(slotEl, comp, null);

  // Update Save Build button state
  updateSaveBuildButtonState();

  checkCompatibility();
  
  // Reset bottleneck results when part removed
  hideBottleneckResults();
}

function resetBuild() {
  componentsConfig.forEach((comp) => {
    removePart(comp.id);
  });
  
  // Update Save Build button state after reset
  updateSaveBuildButtonState();
}

// ---- Compatibility Checking ----
async function checkCompatibility() {
  // Collect non-null ids
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
    // Reset purely
    resetStatusView();
    return;
  }

  const res = await apiCall("/builds/check-compatibility", "POST", payload);

  if (res.code === 1000 && res.result) {
    updateSummaryView(res.result);
  } else {
    showToast(
      "Lỗi Kiểm Tra",
      "Không thể kiểm tra tương thích hệ thống: " + (res.message || "Error"),
      true,
    );
  }
}

function resetStatusView() {
  const statusBox = document.getElementById("compat-status");
  statusBox.className = "compat-status neutral";

  document.getElementById("compat-status-title").innerText =
    "Chưa có linh kiện";
  document.getElementById("compat-status-desc").innerText =
    "Hãy bắt đầu chọn linh kiện để kiểm tra";

  document.getElementById("psu-recommend-value").innerText = "0W";

  document.getElementById("error-group").style.display = "none";
  document.getElementById("warning-group").style.display = "none";
}

function updateSummaryView(result) {
  const statusBox = document.getElementById("compat-status");
  const titleEl = document.getElementById("compat-status-title");
  const descEl = document.getElementById("compat-status-desc");

  // Status Logic
  if (result.errors && result.errors.length > 0) {
    statusBox.className = "compat-status error";
    titleEl.innerText = "Không tương thích";
    descEl.innerText = "Vui lòng sửa các lỗi nghiêm trọng bên dưới";
    statusBox.querySelector(".compat-status-icon").innerHTML =
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  } else if (result.warnings && result.warnings.length > 0) {
    statusBox.className = "compat-status warning";
    titleEl.innerText = "Tương thích (Có cảnh báo)";
    descEl.innerText = "Các linh kiện khớp nhau, nhưng có lưu ý tối ưu";
    statusBox.querySelector(".compat-status-icon").innerHTML =
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
  } else {
    statusBox.className = "compat-status success";
    titleEl.innerText = "Tương thích hoàn hảo";
    descEl.innerText = "Tuyệt vời! Không phát hiện vấn đề nào!";
    statusBox.querySelector(".compat-status-icon").innerHTML =
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  }

  // PSU Wattage
  document.getElementById("psu-recommend-value").innerText =
    `${result.recommendedPsuWattage || 0}W`;

  // Errors
  const errGroup = document.getElementById("error-group");
  const errList = document.getElementById("error-list");
  if (result.errors && result.errors.length > 0) {
    errList.innerHTML = result.errors.map((msg) => `<li>${msg}</li>`).join("");
    errGroup.style.display = "block";
  } else {
    errGroup.style.display = "none";
    errList.innerHTML = "";
  }

  // Warnings
  const warnGroup = document.getElementById("warning-group");
  const warnList = document.getElementById("warning-list");
  if (result.warnings && result.warnings.length > 0) {
    warnList.innerHTML = result.warnings
      .map((msg) => `<li>${msg}</li>`)
      .join("");
    warnGroup.style.display = "block";
  } else {
    warnGroup.style.display = "none";
    warnList.innerHTML = "";
  }
}

// ---- Toast Utilities ----
function showToast(title, message, isError = false) {
  const toast = document.getElementById("toast");
  const titleEl = document.getElementById("toast-title");
  const msgEl = document.getElementById("toast-message");
  const iconEl = document.getElementById("toast-icon");

  titleEl.textContent = title;
  msgEl.textContent = message;

  if (isError) {
    toast.style.borderLeftColor = "#f56565";
    iconEl.innerHTML =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f56565" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
  } else {
    toast.style.borderLeftColor = "#48bb78";
    iconEl.innerHTML =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#48bb78" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
  }

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 4000);
}

document.getElementById("toast-close")?.addEventListener("click", () => {
  document.getElementById("toast").classList.remove("show");
});

// ===================================
// GAME COMPATIBILITY & FPS FEATURE
// ===================================

let allGamesData = [];
let gameCurrentPage = 1;
const GAME_ITEMS_PER_PAGE = 12;
let gameFilteredItems = [];
let fpsResolution = "1080p";

function setupGameEvents() {
  document.getElementById("view-game-list-btn").addEventListener("click", openGamePicker);
  document.getElementById("check-all-games-btn").addEventListener("click", checkAllGamesCompatibility);
  document.getElementById("close-game-picker-btn").addEventListener("click", closeGamePicker);
  document.getElementById("game-picker-overlay").addEventListener("click", closeGamePicker);
  
  document.getElementById("game-picker-search").addEventListener("input", (e) => filterGames(e.target.value));
  document.getElementById("game-page-prev").addEventListener("click", () => {
    if (gameCurrentPage > 1) { gameCurrentPage--; renderGamePage(); }
  });
  document.getElementById("game-page-next").addEventListener("click", () => {
    const total = Math.ceil(gameFilteredItems.length / GAME_ITEMS_PER_PAGE) || 1;
    if (gameCurrentPage < total) { gameCurrentPage++; renderGamePage(); }
  });

  document.getElementById("remove-selected-game").addEventListener("click", removeSelectedGame);
  document.getElementById("check-single-game-btn").addEventListener("click", checkSingleGameCompatibility);
  document.getElementById("estimate-fps-btn").addEventListener("click", openFpsModal);
  
  document.getElementById("close-fps-btn").addEventListener("click", closeFpsModal);
  document.getElementById("fps-overlay").addEventListener("click", closeFpsModal);
  
  document.querySelectorAll(".resolution-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".resolution-btn").forEach(b => b.classList.remove("btn-primary"));
      btn.classList.add("btn-primary");
      fpsResolution = btn.dataset.res;
      if (buildState.selectedGame) {
        calculateFps();
      }
    });
  });

  document.getElementById("close-game-compat-list-btn").addEventListener("click", () => {
    document.getElementById("game-compat-list-modal").classList.remove("active");
  });
  document.getElementById("game-compat-list-overlay").addEventListener("click", () => {
    document.getElementById("game-compat-list-modal").classList.remove("active");
  });
}

async function openGamePicker() {
  const modal = document.getElementById("game-picker-modal");
  modal.classList.add("active");
  
  if (allGamesData.length === 0) {
    const listEl = document.getElementById("game-picker-items");
    listEl.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem;">Đang tải danh sách game...</div>';
    
    const res = await apiCall("/games?size=100"); // Load a decent amount
    if (res.result) {
      // Robust extraction: Handle PageResponse { content: [...] }, { data: [...] }, or direct array
      if (res.result.content && Array.isArray(res.result.content)) {
        allGamesData = res.result.content;
      } else if (res.result.data && Array.isArray(res.result.data)) {
        allGamesData = res.result.data;
      } else if (Array.isArray(res.result)) {
        allGamesData = res.result;
      }
    }

    if (allGamesData.length > 0) {
      // success
    } else {
      console.warn("No games data found or fetch failed:", res);
      listEl.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--danger-color);">Không thể tải danh sách game.</div>';
      return;
    }
  }
  
  gameFilteredItems = allGamesData;
  gameCurrentPage = 1;
  renderGamePage();
}

function closeGamePicker() {
  document.getElementById("game-picker-modal").classList.remove("active");
}

function filterGames(query) {
  const q = query.toLowerCase().trim();
  gameFilteredItems = allGamesData.filter(g => g.name.toLowerCase().includes(q));
  gameCurrentPage = 1;
  renderGamePage();
}

function renderGamePage() {
  const listEl = document.getElementById("game-picker-items");
  listEl.innerHTML = "";
  
  const startIndex = (gameCurrentPage - 1) * GAME_ITEMS_PER_PAGE;
  const pageItems = gameFilteredItems.slice(startIndex, startIndex + GAME_ITEMS_PER_PAGE);
  const totalPages = Math.ceil(gameFilteredItems.length / GAME_ITEMS_PER_PAGE) || 1;
  
  document.getElementById("game-page-info").innerText = `Trang ${gameCurrentPage} / ${totalPages}`;
  document.getElementById("game-page-prev").disabled = gameCurrentPage <= 1;
  document.getElementById("game-page-next").disabled = gameCurrentPage >= totalPages;

  pageItems.forEach(game => {
    const card = document.createElement("div");
    card.className = "game-card-item";
    card.style = "cursor: pointer; background: white; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; transition: all 0.2s; display: flex; flex-direction: column;";
    card.innerHTML = `
      <img src="${game.coverImageUrl || 'https://via.placeholder.com/150x200?text=No+Cover'}" style="width: 100%; aspect-ratio: 3/4; object-fit: cover;">
      <div style="padding: 10px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
        <div style="font-size: 0.8rem; font-weight: 700; margin-bottom: 5px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${game.name}</div>
        <button class="btn btn-primary" style="font-size: 0.7rem; padding: 4px; width: 100%;">Chọn</button>
      </div>
    `;
    card.onclick = () => selectGame(game);
    listEl.appendChild(card);
  });
}

function selectGame(game) {
  buildState.selectedGame = game;
  closeGamePicker();
  
  const card = document.getElementById("selected-game-card");
  card.style.display = "block";
  document.getElementById("selected-game-img").src = game.coverImageUrl || 'https://via.placeholder.com/60';
  document.getElementById("selected-game-name").innerText = game.name;
  document.getElementById("selected-game-status").innerText = "Chưa kiểm tra";
  document.getElementById("selected-game-status").style.color = "var(--text-secondary)";
}

function removeSelectedGame() {
  buildState.selectedGame = null;
  document.getElementById("selected-game-card").style.display = "none";
}

async function checkSingleGameCompatibility() {
  if (!buildState.cpuId || !buildState.vgaId) {
    showToast("Thiếu linh kiện", "Vui lòng chọn CPU và VGA trước", true);
    return;
  }
  
  const game = buildState.selectedGame;
  const statusEl = document.getElementById("selected-game-status");
  statusEl.innerText = "Đang kiểm tra...";
  
  const payload = {
    cpuId: buildState.cpuId,
    vgaId: buildState.vgaId,
    ramId: buildState.ramId
  };
  
  const res = await apiCall(`/games/${game.id}/check-compatibility`, "POST", payload);
  if (res.code === 1000 && res.result) {
    const status = res.result.compatibility;
    statusEl.innerText = res.result.message || status;
    
    if (status === "RECOMMENDED") statusEl.style.color = "#10b981";
    else if (status === "MINIMUM") statusEl.style.color = "#f59e0b";
    else statusEl.style.color = "#ef4444";
  } else {
    statusEl.innerText = "Lỗi kiểm tra";
    statusEl.style.color = "red";
  }
}

async function checkAllGamesCompatibility() {
  if (!buildState.cpuId || !buildState.vgaId || !buildState.ramId) {
    showToast("Thiếu linh kiện", "Vui lòng chọn CPU, VGA và RAM để check tất cả", true);
    return;
  }
  
  const btn = document.getElementById("check-all-games-btn");
  const originalText = btn.innerText;
  btn.innerText = "⌛...";
  btn.disabled = true;
  
  const payload = {
    cpuId: buildState.cpuId,
    vgaId: buildState.vgaId,
    ramId: buildState.ramId
  };
  
  try {
    const res = await apiCall("/games/check-compatible", "POST", payload);
    if (res.code === 1000 && res.result) {
      displayAllGamesResults(res.result);
    } else {
      showToast("Lỗi", res.message || "Không thể kiểm tra danh sách game", true);
    }
  } catch (e) {
    showToast("Lỗi", "Lỗi mạng hoặc hệ thống", true);
  } finally {
    btn.innerText = originalText;
    btn.disabled = false;
  }
}

function displayAllGamesResults(result) {
  const modal = document.getElementById("game-compat-list-modal");
  modal.classList.add("active");
  
  const summaryEl = document.getElementById("pc-spec-summary");
  summaryEl.innerHTML = `
    <div><strong>CPU:</strong> ${result.pcSummary.cpuName} (${result.pcSummary.cpuScore})</div>
    <div><strong>GPU:</strong> ${result.pcSummary.gpuName} (${result.pcSummary.gpuScore})</div>
    <div><strong>RAM:</strong> ${result.pcSummary.totalRamGb} GB</div>
  `;
  
  const container = document.getElementById("game-compat-results");
  container.innerHTML = "";
  
  result.results.forEach(g => {
    let badgeClass = "neutral";
    if (g.status === "RECOMMENDED") badgeClass = "success";
    if (g.status === "MINIMUM") badgeClass = "warning";
    if (g.status === "NOT_SUPPORTED") badgeClass = "error";
    
    const row = document.createElement("div");
    row.style = "display: flex; align-items: center; gap: 15px; padding: 12px; background: white; border: 1px solid var(--border-color); border-radius: 8px;";
    row.innerHTML = `
      <img src="${g.coverImageUrl || 'https://via.placeholder.com/50'}" style="width: 50px; height: 50px; border-radius: 4px; object-fit: cover;">
      <div style="flex: 1;">
        <div style="font-weight: 700; font-size: 0.9rem;">${g.gameName}</div>
        <div style="font-size: 0.75rem; color: var(--text-secondary);">${g.detail}</div>
      </div>
      <div class="pc-chip chip-${badgeClass}" style="margin: 0;">${g.status}</div>
    `;
    container.appendChild(row);
  });
}

function openFpsModal() {
  if (!buildState.cpuId || !buildState.vgaId) {
    showToast("Thiếu linh kiện", "Cần chọn CPU và VGA để đo FPS", true);
    return;
  }
  
  const modal = document.getElementById("fps-modal");
  modal.classList.add("active");
  
  // Set default resolution button
  document.querySelectorAll(".resolution-btn").forEach(btn => {
    if (btn.dataset.res === fpsResolution) btn.classList.add("btn-primary");
    else btn.classList.remove("btn-primary");
  });
  
  calculateFps();
}

function closeFpsModal() {
  document.getElementById("fps-modal").classList.remove("active");
}

async function calculateFps() {
  const loading = document.getElementById("fps-loading");
  const results = document.getElementById("fps-result-container");
  
  loading.style.display = "block";
  results.style.display = "none";
  
  const payload = {
    cpuId: buildState.cpuId,
    vgaId: buildState.vgaId,
    resolution: fpsResolution
  };
  
  const res = await apiCall(`/games/${buildState.selectedGame.id}/estimate-fps`, "POST", payload);
  loading.style.display = "none";
  
  if (res.code === 1000 && res.result) {
    results.style.display = "block";
    const data = res.result;
    
    const estimates = document.getElementById("fps-estimates");
    estimates.innerHTML = `
      <div class="fps-card" style="text-align: center; padding: 15px; background: #f8fafc; border: 1px solid var(--border-color); border-radius: 8px;">
        <div style="font-size: 0.75rem; color: var(--text-secondary);">LOW</div>
        <div style="font-size: 1.5rem; font-weight: 800; color: #10b981;">${data.fpsEstimates.low.estimatedFps}</div>
        <div style="font-size: 0.65rem; font-weight: 600;">${data.fpsEstimates.low.verdict}</div>
      </div>
      <div class="fps-card" style="text-align: center; padding: 15px; background: #f8fafc; border: 1px solid var(--border-color); border-radius: 8px;">
        <div style="font-size: 0.75rem; color: var(--text-secondary);">MEDIUM</div>
        <div style="font-size: 1.5rem; font-weight: 800; color: #3b82f6;">${data.fpsEstimates.medium.estimatedFps}</div>
        <div style="font-size: 0.65rem; font-weight: 600;">${data.fpsEstimates.medium.verdict}</div>
      </div>
      <div class="fps-card" style="text-align: center; padding: 15px; background: #f8fafc; border: 1px solid var(--border-color); border-radius: 8px;">
        <div style="font-size: 0.75rem; color: var(--text-secondary);">HIGH</div>
        <div style="font-size: 1.5rem; font-weight: 800; color: #f59e0b;">${data.fpsEstimates.high.estimatedFps}</div>
        <div style="font-size: 0.65rem; font-weight: 600;">${data.fpsEstimates.high.verdict}</div>
      </div>
    `;
    
    document.getElementById("fps-advice").innerText = data.upgradeAdvice;
  } else {
    showToast("Lỗi", "Không thể tính toán FPS", true);
  }
}

// Balance status configuration for bottleneck analysis
const BALANCE_STATUS_CONFIG = {
  'Excellent Balance': { class: 'excellent', progressColor: 'linear-gradient(90deg, #10b981, #059669)' },
  'Good Balance': { class: 'good', progressColor: 'linear-gradient(90deg, #3b82f6, #2563eb)' },
  'Minor Bottleneck': { class: 'minor', progressColor: 'linear-gradient(90deg, #f59e0b, #d97706)' },
  'Significant Bottleneck': { class: 'significant', progressColor: 'linear-gradient(90deg, #ef4444, #dc2626)' }
};

/**
 * Check if all required components for bottleneck analysis are selected
 * @returns {boolean}
 */
function hasBottleneckRequiredParts() {
  return buildState.cpuId && buildState.vgaId && buildState.ramId && buildState.ssdIds.length > 0;
}

/**
 * Analyze bottleneck for the current build
 */
async function analyzeBottleneck() {
  const btn = document.getElementById("check-bottleneck-btn");
  
  if (!buildState.cpuId || !buildState.vgaId) {
    showToast("Thiếu linh kiện", "⚠️ Cần chọn ít nhất CPU và VGA để phân tích Bottleneck", true);
    return;
  }

  const originalHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="loading-spinner">⌛</span>';

  const payload = {
    cpuId: buildState.cpuId,
    vgaId: buildState.vgaId,
    gpuId: buildState.vgaId
  };

  try {
    const res = await apiCall("/builds/analyze", "POST", payload);

    if (res && res.code === 1000 && res.result) {
      displayBottleneckResults(res.result);
    } else {
      showToast("Lỗi", (res && res.message) ? res.message : "Dữ liệu phân tích không hợp lệ", true);
      hideBottleneckResults();
    }
  } catch (error) {
    console.error("Bottleneck analysis error:", error);
    showToast("Lỗi", "Lỗi xử lý: " + error.message, true);
    hideBottleneckResults();
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
}

/**
 * Display bottleneck analysis results
 */
function displayBottleneckResults(result) {
  if (!result || !result.results) return;
  const analysis = result.results;

  const content = document.getElementById("bottleneck-results-content");
  if (content) content.style.display = "block";

  const res1080 = analysis["1080p"] || {};
  const res2k = analysis["2k"] || {};
  const res4k = analysis["4k"] || {};

  const updateRes = (id, data) => {
    const el = document.getElementById(id);
    if (!el) return;
    
    const severityMap = {
      "NONE": { text: "Cân bằng", color: "#38a169" },
      "LOW": { text: "Nghẽn nhẹ", color: "#81e6d9" },
      "MEDIUM": { text: "Nghẽn vừa", color: "#dd6b20" },
      "HIGH": { text: "Nghẽn nặng", color: "#e53e3e" }
    };

    const severity = (data.severity || "NONE").toUpperCase();
    const config = severityMap[severity] || { text: severity, color: "#a0aec0" };

    el.textContent = config.text;
    el.style.color = config.color;
    el.style.fontSize = "0.85rem";
    el.style.fontWeight = "800";
  };

  updateRes("bottleneck-1080p", res1080);
  updateRes("bottleneck-2k", res2k);
  updateRes("bottleneck-4k", res4k);

  // Hide Wattage as it's not in this response structure
  const wattageSection = document.getElementById("bottleneck-wattage-item");
  if (wattageSection) {
      wattageSection.style.display = "none";
  }

  // Update Message (all resolutions)
  const msgEl = document.getElementById("bottleneck-message");
  if (msgEl) {
      msgEl.innerHTML = `
          <div style="margin-bottom: 0.5rem;"><strong style="color: var(--primary-color);">1080P:</strong> ${res1080.message || "Không có dữ liệu"}</div>
          <div style="margin-bottom: 0.5rem;"><strong style="color: var(--primary-color);">2K:</strong> ${res2k.message || "Không có dữ liệu"}</div>
          <div><strong style="color: var(--primary-color);">4K:</strong> ${res4k.message || "Không có dữ liệu"}</div>
      `;
  }
}

/**
 * Hide bottleneck results when requirements not met or something changed
 */
function hideBottleneckResults() {
  const content = document.getElementById("bottleneck-results-content");
  if (content) {
    content.style.display = "none";
  }
}

// ===================================
// SAVE BUILD FEATURE
// ===================================

/**
 * Check if required parts (CPU, Mainboard, RAM) are selected
 * @returns {boolean}
 */
function hasRequiredParts() {
  // Return true if any part is selected
  return buildState.cpuId || 
         buildState.mainboardId || 
         buildState.ramId || 
         buildState.vgaId || 
         buildState.psuId || 
         buildState.caseId || 
         buildState.coolerId || 
         buildState.ssdIds.length > 0 || 
         buildState.hddIds.length > 0;
}

/**
 * Update Save Build button state based on required parts
 */
function updateSaveBuildButtonState() {
  const saveBtn = document.getElementById("save-build-btn");
  if (!saveBtn) return;
  
  if (hasRequiredParts()) {
    saveBtn.disabled = false;
    saveBtn.title = "Lưu cấu hình hiện tại";
  } else {
    saveBtn.disabled = true;
    saveBtn.title = "Hãy chọn ít nhất một linh kiện để lưu";
  }
}

/**
 * Check JWT token existence
 * @returns {string|null} JWT token or null
 */
function getJWTToken() {
  return localStorage.getItem("jwt_token") || localStorage.getItem("token");
}

/**
 * Step 1: Check compatibility BEFORE opening the save build name modal
 */
async function openSaveBuildModal() {
  // Check JWT token first
  const token = getJWTToken();
  if (!token) {
    showToast(
      "Chưa đăng nhập",
      "⚠️ Vui lòng đăng nhập để lưu cấu hình",
      true
    );
    setTimeout(() => {
      window.location.href = "index.html?redirect=build_pc.html";
    }, 2000);
    return;
  }
  
  // Check required parts (Client side validation)
  if (!hasRequiredParts()) {
    showToast(
      "Thiếu linh kiện",
      "⚠️ Vui lòng chọn ít nhất CPU, Mainboard và RAM",
      true
    );
    return;
  }

  // 1. PERFORM COMPATIBILITY CHECK FIRST
  const saveBtn = document.getElementById("save-build-btn");
  const originalHtml = saveBtn.innerHTML;
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem; animation: spin 1s linear infinite;"><circle cx="12" cy="12" r="10"></circle></svg> Đang kiểm tra...';

  try {
    const payload = buildPayloadForCheck();
    const response = await fetch(`${API_BASE_URL}/builds/check-compatibility`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const resData = await response.json();
    
    // Check if compatible
    if (resData.code === 1000 && resData.result && resData.result.compatible === true) {
      // 2. IF COMPATIBLE -> OPEN NAME INPUT MODAL
      document.getElementById("build-name").value = "";
      document.getElementById("build-description").value = "";
      document.getElementById("desc-char-count").textContent = "0";
      document.getElementById("build-name-error").style.display = "none";
      document.getElementById("build-name").classList.remove("error");

      const modal = document.getElementById("save-build-modal");
      modal.classList.add("active");
      
      setTimeout(() => {
        document.getElementById("build-name").focus();
      }, 100);
    } else {
      // 3. IF NOT COMPATIBLE -> SHOW ERROR MODAL
      const errors = resData.result ? resData.result.errors : ["Có lỗi không xác định xảy ra"];
      showCompatErrorModal(errors);
    }
  } catch (error) {
    console.error("Compatibility check error:", error);
    showToast("Lỗi", "❌ Không thể kiểm tra tương thích, vui lòng thử lại sau.", true);
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = originalHtml;
  }
}

/**
 * Step 2: Handle Final Save (POST /builds)
 */
async function handleSaveBuild() {
  const buildName = document.getElementById("build-name").value.trim();
  const buildDescription = document.getElementById("build-description").value.trim();
  const errorEl = document.getElementById("build-name-error");
  const inputEl = document.getElementById("build-name");

  if (!buildName) {
    errorEl.textContent = "Tên cấu hình không được để trống";
    errorEl.style.display = "block";
    inputEl.classList.add("error");
    inputEl.focus();
    return;
  }

  const token = getJWTToken();
  const selectedParts = buildSelectedParts();
  const payload = {
    name: buildName,
    description: buildDescription || undefined,
    parts: selectedParts
  };

  const saveBtn = document.getElementById("confirm-save-build-btn");
  const originalText = saveBtn.innerHTML;
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem; animation: spin 1s linear infinite;"><circle cx="12" cy="12" r="10"></circle></svg> Đang lưu...';

  try {
    const response = await fetch(`${API_BASE_URL}/builds`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.code === 1000) {
      closeSaveBuildModal();
      showToast("Thành công", "✅ Lưu cấu hình thành công!", false);
      setTimeout(() => {
        window.location.href = "my-builds.html"; // Chuyển hướng về trang My Builds
      }, 1500);
    } else if (result.code === 5004) {
      errorEl.textContent = "Tên cấu hình này đã tồn tại trong tài khoản của bạn. Vui lòng chọn một tên khác!";
      errorEl.style.display = "block";
      inputEl.classList.add("error");
    } else if (result.code === 5005) {
      closeSaveBuildModal();
      showToast("Lỗi", "❌ Cấu hình PC không hợp lệ hoặc đã xảy ra xung đột. Vui lòng kiểm tra lại.", true);
    } else {
      showToast("Lỗi", result.message || "❌ Có lỗi xảy ra, vui lòng thử lại", true);
    }
  } catch (error) {
    showToast("Lỗi kết nối", "❌ Không thể kết nối đến server", true);
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = originalText;
  }
}

/**
 * Helper: Helper to build payload for compatibility check
 */
function buildPayloadForCheck() {
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
  return payload;
}

/**
 * Modal helpers for Compatibility Errors
 */
function showCompatErrorModal(errors) {
  const listEl = document.getElementById("compat-error-list");
  listEl.innerHTML = errors.map(err => `<li>${err}</li>`).join("");
  document.getElementById("compat-error-modal").classList.add("active");
}

function closeCompatErrorModal() {
  document.getElementById("compat-error-modal").classList.remove("active");
}

/**
 * Close Save Build Modal
 */
function closeSaveBuildModal() {
  const modal = document.getElementById("save-build-modal");
  modal.classList.remove("active");
}

/**
 * Build selectedParts object from buildState
 * Only include parts that are selected (not null/empty)
 * @returns {object}
 */
function buildSelectedParts() {
  const selectedParts = {};
  if (buildState.cpuId) selectedParts.cpu = buildState.cpuId;
  if (buildState.mainboardId) selectedParts.mainboard = buildState.mainboardId;
  if (buildState.ramId) selectedParts.ram = buildState.ramId;
  if (buildState.vgaId) selectedParts.gpu = buildState.vgaId;
  if (buildState.psuId) selectedParts.psu = buildState.psuId;
  if (buildState.caseId) selectedParts.case = buildState.caseId;
  if (buildState.coolerId) selectedParts.cooler = buildState.coolerId;
  if (buildState.ssdIds && buildState.ssdIds.length > 0) selectedParts.ssd = buildState.ssdIds[0];
  if (buildState.hddIds && buildState.hddIds.length > 0) selectedParts.hdd = buildState.hddIds[0];
  return selectedParts;
}


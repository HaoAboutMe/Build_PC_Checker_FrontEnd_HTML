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
    }
  });
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

  // Trigger compatibility check!
  checkCompatibility();
  
  // Trigger bottleneck analysis
  analyzeBottleneck();
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
  
  // Trigger bottleneck analysis
  analyzeBottleneck();
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
// BOTTLENECK ANALYSIS FEATURE
// ===================================

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
  // Check if we have all required components
  if (!hasBottleneckRequiredParts()) {
    hideBottleneckSection();
    return;
  }

  // Prepare payload for API
  const payload = {
    cpuId: buildState.cpuId,
    gpuId: buildState.vgaId,
    ramId: buildState.ramId,
    ssdId: buildState.ssdIds[0] // Use first SSD
  };

  try {
    const res = await apiCall("/builds/analyze", "POST", payload);

    if (res.code === 1000 && res.result) {
      displayBottleneckResults(res.result);
    } else {
      console.warn("Bottleneck analysis returned non-1000 code:", res.message);
      hideBottleneckSection();
    }
  } catch (error) {
    console.error("Bottleneck analysis error:", error);
    hideBottleneckSection();
  }
}

/**
 * Display bottleneck analysis results
 * @param {Object} result - Analysis result with bottleneck, balanceStatus, estimatedWattage
 */
function displayBottleneckResults(result) {
  const { bottleneck, balanceStatus, estimatedWattage } = result;

  // Show the bottleneck section
  const bottleneckSection = document.getElementById("bottleneck-section");
  if (bottleneckSection) {
    bottleneckSection.style.display = "block";
  }

  // Update bottleneck percentage
  const percentageEl = document.getElementById("bottleneck-percentage");
  if (percentageEl) {
    percentageEl.textContent = `${bottleneck.toFixed(1)}%`;
  }

  // Update progress bar
  const progressFill = document.getElementById("bottleneck-progress-fill");
  if (progressFill) {
    progressFill.style.width = `${Math.min(bottleneck, 100)}%`;
    
    // Apply color based on balance status
    const statusConfig = BALANCE_STATUS_CONFIG[balanceStatus];
    if (statusConfig) {
      progressFill.style.background = statusConfig.progressColor;
    }
  }

  // Update balance status badge
  const badgeEl = document.getElementById("bottleneck-badge");
  if (badgeEl) {
    badgeEl.textContent = balanceStatus;
    badgeEl.className = "bottleneck-badge";
    
    const statusConfig = BALANCE_STATUS_CONFIG[balanceStatus];
    if (statusConfig) {
      badgeEl.classList.add(statusConfig.class);
    }
  }

  // Update estimated wattage
  const wattageEl = document.getElementById("bottleneck-wattage");
  if (wattageEl) {
    wattageEl.textContent = `${estimatedWattage.toFixed(0)}W`;
  }

  // Show toast notification
  showToast(
    "Phân tích Bottleneck",
    `Trạng thái: ${balanceStatus} - Bottleneck: ${bottleneck.toFixed(1)}%`,
    false
  );
}

/**
 * Hide bottleneck section when requirements not met
 */
function hideBottleneckSection() {
  const bottleneckSection = document.getElementById("bottleneck-section");
  if (bottleneckSection) {
    bottleneckSection.style.display = "none";
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
  return buildState.cpuId && buildState.mainboardId && buildState.ramId;
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
    saveBtn.title = "Cần chọn CPU, Mainboard và RAM trước khi lưu";
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
 * Open Save Build Modal
 */
function openSaveBuildModal() {
  // Check JWT token first
  const token = getJWTToken();
  if (!token) {
    showToast(
      "Chưa đăng nhập",
      "⚠️ Vui lòng đăng nhập để lưu cấu hình",
      true
    );
    // Redirect to login page after delay
    setTimeout(() => {
      window.location.href = "index.html?redirect=build_pc.html";
    }, 2000);
    return;
  }
  
  // Check required parts
  if (!hasRequiredParts()) {
    showToast(
      "Thiếu linh kiện",
      "⚠️ Vui lòng chọn ít nhất CPU, Mainboard và RAM",
      true
    );
    return;
  }
  
  // Clear previous form data
  document.getElementById("build-name").value = "";
  document.getElementById("build-description").value = "";
  document.getElementById("desc-char-count").textContent = "0";
  document.getElementById("build-name-error").style.display = "none";
  document.getElementById("build-name").classList.remove("error");

  // Show modal
  const modal = document.getElementById("save-build-modal");
  modal.classList.add("active");
  
  // Focus on name input for better UX
  setTimeout(() => {
    document.getElementById("build-name").focus();
  }, 100);
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

  // Map buildState to the format expected by the API
  if (buildState.cpuId) selectedParts.cpu = buildState.cpuId;
  if (buildState.mainboardId) selectedParts.mainboard = buildState.mainboardId;
  if (buildState.ramId) selectedParts.ram = buildState.ramId;
  if (buildState.vgaId) selectedParts.gpu = buildState.vgaId;
  if (buildState.psuId) selectedParts.psu = buildState.psuId;
  if (buildState.caseId) selectedParts.case = buildState.caseId;
  if (buildState.coolerId) selectedParts.cooler = buildState.coolerId;
  
  // For SSD and HDD, use the first one if available
  if (buildState.ssdIds && buildState.ssdIds.length > 0) {
    selectedParts.ssd = buildState.ssdIds[0];
  }
  if (buildState.hddIds && buildState.hddIds.length > 0) {
    selectedParts.hdd = buildState.hddIds[0];
  }

  return selectedParts;
}

/**
 * Handle Save Build - Validate and Send Request
 */
async function handleSaveBuild() {
  const buildName = document.getElementById("build-name").value.trim();
  const buildDescription = document.getElementById("build-description").value.trim();
  const errorEl = document.getElementById("build-name-error");
  const inputEl = document.getElementById("build-name");

  // Validate Build Name (required, max 100 chars)
  if (!buildName) {
    errorEl.textContent = "Tên cấu hình không được để trống";
    errorEl.style.display = "block";
    inputEl.classList.add("error");
    inputEl.focus();
    return;
  }
  
  if (buildName.length > 100) {
    errorEl.textContent = "Tên cấu hình tối đa 100 ký tự";
    errorEl.style.display = "block";
    inputEl.classList.add("error");
    inputEl.focus();
    return;
  }

  // Validate Description (max 500 chars)
  if (buildDescription.length > 500) {
    showToast(
      "Lỗi validation",
      "Mô tả tối đa 500 ký tự",
      true
    );
    return;
  }

  // Hide error if previously shown
  errorEl.style.display = "none";
  inputEl.classList.remove("error");

  // Check JWT token
  const token = getJWTToken();
  if (!token) {
    showToast(
      "Chưa đăng nhập",
      "⚠️ Vui lòng đăng nhập để lưu cấu hình",
      true
    );
    closeSaveBuildModal();
    setTimeout(() => {
      window.location.href = "index.html?redirect=build_pc.html";
    }, 2000);
    return;
  }

  // Build the parts object
  const selectedParts = buildSelectedParts();

  // Check if minimum parts are selected
  if (!selectedParts.cpu || !selectedParts.mainboard || !selectedParts.ram) {
    showToast(
      "Thiếu linh kiện",
      "❌ Phải chọn ít nhất CPU, Mainboard và RAM",
      true
    );
    return;
  }

  // Prepare request payload
  const payload = {
    name: buildName,
    description: buildDescription || undefined, // Don't send empty string
    parts: selectedParts
  };

  // Disable form inputs and button during submission
  const saveBtn = document.getElementById("confirm-save-build-btn");
  const cancelBtn = document.getElementById("cancel-save-build-btn");
  const closeBtn = document.getElementById("close-save-build-btn");
  const originalText = saveBtn.innerHTML;
  
  saveBtn.disabled = true;
  cancelBtn.disabled = true;
  closeBtn.disabled = true;
  inputEl.disabled = true;
  document.getElementById("build-description").disabled = true;
  
  saveBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem; animation: spin 1s linear infinite;"><circle cx="12" cy="12" r="10"></circle></svg> Đang lưu...';

  try {
    // Send POST request to API
    const response = await fetch(`${API_BASE_URL}/builds`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    // Handle different response codes
    if (response.ok && (response.status === 200 || response.status === 201)) {
      // Success (code 1000 expected from backend)
      closeSaveBuildModal();
      showToast(
        "Thành công",
        "✅ Lưu cấu hình thành công!",
        false
      );
      
      // Optional: Redirect to user builds page after 2 seconds
      // setTimeout(() => {
      //   window.location.href = "my-builds.html";
      // }, 2000);
      
    } else {
      // Handle error codes from backend
      const errorCode = result.code;
      let errorMessage = "❌ Có lỗi xảy ra, vui lòng thử lại";
      
      switch (errorCode) {
        case 5001:
          errorMessage = "❌ Tên cấu hình không được để trống";
          break;
        case 5002:
          errorMessage = "❌ Phải chọn ít nhất một linh kiện";
          break;
        case 5003:
          errorMessage = "❌ UUID linh kiện không hợp lệ";
          break;
        case 1006: // Unauthorized (token invalid/expired)
          errorMessage = "⚠️ Phiên đăng nhập hết hạn, vui lòng đăng nhập lại";
          closeSaveBuildModal();
          setTimeout(() => {
            localStorage.removeItem("jwt_token");
            localStorage.removeItem("token");
            window.location.href = "index.html?redirect=build_pc.html";
          }, 2000);
          break;
        default:
          errorMessage = result.message || "❌ Có lỗi xảy ra, vui lòng thử lại";
      }
      
      showToast(
        "Lỗi",
        errorMessage,
        true
      );
    }
  } catch (error) {
    console.error("Save build error:", error);
    showToast(
      "Lỗi kết nối",
      "❌ Không thể kết nối đến server, vui lòng thử lại",
      true
    );
  } finally {
    // Reset button and form state
    saveBtn.disabled = false;
    cancelBtn.disabled = false;
    closeBtn.disabled = false;
    inputEl.disabled = false;
    document.getElementById("build-description").disabled = false;
    saveBtn.innerHTML = originalText;
  }
}


// API Configuration
const API_BASE_URL = "/identity";

// Helper to make API calls
async function apiCall(endpoint, method = "GET", body = null) {
  const headers = { "Content-Type": "application/json" };
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

    if (res.status === 401 || res.status === 403) {
      window.location.href = "index.html";
      return null;
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("API Error:", err);
    return { code: 9999, message: err.message, result: null };
  }
}

// Global State
let userBuilds = [];

function getImageUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  // If the path is relative, assume it's hosted on the same API base
  // and needs to be formatted as /identity/{path}
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

// Initialize Page
document.addEventListener("DOMContentLoaded", () => {
  loadMyBuilds();
  setupModalEvents();
});

async function loadMyBuilds() {
  const gridEl = document.getElementById("builds-grid");
  gridEl.innerHTML =
    '<div class="empty-state">Đang tải danh sách cấu hình...</div>';

  const res = await apiCall("/builds", "GET");

  if (res && res.code === 1000 && res.result) {
    userBuilds = res.result;
    renderBuildsGrid(userBuilds);
  } else {
    gridEl.innerHTML = `
            <div class="empty-state">
                <p style="color: #f56565;">Lỗi khi tải dữ liệu. Vui lòng kiểm tra lại đăng nhập.</p>
                <button class="btn btn-secondary" onclick="window.location.href='index.html'" style="margin-top: 1rem">Quay lại trang chủ</button>
            </div>
        `;
  }
}

function renderBuildsGrid(builds) {
  const gridEl = document.getElementById("builds-grid");
  gridEl.innerHTML = "";

  if (!builds || builds.length === 0) {
    gridEl.innerHTML = `
            <div class="empty-state">
                <p>Bạn chưa lưu cấu hình PC nào.</p>
                <button class="btn btn-primary" onclick="window.location.href='build_pc.html'" style="margin-top: 1rem">+ Xây dựng ngay</button>
            </div>
        `;
    return;
  }

  builds.forEach((build) => {
    const card = document.createElement("div");
    card.className = "build-item-card";
    card.onclick = () => openBuildDetail(build.id);

    card.innerHTML = `
            <h3 class="build-item-name">${build.name}</h3>
            <p class="build-item-desc">${build.description || "Không có mô tả."}</p>
            <div class="build-item-meta">
                <span>📅 ${new Date(build.createdDate || Date.now()).toLocaleDateString("vi-VN")}</span>
            </div>
            <div class="build-item-actions">
                <button class="btn-delete-build" title="Xóa cấu hình" onclick="handleDeleteProxy(event, '${build.id}')">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
            </div>
        `;
    gridEl.appendChild(card);
  });
}

function handleDeleteProxy(event, id) {
  event.stopPropagation();
  if (confirm("Bạn có chắc chắn muốn xóa cấu hình này?")) {
    deleteBuild(id);
  }
}

async function deleteBuild(id) {
  const res = await apiCall(`/builds/${id}`, "DELETE");
  if (res && res.code === 1000) {
    // Optimistic update
    userBuilds = userBuilds.filter((b) => b.id !== id);
    renderBuildsGrid(userBuilds);
  } else {
    alert("Lỗi khi xóa: " + (res ? res.message : "Network error"));
  }
}

async function openBuildDetail(id) {
  const listEl = document.getElementById("modal-parts-list");
  listEl.innerHTML =
    "<p style='text-align:center; padding: 1rem;'>Đang tải chi tiết...</p>";
  document.getElementById("build-detail-modal").classList.add("active");

  const res = await apiCall(`/builds/${id}`, "GET");
  if (res && res.code === 1000 && res.result) {
    const build = res.result;
    document.getElementById("modal-build-name").textContent = build.name;
    document.getElementById("modal-build-desc").textContent =
      build.description || "Không có mô tả.";

    const parts = build.parts || {};

    const componentIcons = {
      cpu: "🖥️",
      mainboard: "🛹",
      ram: "🎛️",
      vga: "🎮",
      gpu: "🎮",
      ssd: "💽",
      hdd: "💿",
      psu: "🔋",
      cooler: "❄️",
      case: "🗄️",
    };

    const categories = {
      cpu: "CPU",
      mainboard: "Mainboard",
      ram: "RAM",
      vga: "VGA",
      gpu: "VGA",
      ssd: "SSD",
      hdd: "HDD",
      psu: "Nguồn",
      cooler: "Tản nhiệt",
      case: "Vỏ Case",
    };

    listEl.innerHTML = "";

    Object.keys(parts).forEach((key) => {
      const normalizedKey = key.toLowerCase();
      const data = parts[key];
      if (!data) return;

      const div = document.createElement("div");
      div.className = "part-item";

      const icon = componentIcons[normalizedKey] || "📦";
      const label = categories[normalizedKey] || normalizedKey.toUpperCase();
      const partName = data.name || "N/A";
      const imageUrl = getImageUrl(data.imageUrl);

      // Tech specs based on component type
      let specsHtml = "";
      if (normalizedKey === "cpu" && data.socket) {
        specsHtml = `<span class="badge" style="background:#edf2f7; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;">Socket: ${data.socket.name || data.socket}</span>`;
      } else if (normalizedKey === "mainboard") {
        const socket = data.socket ? data.socket.name || data.socket : "";
        const size = data.size ? data.size.name || data.size : "";
        specsHtml = `
                    <span class="badge" style="background:#edf2f7; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;">Socket: ${socket}</span>
                    <span class="badge" style="background:#edf2f7; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;">Size: ${size}</span>
                `;
      } else if (normalizedKey === "ram") {
        const type = data.ramType ? data.ramType.name || data.ramType : "";
        const bus = data.ramBus ? `${data.ramBus}MHz` : "";
        specsHtml = `
                    <span class="badge" style="background:#edf2f7; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;">Loại: ${type}</span>
                    <span class="badge" style="background:#edf2f7; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;">Bus: ${bus}</span>
                `;
      } else if (normalizedKey === "vga" || normalizedKey === "gpu") {
        const score = data.score ? `Điểm: ${data.score}` : "";
        specsHtml = `<span class="badge" style="background:#edf2f7; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;">${score}</span>`;
      } else if (normalizedKey === "ssd" || normalizedKey === "hdd") {
        const cap = data.capacity ? `${data.capacity}GB` : "";
        specsHtml = `<span class="badge" style="background:#edf2f7; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;">Dung lượng: ${cap}</span>`;
      } else if (normalizedKey === "psu") {
        const watt = data.wattage ? `${data.wattage}W` : "";
        specsHtml = `<span class="badge" style="background:#edf2f7; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;">CS: ${watt}</span>`;
      }

      div.innerHTML = `
                <div class="part-item-icon" style="width: 56px; height: 56px; min-width: 56px; display: flex; align-items: center; justify-content: center; background: white; border-radius: 6px; overflow: hidden; border: 1px solid var(--border-color);">
                    ${imageUrl ? `<img src="${imageUrl}" alt="${partName}" style="width: 100%; height: 100%; object-fit: contain;">` : icon}
                </div>
                <div class="part-item-info">
                    <div class="part-item-type">${label}</div>
                    <div class="part-item-name" style="margin-bottom: 4px;">${partName}</div>
                    <div class="part-item-specs" style="display: flex; gap: 4px; flex-wrap: wrap;">
                        ${specsHtml}
                    </div>
                </div>
            `;
      listEl.appendChild(div);
    });

    if (listEl.innerHTML === "") {
      listEl.innerHTML =
        "<p style='text-align:center; padding: 1rem; color: #999;'>Không có thông tin linh kiện chi tiết.</p>";
    }
  } else {
    listEl.innerHTML =
      "<p style='text-align:center; padding: 1rem; color: #f56565;'>Lỗi khi tải chi tiết cấu hình.</p>";
  }
}

function setupModalEvents() {
  const closeModal = () => {
    document.getElementById("build-detail-modal").classList.remove("active");
  };

  document
    .getElementById("close-detail-btn")
    .addEventListener("click", closeModal);
  document
    .getElementById("detail-close-btn")
    .addEventListener("click", closeModal);
  document
    .getElementById("build-detail-overlay")
    .addEventListener("click", closeModal);
}

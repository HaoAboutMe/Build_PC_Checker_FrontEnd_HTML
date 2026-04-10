"use client";

import React, { useState } from "react";
import styles from "./build-pc.module.css";
import Header from "@/components/common/Header";
import { useBuildStore } from "@/store/useBuildStore";
import ComponentPicker from "@/components/pc-builder/ComponentPicker";
import { useCompatibility } from "@/hooks/useCompatibility";

const componentsConfig = [
  { id: "cpu", name: "Bộ xử lý (CPU)", api: "/cpus", icon: "fas fa-microchip" },
  { id: "mainboard", name: "Bo mạch chủ (Mainboard)", api: "/mainboards", icon: "fas fa-square" },
  { id: "ram", name: "Bộ nhớ RAM", api: "/rams", icon: "fas fa-memory" },
  { id: "vga", name: "Card đồ họa (VGA)", api: "/vgas", icon: "fas fa-video" },
  { id: "ssd1", name: "Ổ cứng SSD (Slot 1)", api: "/ssds", category: "ssd", icon: "fas fa-hdd" },
  { id: "ssd2", name: "Ổ cứng SSD (Slot 2)", api: "/ssds", category: "ssd", icon: "fas fa-hdd" },
  { id: "hdd1", name: "Ổ cứng HDD (Slot 1)", api: "/hdds", category: "hdd", icon: "fas fa-compact-disc" },
  { id: "hdd2", name: "Ổ cứng HDD (Slot 2)", api: "/hdds", category: "hdd", icon: "fas fa-compact-disc" },
  { id: "psu", name: "Nguồn máy tính (PSU)", api: "/psus", icon: "fas fa-plug" },
  { id: "cooler", name: "Tản nhiệt (Cooler)", api: "/coolers", icon: "fas fa-fan" },
  { id: "case", name: "Vỏ máy tính (Case)", api: "/cases", icon: "fas fa-box" },
];

export default function BuildPCPage() {
  const { currentBuild, setComponent, removeComponent, resetBuild } = useBuildStore();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<any>(null);

  // Real-time compatibility check
  const { data: compatResult, isLoading: isChecking } = useCompatibility(currentBuild);

  const openPicker = (comp: any) => {
    setActiveCategory(comp);
    setPickerOpen(true);
  };

  const handleSelect = (component: any) => {
    const category = activeCategory.category || activeCategory.id;
    setComponent(category, component);
    setPickerOpen(false);
  };

  const getComponentForSlot = (slotId: string) => {
    switch (slotId) {
      case "cpu": return currentBuild.cpu;
      case "mainboard": return currentBuild.mainboard;
      case "ram": return currentBuild.ram;
      case "vga": return currentBuild.vga;
      case "psu": return currentBuild.psu;
      case "cooler": return currentBuild.cooler;
      case "case": return currentBuild.pcCase;
      case "ssd1": return currentBuild.ssds[0];
      case "ssd2": return currentBuild.ssds[1];
      case "hdd1": return currentBuild.hdds[0];
      case "hdd2": return currentBuild.hdds[1];
      default: return null;
    }
  };

  const handleRemove = (slotId: string, componentId: string) => {
    const category = componentsConfig.find(c => c.id === slotId)?.category || slotId;
    removeComponent(category, componentId);
  };

  const partsCount = [
    currentBuild.cpu, 
    currentBuild.mainboard, 
    currentBuild.ram, 
    currentBuild.vga, 
    currentBuild.psu, 
    currentBuild.cooler, 
    currentBuild.pcCase,
    ...currentBuild.ssds,
    ...currentBuild.hdds
  ].filter(Boolean).length;

  const getStatusInfo = () => {
    if (partsCount === 0) return { title: "Bắt đầu lựa chọn", desc: "Hãy chọn linh kiện để bắt đầu kiểm tra tương thích.", type: "neutral", icon: "fas fa-info-circle" };
    if (isChecking) return { title: "Đang kiểm tra...", desc: "Hệ thống đang phân tích tính tương thích...", type: "neutral", icon: "fas fa-circle-notch fa-spin" };
    
    if (compatResult?.errors?.length > 0) return { title: "Không tương thích", desc: "Vui lòng xem các lỗi nghiêm trọng bên dưới", type: "error", icon: "fas fa-times-circle" };
    if (compatResult?.warnings?.length > 0) return { title: "Tương thích (Cảnh báo)", desc: "Các linh kiện khớp nhau nhưng có lưu ý tối ưu", type: "warning", icon: "fas fa-exclamation-triangle" };
    
    return { title: "Tương thích hoàn hảo", desc: "Cấu hình này ổn định và sẵn sàng hoạt động!", type: "success", icon: "fas fa-check-circle" };
  };

  const status = getStatusInfo();

  return (
    <div className={styles.buildWrapper}>
      <Header />
      
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            <h1>Xây Dựng Cấu Hình PC</h1>
            <p>Chọn linh kiện và kiểm tra độ tương thích thời gian thực</p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.btnReset} onClick={resetBuild}>
              <i className="fas fa-redo-alt"></i> Làm mới
            </button>
            <button className={styles.btnSave} disabled={partsCount === 0 || compatResult?.errors?.length > 0}>
              <i className="fas fa-save"></i> Lưu cấu hình
            </button>
          </div>
        </header>

        <div className={styles.buildGrid}>
          {/* Left: Components */}
          <section className={styles.componentsSection}>
            <div className={styles.sectionCard}>
              <div className={styles.cardHeader}>
                <h2><i className="fas fa-list-ul"></i> Danh sách linh kiện</h2>
                <span className={styles.badge}>{partsCount}/{componentsConfig.length} linh kiện</span>
              </div>
              <div className={styles.componentsList}>
                {componentsConfig.map((comp) => {
                  const part = getComponentForSlot(comp.id);
                  return (
                    <div key={comp.id} className={`${styles.componentSlot} ${part ? styles.filled : ""}`}>
                      <div className={styles.iconWrap}>
                        {part?.imageUrl ? (
                          <img src={part.imageUrl} alt={part.name} />
                        ) : (
                          <i className={comp.icon}></i>
                        )}
                      </div>
                      <div className={styles.partInfo}>
                        <div className={styles.categoryLabel}>{comp.name}</div>
                        {part ? (
                          <div className={styles.partName}>{part.name}</div>
                        ) : (
                          <div className={styles.emptyText}>Chưa chọn linh kiện</div>
                        )}
                      </div>
                      <div className={styles.actions}>
                        {part ? (
                          <>
                            <button className={styles.btnSecondaryAction} onClick={() => openPicker(comp)}>Thay đổi</button>
                            <button className={styles.btnRemove} onClick={() => handleRemove(comp.id, part.id)}>
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </>
                        ) : (
                          <button className={styles.btnSelect} onClick={() => openPicker(comp)}>
                            <i className="fas fa-plus"></i> Chọn
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Right: Analysis */}
          <aside className={styles.analysisSection}>
            <div className={`${styles.analysisCard} ${styles.statusCard} ${styles[status.type]}`}>
              <div className={styles.statusIcon}><i className={status.icon}></i></div>
              <div className={styles.statusContent}>
                <h3>{status.title}</h3>
                <p>{status.desc}</p>
              </div>
            </div>

            <div className={`${styles.analysisCard} ${styles.psuCard}`}>
              <div className={styles.psuIcon}><i className="fas fa-bolt"></i></div>
              <div className={styles.psuContent}>
                <div className={styles.psuLabel}>Nguồn khuyến nghị</div>
                <div className={styles.psuValue}>
                  {compatResult?.recommendedPsuWattage ? `${compatResult.recommendedPsuWattage}W` : "0W"}
                </div>
              </div>
            </div>

            {/* Issues List */}
            {(compatResult?.errors?.length > 0 || compatResult?.warnings?.length > 0) && (
              <div className={styles.issuesContainer}>
                {compatResult.errors?.length > 0 && (
                  <div className={`${styles.issueBox} ${styles.error}`}>
                    <h4><i className="fas fa-exclamation-triangle"></i> Lỗi nghiêm trọng</h4>
                    <ul>
                      {compatResult.errors.map((err: string, i: number) => <li key={i}>{err}</li>)}
                    </ul>
                  </div>
                )}
                {compatResult.warnings?.length > 0 && (
                  <div className={`${styles.issueBox} ${styles.warning}`}>
                    <h4><i className="fas fa-exclamation-circle"></i> Cảnh báo tối ưu</h4>
                    <ul>
                      {compatResult.warnings.map((warn: string, i: number) => <li key={i}>{warn}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* In a real app, Bottleneck Analysis would be here */}
            {/* ... */}
          </aside>
        </div>
      </main>

      {pickerOpen && activeCategory && (
        <ComponentPicker
          category={activeCategory}
          onClose={() => setPickerOpen(false)}
          onSelect={handleSelect}
        />
      )}
    </div>
  );
}

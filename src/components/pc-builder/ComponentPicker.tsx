"use client";

import React, { useState, useMemo } from "react";
import styles from "./ComponentPicker.module.css";
import { useQuery } from "@tanstack/react-query";
import { componentService } from "@/services/componentService";
import { PCComponent } from "@/types/pcBuilder";
import ComponentDetail from "./ComponentDetail";

interface ComponentPickerProps {
  category: {
    id: string;
    name: string;
    api: string;
    category?: string;
  };
  onClose: () => void;
  onSelect: (component: PCComponent) => void;
}

const ITEMS_PER_PAGE = 12;

export default function ComponentPicker({ category, onClose, onSelect }: ComponentPickerProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<PCComponent | null>(null);

  const { data: items, isLoading } = useQuery({
    queryKey: ["components", category.api],
    queryFn: () => componentService.getComponents(category.api),
  });

  const filteredItems = useMemo(() => {
    if (!items) return [];
    return items.filter((item: PCComponent) => 
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const pagedItems = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, page]);

  // Handle click outside to close
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (selectedItem) {
    return (
      <div className={styles.modalOverlay} onClick={handleOverlayClick}>
        <div className={`${styles.modalContent} ${styles.modalLg}`}>
          <div className={styles.modalHeader}>
            <button className={styles.btnBack} onClick={() => setSelectedItem(null)}>
              <i className="fas fa-arrow-left"></i> Quay lại
            </button>
            <h3>Chi tiết linh kiện</h3>
            <button className={styles.btnClose} onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className={styles.detailContainer}>
            <ComponentDetail 
              item={selectedItem} 
              categoryName={category.name}
              onSelect={() => onSelect(selectedItem)}
              onBack={() => setSelectedItem(null)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>Chọn {category.name}</h3>
          <button className={styles.btnClose} onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className={styles.searchArea}>
          <div className={styles.searchWrapper}>
            <i className={`fas fa-search ${styles.searchIcon}`}></i>
            <input 
              type="text" 
              className={styles.searchInput}
              placeholder="Tìm kiếm linh kiện..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div className={styles.itemsGrid}>
          {isLoading ? (
            <div className={styles.loadingWrapper}>
              <i className={`fas fa-circle-notch ${styles.spinner}`}></i>
              <p>Đang tải danh sách linh kiện...</p>
            </div>
          ) : pagedItems.length > 0 ? (
            pagedItems.map((item: PCComponent) => (
              <div 
                key={item.id} 
                className={styles.partCard}
                onClick={() => setSelectedItem(item)}
              >
                <img 
                  src={item.imageUrl || "https://via.placeholder.com/150?text=Linh+Kien"} 
                  alt={item.name} 
                  className={styles.cardImg}
                />
                <div className={styles.cardTitle} title={item.name}>{item.name}</div>
                <div className={styles.cardActions}>
                   <button className={styles.btnCardSelect} onClick={(e) => {
                     e.stopPropagation();
                     onSelect(item);
                   }}>Chọn</button>
                   <button className={styles.btnCardDetail} onClick={(e) => {
                     e.stopPropagation();
                     setSelectedItem(item);
                   }}>Chi tiết</button>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.loadingWrapper}>
              <p>Không tìm thấy linh kiện nào.</p>
            </div>
          )}
        </div>

        <div className={styles.pagination}>
          <button 
            className={styles.paginationBtn}
            disabled={page <= 1}
            onClick={() => setPage(pIndex => pIndex - 1)}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <span className={styles.pageInfo}>Trang {page} / {totalPages}</span>
          <button 
            className={styles.paginationBtn}
            disabled={page >= totalPages}
            onClick={() => setPage(pIndex => pIndex + 1)}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

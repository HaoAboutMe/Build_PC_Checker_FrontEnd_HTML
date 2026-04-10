"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./not-found.module.css";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className={styles.notFoundContainer}>
      <div className={styles.content}>
        <div className={styles.visualArea}>
          <div className={styles.big404}>404</div>
          
          <div className={styles.pcIconContainer}>
            <i className={`fas fa-desktop ${styles.mainIcon}`}></i>
          </div>
          
          <div className={`${styles.floatingElement} ${styles.part1}`}>
            <i className="fas fa-microchip" style={{ color: "#0059bb", fontSize: "24px" }}></i>
          </div>
          <div className={`${styles.floatingElement} ${styles.part2}`}>
            <i className="fas fa-memory" style={{ color: "#16a34a", fontSize: "20px" }}></i>
          </div>
          <div className={`${styles.floatingElement} ${styles.part3}`}>
            <i className="fas fa-fan" style={{ color: "#ef4444", fontSize: "22px" }}></i>
          </div>
          <div className={`${styles.floatingElement} ${styles.part4}`}>
            <i className="fas fa-bolt" style={{ color: "#eab308", fontSize: "24px" }}></i>
          </div>
        </div>
        
        <div className={styles.textSection}>
          <h1 className={styles.title}>Lỗi hệ thống: 404</h1>
          <p className={styles.description}>
            Linh kiện này chưa được lắp đặt hoặc đã bị gỡ khỏi hệ thống. Vui lòng kiểm tra lại cấu hình đường dẫn.
          </p>
        </div>
        
        <div className={styles.buttonGroup}>
          <Link href="/" className={styles.primaryBtn}>
            <i className="fas fa-home"></i> Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

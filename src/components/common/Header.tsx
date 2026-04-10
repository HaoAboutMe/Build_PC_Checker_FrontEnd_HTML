"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./Header.module.css";
import { useAuthStore } from "@/store/authStore";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, fetchMe, clearAuth, isLoading } = useAuthStore();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If we think we're authenticated but have no user data, fetch it
    if (isAuthenticated && !user && !isLoading) {
      fetchMe();
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAuthenticated, user, isLoading, fetchMe]);

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/login";
  };

  const initials = user ? (user.firstname || user.username).substring(0, 2).toUpperCase() : (isAuthenticated ? ".." : "?");

  return (
    <header className={styles.mainHeader}>
      <div className={`container ${styles.headerContent}`}>
        <div className={styles.logo}>
          <Link href="/">
            <h1 className={styles.logoText}>Build PC Support</h1>
          </Link>
        </div>

        <div className={styles.searchBarContainer}>
          <div className={styles.searchInputWrapper}>
            <svg
              className={styles.searchIcon}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="text" placeholder="Tìm kiếm linh kiện..." />
          </div>
        </div>

        <div className={styles.navActions}>
          <div className={styles.userProfileMenu} ref={menuRef}>
            <div
              className={styles.userInfoTrigger}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className={styles.userAvatarMini}>{initials}</div>
              <div className={styles.userDetailsText}>
                <span className={styles.userName}>
                  {user ? user.username : (isAuthenticated ? "Đang tải..." : "Khách")}
                </span>
                <span className={styles.userEmail}>
                  {user ? user.email : (isAuthenticated ? "Đang đồng bộ..." : "Mời đăng nhập")}
                </span>
              </div>
              <svg
                className={`${styles.dropdownArrow} ${isMenuOpen ? styles.arrowRotate : ""}`}
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>

            <div className={`${styles.dropdownMenu} ${isMenuOpen ? styles.active : ""}`}>
              {isAuthenticated && user ? (
                <>
                  <Link href="/my-builds" className={styles.dropdownItem} onClick={() => setIsMenuOpen(false)}>
                    <i className="fas fa-save" style={{ marginRight: 14, width: 16, textAlign: "center" }}></i>
                    Cấu hình đã lưu
                  </Link>
                  <Link href="/profile" className={styles.dropdownItem} onClick={() => setIsMenuOpen(false)}>
                    <i className="fas fa-user" style={{ marginRight: 14, width: 16, textAlign: "center" }}></i>
                    Thông tin cá nhân
                  </Link>
                  <Link href="/profile?action=edit" className={styles.dropdownItem} onClick={() => setIsMenuOpen(false)}>
                    <i className="fas fa-edit" style={{ marginRight: 14, width: 16, textAlign: "center" }}></i>
                    Chỉnh sửa thông tin
                  </Link>
                  <Link href="/profile?action=password" className={styles.dropdownItem} onClick={() => setIsMenuOpen(false)}>
                    <i className="fas fa-key" style={{ marginRight: 14, width: 16, textAlign: "center" }}></i>
                    Đổi mật khẩu
                  </Link>
                  <hr className={styles.divider} />
                  <button onClick={handleLogout} className={`${styles.dropdownItem} ${styles.logoutBtn}`}>
                    <i className="fas fa-sign-out-alt" style={{ marginRight: 14, width: 16, textAlign: "center" }}></i>
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className={styles.dropdownItem} onClick={() => setIsMenuOpen(false)}>
                    <i className="fas fa-sign-in-alt" style={{ marginRight: 14, width: 16, textAlign: "center" }}></i>
                    Đăng nhập
                  </Link>
                  <Link href="/register" className={styles.dropdownItem} onClick={() => setIsMenuOpen(false)}>
                    <i className="fas fa-user-plus" style={{ marginRight: 14, width: 16, textAlign: "center" }}></i>
                    Tạo tài khoản
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

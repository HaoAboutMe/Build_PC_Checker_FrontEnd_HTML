"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import * as z from "zod";
import styles from "./profile.module.css";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { useAuthStore } from "@/store/authStore";
import apiClient from "@/services/api";

const updateInfoSchema = z.object({
  username: z.string().min(3, "Tên người dùng quá ngắn"),
  firstname: z.string().min(1, "Họ không được để trống"),
  lastname: z.string().min(1, "Tên không được để trống"),
  dateOfBirth: z.string().min(1, "Ngày sinh không được để trống"),
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
  newPassword: z.string().min(8, "Mật khẩu mới phải từ 8 ký tự"),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type UpdateInfoData = z.infer<typeof updateInfoSchema>;
type ChangePasswordData = z.infer<typeof changePasswordSchema>;

const ProfileContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, fetchMe, isLoading: isAuthLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState("info");
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "edit") setActiveTab("edit");
    else if (action === "password") setActiveTab("password");
    else setActiveTab("info");
    
    fetchMe();
  }, [searchParams, fetchMe]);

  const infoForm = useForm<UpdateInfoData>({
    resolver: zodResolver(updateInfoSchema),
  });

  const passwordForm = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
  });

  useEffect(() => {
    if (user) {
      infoForm.reset({
        username: user.username,
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        dateOfBirth: user.dateOfBirth || "2000-01-01",
      });
    }
  }, [user, infoForm]);

  const onUpdateInfo = async (data: UpdateInfoData) => {
    setIsUpdating(true);
    try {
      await apiClient.put(`/users/me`, data);
      await fetchMe();
      toast.success("Cập nhật thông tin thành công!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setIsUpdating(false);
    }
  };

  const onChangePassword = async (data: ChangePasswordData) => {
    setIsUpdating(true);
    try {
      await apiClient.put("/users/me/change-password", {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      passwordForm.reset();
      toast.success("Đổi mật khẩu thành công!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Đổi mật khẩu thất bại");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isAuthLoading && !user) return <div className="p-20 text-center">Đang tải...</div>;
  if (!user) {
    if (typeof window !== "undefined") router.push("/login");
    return null;
  }

  const initials = (user.firstname || user.username).substring(0, 2).toUpperCase();

  return (
    <div className={styles.profilePage}>
      <Header />
      <main className={`container ${styles.mainContainer}`}>
        <div className={styles.profileLayout}>
          <aside className={styles.profileSidebar}>
            <div className={styles.profileCard}>
              <div className={styles.profileAvatar}>{initials}</div>
              <h2>{user.firstname} {user.lastname}</h2>
              <p>{user.email}</p>
            </div>

            <nav className={styles.sideNav}>
              <button 
                className={`${styles.navBtn} ${activeTab === "info" ? styles.navBtnActive : ""}`}
                onClick={() => setActiveTab("info")}
              >
                <i className="fas fa-user-circle"></i> Thông tin chung
              </button>
              <button 
                className={`${styles.navBtn} ${activeTab === "edit" ? styles.navBtnActive : ""}`}
                onClick={() => setActiveTab("edit")}
              >
                <i className="fas fa-user-edit"></i> Cập nhật thông tin
              </button>
              <button 
                className={`${styles.navBtn} ${activeTab === "password" ? styles.navBtnActive : ""}`}
                onClick={() => setActiveTab("password")}
              >
                <i className="fas fa-key"></i> Đổi mật khẩu
              </button>
              <button 
                className={styles.navBtn}
                onClick={() => router.push("/my-builds")}
              >
                <i className="fas fa-save"></i> Cấu hình đã lưu
              </button>
            </nav>
          </aside>

          <div className={styles.profileContent}>

            {activeTab === "info" && (
              <section className={styles.sectionCard}>
                <h3 className={styles.cardTitle}>Hồ sơ của bạn</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoGroup}>
                    <label>Tên đăng nhập</label>
                    <p>{user.username}</p>
                  </div>
                  <div className={styles.infoGroup}>
                    <label>Email</label>
                    <p>{user.email}</p>
                  </div>
                  <div className={styles.infoGroup}>
                    <label>Họ</label>
                    <p>{user.firstname || "N/A"}</p>
                  </div>
                  <div className={styles.infoGroup}>
                    <label>Tên</label>
                    <p>{user.lastname || "N/A"}</p>
                  </div>
                  <div className={styles.infoGroup}>
                    <label>Ngày sinh</label>
                    <p>{user.dateOfBirth || "N/A"}</p>
                  </div>
                  <div className={styles.infoGroup}>
                    <label>Vai trò</label>
                    <p>{user.roles?.join(", ") || "User"}</p>
                  </div>
                </div>

                {user.roles?.includes("ADMIN") && (
                  <div className={styles.adminEntryCard}>
                    <div className={styles.adminEntryContent}>
                      <div className={styles.adminEntryText}>
                        <h4>Bảng điều khiển quản trị</h4>
                        <p>Bạn có quyền quản lý toàn bộ hệ thống linh kiện và người dùng.</p>
                      </div>
                      <Link href="/admin" className={styles.adminActionBtn}>
                        <i className="fas fa-shield-alt"></i> Truy cập Admin Panel
                      </Link>
                    </div>
                  </div>
                )}
              </section>
            )}

            {activeTab === "edit" && (
              <section className={styles.sectionCard}>
                <h3 className={styles.cardTitle}>Chỉnh sửa thông tin</h3>
                <form onSubmit={infoForm.handleSubmit(onUpdateInfo)} className={styles.profileForm}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Tên đăng nhập</label>
                      <input type="text" {...infoForm.register("username")} />
                      {infoForm.formState.errors.username && <span className={styles.errorMessage}>{infoForm.formState.errors.username.message}</span>}
                    </div>
                    <div className={styles.formGroup}>
                      <label>Ngày sinh</label>
                      <input type="date" {...infoForm.register("dateOfBirth")} />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Họ</label>
                      <input type="text" {...infoForm.register("firstname")} />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Tên</label>
                      <input type="text" {...infoForm.register("lastname")} />
                    </div>
                  </div>
                  <button type="submit" className={styles.saveBtn} disabled={isUpdating}>
                    {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </form>
              </section>
            )}

            {activeTab === "password" && (
              <section className={styles.sectionCard}>
                <h3 className={styles.cardTitle}>Đổi mật khẩu</h3>
                <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className={styles.profileForm}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Mật khẩu hiện tại</label>
                      <div className={styles.inputContainer}>
                        <input 
                          type={showOldPassword ? "text" : "password"} 
                          {...passwordForm.register("oldPassword")} 
                          placeholder="••••••••" 
                        />
                        <button 
                          type="button" 
                          className={styles.passwordToggle}
                          onClick={() => setShowOldPassword(!showOldPassword)}
                        >
                          <i className={showOldPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                        </button>
                      </div>
                      {passwordForm.formState.errors.oldPassword && <span className={styles.errorMessage}>{passwordForm.formState.errors.oldPassword.message}</span>}
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Mật khẩu mới</label>
                      <div className={styles.inputContainer}>
                        <input 
                          type={showNewPassword ? "text" : "password"} 
                          {...passwordForm.register("newPassword")} 
                          placeholder="••••••••" 
                        />
                        <button 
                          type="button" 
                          className={styles.passwordToggle}
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          <i className={showNewPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                        </button>
                      </div>
                      {passwordForm.formState.errors.newPassword && <span className={styles.errorMessage}>{passwordForm.formState.errors.newPassword.message}</span>}
                    </div>
                    <div className={styles.formGroup}>
                      <label>Xác nhận mật khẩu mới</label>
                      <div className={styles.inputContainer}>
                        <input 
                          type={showConfirmPassword ? "text" : "password"} 
                          {...passwordForm.register("confirmPassword")} 
                          placeholder="••••••••" 
                        />
                        <button 
                          type="button" 
                          className={styles.passwordToggle}
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          <i className={showConfirmPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                        </button>
                      </div>
                      {passwordForm.formState.errors.confirmPassword && <span className={styles.errorMessage}>{passwordForm.formState.errors.confirmPassword.message}</span>}
                    </div>
                  </div>
                  <button type="submit" className={styles.saveBtn} disabled={isUpdating}>
                    {isUpdating ? "Cập nhật mật khẩu" : "Cập nhật mật khẩu"}
                  </button>
                </form>
              </section>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const ProfilePage = () => {
  return (
    <Suspense fallback={<div className="p-20 text-center">Đang tải...</div>}>
      <ProfileContent />
    </Suspense>
  );
};

export default ProfilePage;

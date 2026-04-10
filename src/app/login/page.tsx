"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import apiClient from "@/services/api";
import { useAuthStore } from "@/store/authStore";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
  remember: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      remember: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setServerError("");
    try {
      const response = await apiClient.post("/auth/token", {
        email: data.email,
        password: data.password,
      });

      if (response.data.code === 1000) {
        const { token, user } = response.data.result;
        setAuth(user || { email: data.email, username: data.email.split('@')[0] }, token);
        router.push("/");
      } else {
        setServerError(response.data.message || "Đăng nhập thất bại");
      }
    } catch (error: any) {
      console.error("Login bug:", error);
      setServerError(error.response?.data?.message || "Lỗi máy chủ. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.registerPage}>
      <Header />
      <main className={styles.mainContent}>
        <div className={styles.authCard}>
          {/* Left Panel */}
          <div className={styles.leftPanel}>
            <div className={styles.leftContent}>
              <h2>Custom PC Support <br />for Everyone.</h2>
              <p>Bắt đầu hành trình của bạn với Build PC Support.<br />Giải pháp tối ưu cho dàn máy tính mơ ước của bạn.</p>
            </div>
            <div className={styles.userStats}>
              <div className={styles.avatarGroup}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className={styles.avatar}>
                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" />
                  </div>
                ))}
              </div>
              <p className={styles.statsText}>Gia nhập cùng 50,000+ chuyên gia toàn cầu.</p>
            </div>
          </div>

          {/* Right Panel */}
          <div className={styles.rightPanel}>
            <nav className={styles.authNav}>
              <span className={`${styles.navLink} ${styles.navLinkActive}`}>Đăng nhập</span>
              <Link href="/register" className={styles.navLink}>Đăng ký</Link>
            </nav>

            <div className={styles.formHeader}>
              <h1>Mừng bạn quay trở lại</h1>
              <p>Chào mừng bạn! Vui lòng nhập thông tin đăng nhập.</p>
            </div>

            {serverError && <div className={styles.errorMessage} style={{ marginBottom: 16 }}>{serverError}</div>}

            <form onSubmit={handleSubmit(onSubmit)} className={styles.registerForm}>
              <div className={styles.formGroup}>
                <label>Email</label>
                <div className={styles.inputContainer}>
                  <i className="fas fa-envelope"></i>
                  <input 
                    type="email" 
                    placeholder="example@stitch.com" 
                    {...register("email")}
                  />
                </div>
                {errors.email && <span className={styles.errorMessage}>{errors.email.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label>Mật khẩu</label>
                  <Link href="/forgot-password" style={{ fontSize: 11, color: "#0059bb", marginLeft: "auto" }}>
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className={styles.inputContainer}>
                  <i className="fas fa-lock"></i>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    {...register("password")}
                  />
                  <button 
                    type="button" 
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                  </button>
                </div>
                {errors.password && <span className={styles.errorMessage}>{errors.password.message}</span>}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" id="remember" {...register("remember")} />
                <label htmlFor="remember" style={{ fontSize: 12, color: "#414754", cursor: "pointer" }}>Ghi nhớ đăng nhập</label>
              </div>

              <button type="submit" className={styles.registerBtn} disabled={isLoading}>
                {isLoading ? "Đang xử lý..." : "Đăng nhập"}
              </button>
            </form>

            <div className={styles.authSwitch}>
              Chưa có tài khoản? <Link href="/register">Đăng ký ngay</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;

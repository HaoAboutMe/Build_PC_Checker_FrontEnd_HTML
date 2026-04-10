"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./register.module.css";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import apiClient from "@/services/api";

const registerSchema = z.object({
  firstname: z.string().min(1, "Họ không được để trống"),
  lastname: z.string().min(1, "Tên không được để trống"),
  username: z.string().min(3, "Tên người dùng phải có ít nhất 3 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  dateOfBirth: z.string().min(1, "Ngày sinh không được để trống"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setServerError("");
    try {
      const response = await apiClient.post("/users", data);
      
      if (response.data.code === 1000) {
        router.push("/login?registered=true");
      } else {
        setServerError(response.data.message || "Đăng ký thất bại");
      }
    } catch (error: any) {
      console.error("Register bug:", error);
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
              <h2>Hỗ trợ xây dựng cấu hình máy tính dành cho mọi người.</h2>
              <p>Bắt đầu hành trình của bạn với Build PC Support.<br />Giải pháp tối ưu cho dàn máy tính mơ ước của bạn.</p>
            </div>
            <div className={styles.userStats}>
              <div className={styles.avatarGroup}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className={styles.avatar}>
                    <img src={`https://i.pravatar.cc/100?u=${i + 10}`} alt="User" />
                  </div>
                ))}
              </div>
              <p className={styles.statsText}>Gia nhập cùng 50,000+ chuyên gia toàn cầu.</p>
            </div>
          </div>

          {/* Right Panel */}
          <div className={styles.rightPanel}>
            <nav className={styles.authNav}>
              <Link href="/login" className={styles.navLink}>Đăng nhập</Link>
              <span className={`${styles.navLink} ${styles.navLinkActive}`}>Đăng ký</span>
            </nav>

            <div className={styles.formHeader}>
              <h1>Đăng ký tài khoản mới</h1>
              <p>Vui lòng điền thông tin để bắt đầu sử dụng dịch vụ.</p>
            </div>

            {serverError && <div className={styles.errorMessage} style={{ marginBottom: 16 }}>{serverError}</div>}

            <form onSubmit={handleSubmit(onSubmit)} className={styles.registerForm}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className={styles.formGroup}>
                  <label>Họ</label>
                  <div className={styles.inputContainer}>
                    <i className="fas fa-user-tag"></i>
                    <input type="text" placeholder="Nguyễn" {...register("firstname")} />
                  </div>
                  {errors.firstname && <span className={styles.errorMessage}>{errors.firstname.message}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label>Tên</label>
                  <div className={styles.inputContainer}>
                    <i className="fas fa-user-tag"></i>
                    <input type="text" placeholder="An" {...register("lastname")} />
                  </div>
                  {errors.lastname && <span className={styles.errorMessage}>{errors.lastname.message}</span>}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Tên người dùng</label>
                <div className={styles.inputContainer}>
                  <i className="fas fa-user"></i>
                  <input type="text" placeholder="an.nguyen88" {...register("username")} />
                </div>
                {errors.username && <span className={styles.errorMessage}>{errors.username.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>Email</label>
                <div className={styles.inputContainer}>
                  <i className="fas fa-envelope"></i>
                  <input type="email" placeholder="example@stitch.com" {...register("email")} />
                </div>
                {errors.email && <span className={styles.errorMessage}>{errors.email.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>Mật khẩu</label>
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

              <div className={styles.formGroup}>
                <label>Ngày sinh</label>
                <div className={styles.inputContainer}>
                  <input type="date" {...register("dateOfBirth")} />
                </div>
                {errors.dateOfBirth && <span className={styles.errorMessage}>{errors.dateOfBirth.message}</span>}
              </div>

              <button type="submit" className={styles.registerBtn} disabled={isLoading}>
                {isLoading ? "Đang xử lý..." : "Đăng ký"}
              </button>
            </form>

            <div className={styles.authSwitch}>
              Đã có tài khoản? <Link href="/login">Đăng nhập ngay</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RegisterPage;

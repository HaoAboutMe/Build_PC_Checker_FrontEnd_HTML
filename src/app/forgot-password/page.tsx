"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import styles from "./forgot-password.module.css";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import apiClient from "@/services/api";

const requestOtpSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

const resetPasswordSchema = z.object({
  otp: z.string().min(1, "Vui lòng nhập mã OTP"),
  newPassword: z.string().min(6, "Mật khẩu mới phải từ 6 ký tự"),
});

type RequestOtpData = z.infer<typeof requestOtpSchema>;
type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const requestForm = useForm<RequestOtpData>({
    resolver: zodResolver(requestOtpSchema),
  });

  const resetForm = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onRequestOtp = async (data: RequestOtpData) => {
    setIsLoading(true);
    setMessage({ type: "", text: "" });
    try {
      await apiClient.post("/auth/forgot-password", { email: data.email });
      setEmail(data.email);
      setStep(2);
      setMessage({ type: "success", text: "Mã OTP đã được gửi đến email của bạn." });
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "Gửi yêu cầu thất bại" });
    } finally {
      setIsLoading(false);
    }
  };

  const onResetPassword = async (data: ResetPasswordData) => {
    setIsLoading(true);
    setMessage({ type: "", text: "" });
    try {
      await apiClient.post("/auth/reset-password", {
        email,
        otp: data.otp,
        newPassword: data.newPassword,
      });
      setMessage({ type: "success", text: "Đổi mật khẩu thành công! Bạn có thể đăng nhập ngay." });
      setStep(3); // Completion step
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "Đổi mật khẩu thất bại" });
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
              <h2>Khôi phục mật khẩu <br />nhanh chóng.</h2>
              <p>Chúng tôi sẽ giúp bạn lấy lại quyền truy cập vào tài khoản Build PC Support của mình.</p>
            </div>
          </div>

          {/* Right Panel */}
          <div className={styles.rightPanel}>
            <nav className={styles.authNav}>
              <Link href="/login" className={styles.navLink}>Quay lại đăng nhập</Link>
            </nav>

            {message.text && (
              <div style={{ 
                padding: '12px 16px', 
                borderRadius: 8, 
                backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
                color: message.type === 'success' ? '#059669' : '#dc2626',
                border: `1px solid ${message.type === 'success' ? '#10b981' : '#f87171'}`,
                fontSize: 14,
                marginBottom: 24
              }}>
                {message.text}
              </div>
            )}

            {step === 1 && (
              <div id="step-request-otp">
                <div className={styles.formHeader}>
                  <h1>Quên mật khẩu?</h1>
                  <p>Nhập email của bạn để nhận mã xác thực OTP.</p>
                </div>
                <form onSubmit={requestForm.handleSubmit(onRequestOtp)} className={styles.registerForm}>
                  <div className={styles.formGroup}>
                    <label>Email</label>
                    <div className={styles.inputContainer}>
                      <i className="fas fa-envelope"></i>
                      <input type="email" placeholder="example@buildpc.com" {...requestForm.register("email")} />
                    </div>
                    {requestForm.formState.errors.email && <span className={styles.errorMessage}>{requestForm.formState.errors.email.message}</span>}
                  </div>
                  <button type="submit" className={styles.registerBtn} disabled={isLoading}>
                    {isLoading ? "Đang gửi..." : "Gửi mã OTP"}
                  </button>
                </form>
              </div>
            )}

            {step === 2 && (
              <div id="step-reset-password">
                <div className={styles.formHeader}>
                  <h1>Đặt lại mật khẩu</h1>
                  <p>Vui lòng nhập mã OTP và mật khẩu mới.</p>
                </div>
                <form onSubmit={resetForm.handleSubmit(onResetPassword)} className={styles.registerForm}>
                  <div className={styles.formGroup}>
                    <label>Mã xác thực OTP</label>
                    <div className={styles.inputContainer}>
                      <i className="fas fa-key"></i>
                      <input type="text" placeholder="Nhập mã OTP" {...resetForm.register("otp")} />
                    </div>
                    {resetForm.formState.errors.otp && <span className={styles.errorMessage}>{resetForm.formState.errors.otp.message}</span>}
                  </div>
                  <div className={styles.formGroup}>
                    <label>Mật khẩu mới</label>
                    <div className={styles.inputContainer}>
                      <i className="fas fa-lock"></i>
                      <input type="password" placeholder="••••••••" {...resetForm.register("newPassword")} />
                    </div>
                    {resetForm.formState.errors.newPassword && <span className={styles.errorMessage}>{resetForm.formState.errors.newPassword.message}</span>}
                  </div>
                  <button type="submit" className={styles.registerBtn} disabled={isLoading}>
                    {isLoading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                  </button>
                </form>
              </div>
            )}

            {step === 3 && (
              <div className={styles.formHeader} style={{ textAlign: "center" }}>
                <i className="fas fa-check-circle" style={{ fontSize: 48, color: "#10b981", marginBottom: 16 }}></i>
                <h1>Thành công</h1>
                <p>Mật khẩu của bạn đã được cập nhật.</p>
                <Link href="/login" className={styles.registerBtn} style={{ marginTop: 24, display: "inline-block", textAlign: "center", width: "100%" }}>
                  Đăng nhập ngay
                </Link>
              </div>
            )}

            <div className={styles.authSwitch}>
              Bạn đã nhớ mật khẩu? <Link href="/login">Đăng nhập ngay</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;

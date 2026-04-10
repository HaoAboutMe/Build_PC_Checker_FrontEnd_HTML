import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import { Toaster } from "react-hot-toast";

import Providers from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Build PC Support - Tự thiết kế PC mơ ước",
  description: "Công cụ thông minh giúp bạn tự xây dựng dàn máy tối ưu, kiểm tra tương thích và dự báo hiệu năng.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
        />
      </head>
      <body className={inter.className}>
        <div className="bg-blur-1"></div>
        <div className="bg-blur-2"></div>
        <Providers>
          <AuthProvider>
            <Toaster position="top-right" reverseOrder={false} />
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}

import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className={styles.homePage}>
      <Header />
      
      <main className={`container ${styles.mainContainer}`}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>Tính năng mới / Hot</div>
            <h2 className={styles.heroTitle}>Tự thiết kế PC - Build cấu hình mơ ước</h2>
            <p className={styles.heroDescription}>
              Công cụ thông minh giúp bạn tự xây dựng dàn máy tối ưu. 
              <strong> Kiểm tra tương thích socket, khe cắm RAM, công suất nguồn và độ ổn định thực tế ngay lập tức.</strong>
            </p>
            <div className={styles.heroFeatures}>
              <span><i className="fas fa-check-circle"></i> Hỗ trợ mọi CPU Intel/AMD</span>
              <span><i className="fas fa-check-circle"></i> Cảnh báo nghẽn cổ chai (Bottleneck)</span>
              <span><i className="fas fa-check-circle"></i> Dự báo FPS Game thực tế</span>
            </div>
            <div className={styles.heroCtaGroup}>
              <p className={styles.ctaNote}>Sử dụng ngay để xem các linh kiện có tương thích với nhau hay không, cùng những lưu ý quan trọng về bộ nhớ và hiệu năng của cấu hình bạn chọn!</p>
              <Link href="/build-pc" className={styles.heroBtnPrimary}>
                Bắt đầu Xây dựng PC ngay
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </Link>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.visualGlow}></div>
            <Image 
              src="/images/builld_image.png" 
              alt="PC Builder Preview" 
              width={500} 
              height={400} 
              className={styles.heroImg}
              priority
            />
          </div>
        </section>

        {/* Components Grid */}
        <section className={styles.componentsGridSection}>
          <h2 className={styles.sectionTitle}>Khám phá linh kiện</h2>
          <div className={styles.componentsGrid}>
            {[
              { id: "cpu", name: "CPU", sub: "Bộ vi xử lý", img: "/images/CPU_image.jpg" },
              { id: "mainboard", name: "MAINBOARD", sub: "Bo mạch chủ", img: "/images/Main_image.jpg" },
              { id: "ram", name: "RAM", sub: "Bộ nhớ trong", img: "/images/ram_image.jpg" },
              { id: "vga", name: "VGA", sub: "Card đồ họa", img: "/images/vga_image.jpg" },
              { id: "ssd", name: "SSD", sub: "Ổ cứng thể rắn", img: "/images/ssd_image.jpg" },
              { id: "hdd", name: "HDD", sub: "Ổ cứng cơ học", img: "/images/hdd_image.jpg" },
              { id: "psu", name: "PSU", sub: "Nguồn máy tính", img: "/images/psu_image.png" },
              { id: "case", name: "CASE", sub: "Vỏ máy tính", img: "/images/case_image.jpg" },
              { id: "cooler", name: "COOLER", sub: "Tản nhiệt PC", img: "/images/Cooler_image.jpeg" },
            ].map((cat) => (
              <div key={cat.id} className={styles.categoryCard}>
                <div className={styles.catIconContainer}>
                  <Image src={cat.img} alt={cat.name} fill style={{ objectFit: 'cover' }} />
                </div>
                <h3>{cat.name}</h3>
                <p>{cat.sub}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

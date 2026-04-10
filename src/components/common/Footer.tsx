import React from "react";
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerContainer}>
          <p>© 2026 Build PC Support. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

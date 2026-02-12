import React from 'react';
import styles from './styles.module.css';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function CustomFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>

        {/* Footer Wrapper */}
        <div className={styles.footerContainer}>

          {/* Column 1 - Logo */}
          <div className={styles.logoSection}>
            <img
              src={useBaseUrl('img/footerLogo.svg')}
              alt="Paysecure Logo"
              className={styles.logo}
            />
          </div>

          {/* Column 2 - Quick Links */}
          <div className={`${styles.linksSection} ${styles.alignRight}`}>
            <h4 className={styles.quickLinksTitle}>Quick Links</h4>
            <ul>
              <li><Link to="/">Merchant Docs</Link></li>
              <li><Link to="/docs/overview">Alternative Payment Methods (APM)</Link></li>
              <li><Link to="/">Set-up & optimize APMs</Link></li>
            </ul>
          </div>

          {/* Column 3 - Contact */}
          <div className={styles.contactSection}>
            <h4 className={styles.contactTitle}>Contact Us</h4>
            <p><a href="mailto:info@paysecure.net">info@paysecure.net</a></p>
            <p><a href="mailto:sales@paysecure.net">sales@paysecure.net</a></p>
          </div>
        </div>

      </div>

      <div className={styles.copyright}>
        Copyright © {new Date().getFullYear()} Paysecure, Inc.
      </div>
    </footer>
  );
}

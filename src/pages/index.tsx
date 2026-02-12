import { useEffect, useState, type ReactNode } from 'react';
import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';
import type { ComponentProps } from 'react';
import OriginalLink from '@docusaurus/Link';
import OriginalHeading from '@theme/Heading';
import OriginalLayout from '@theme/Layout';
import ChatbotModal from '../components/ChatbotModal';

const Layout = OriginalLayout as (props: ComponentProps<'div'> & {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}) => JSX.Element;


const Heading = OriginalHeading as (props: ComponentProps<'h1'> & { as: keyof JSX.IntrinsicElements }) => JSX.Element;
const Link = OriginalLink as (props: ComponentProps<'a'> & { to: string }) => JSX.Element;


function HomepageHeader() {
  // const SearchBar = (require('@theme/SearchBar') as any).default || require('@theme/SearchBar');
  const { siteConfig } = useDocusaurusContext();
  return (
    <header
      className={clsx('hero hero--primary', styles.heroBanner)}
      style={{
        position: 'relative',
        overflow: 'hidden',
        height: '40vh',
      }}
    >
      {/* Background image */}
      <img
        src="/img/bghome.png"
        alt=""
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <Heading as="h1" className={styles.hero__title}>
          Paysecure Merchant Guide
        </Heading>
        <p className={styles.hero__subtitle}>Your guide to Paysecure onboarding and configuration</p>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const match = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(match.matches);
    const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);
    match.addEventListener("change", listener);
    return () => match.removeEventListener("change", listener);
  }, []);

  const handleClick = () => {
    setOpen(true);
  };

  return (
    <Layout
      title={siteConfig.title}
      description="Comprehensive guide for merchant onboarding and configuration on Paysecure."
    >
      <HomepageHeader />
      <main style={{ backgroundColor: 'white' }}>
        <section className='cardContainer'
          style={{
            marginBottom: '50px', marginTop: '50px'
          }}>

          {/* Quickfind Docs */}
          <div className={styles.quickLinks}>
            <div className={styles.quickfindDocs}>Quickfind Docs</div>
            <div className={styles.quickDocsGrid}>
              <Link to='https://docs.paysecure.net/merchantguide/' className={styles.docs}>
                <div className={styles.docsHeader}>
                  <img src="/img/nohoverprofile.svg" alt="" className={`${styles.docsIcon} ${styles.activedocsIcon1}`} />
                  <img src="/img/nohoverarrow.svg" alt="" className={styles.arrowIcon} />
                </div>
                <div className={styles.docsText}>
                  <span className={styles.docsTitle}>Merchant Docs</span>
                  <span className={styles.docsDesc}>Integrate and manage payments.</span>
                </div>
              </Link>

              <Link to='/docs/overview' className={styles.docs}>
                <div className={styles.docsHeader}>
                  <img src="/img/wallet.svg" alt="" className={`${styles.docsIcon}  ${styles.activedocsIcon2}`} />
                  <img src="/img/nohoverarrow.svg" alt="" className={styles.arrowIcon} />
                </div>
                <div className={styles.docsText}>
                  <span className={styles.docsTitle}>Alternative Payment Methods (APM)</span>
                  <span className={styles.docsDesc}>Set up and optimize APMs.</span>
                </div>
              </Link>

              <Link to='/' className={styles.docs}>
                <div className={styles.docsHeader}>
                  <img src="/img/api.svg" alt="" className={`${styles.docsIcon}  ${styles.activedocsIcon3}`} />
                  <img src="/img/nohoverarrow.svg" alt="" className={styles.arrowIcon} />
                </div>
                <div className={styles.docsText}>
                  <span className={styles.docsTitle}>Set-up & optimize APMs</span>
                  <span className={styles.docsDesc}>Set up and optimize APMs.</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Developer Tools */}
          <div className={styles.developerTools}>
            <div className={styles.developerToolsTitle}>Developer Tools</div>
            <div className={styles.devGrid}>
              <div className={styles.devLeft}>
                <Link to='/docs/api/cryptobridge' className={`${styles.developercards} ${styles.activeCard}`} >
                  <span className={`${styles.linkText} ${styles.activeLink} ${styles.activeCard}`}>Payin APIs</span>
                  <img src="/img/nohoverarrow.svg" alt="arrow" className={styles.arrowIcon} />
                </Link>

                <Link to='/docs/api/cryptobridge' className={`${styles.developercards} ${styles.activeCard}`}>
                  <span className={`${styles.linkText} ${styles.activeLink}`}>Payout APIs</span>
                  <img src="/img/nohoverarrow.svg" alt="arrow" className={styles.arrowIcon} />
                </Link>

                <Link to='/docs/api/cryptobridge' className={`${styles.developercards} ${styles.activeCard}`}>
                  <span className={`${styles.linkText} ${styles.activeLink}`}>Authentication</span>
                  <img src="/img/nohoverarrow.svg" alt="arrow" className={styles.arrowIcon} />
                </Link>

                <Link to='/docs/api/cryptobridge' className={`${styles.developercards} ${styles.activeCard}`}>
                  <span className={`${styles.linkText} ${styles.activeLink}`}>Refund</span>
                  <img src="/img/nohoverarrow.svg" alt="arrow" className={styles.arrowIcon} />
                </Link>

                <Link to='/docs/api/cryptobridge' className={`${styles.developercards} ${styles.activeCard}`}>
                  <span className={`${styles.linkText} ${styles.activeLink}`}>Cashier</span>
                  <img src="/img/nohoverarrow.svg" alt="arrow" className={styles.arrowIcon} />
                </Link>

                <Link to='/docs/api/cryptobridge' className={`${styles.developercards} ${styles.activeCard}`}>
                  <span className={`${styles.linkText} ${styles.activeLink}`}>Verify Status</span>
                  <img src="/img/nohoverarrow.svg" alt="arrow" className={styles.arrowIcon} />
                </Link>
              </div>

              <div className={styles.aiCard}>
                <div className={styles.aiIcon}>✨</div>
                <div className={styles.aiText}>
                  <h4>Need help? Just ask.</h4>
                  <p>Get instant answers on payments, integrations, and more — powered by AI.</p>
                </div>
                <button className={styles.aiButton} onClick={handleClick}>
                  Ask AI Agent
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <ChatbotModal open={open} onClose={() => setOpen(false)} isDark={isDark} />
    </Layout>
  );
}

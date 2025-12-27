import { OnboardingCanvas } from './canvas';
import styles from './LandingPage.module.css';

export function LandingPage() {
  return (
    <div className={styles.page}>
      {/* Left side - Hero / Brand section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>⚡</span>
            <span className={styles.logoText}>ConvertShop</span>
          </div>
          
          <h1 className={styles.headline}>
            Muuta verkkokauppasi<br />
            <span className={styles.gradient}>huippunopeaksi</span><br />
            SPA-kokemukseksi
          </h1>
          
          <p className={styles.subheadline}>
            Yhdistä olemassa oleva kauppasi ja me rakennamme sinulle 
            modernin, salamannopean verkkokaupan joka konvertoi.
          </p>
          
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>+47%</span>
              <span className={styles.statLabel}>konversio</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>0.3s</span>
              <span className={styles.statLabel}>latausaika</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>500+</span>
              <span className={styles.statLabel}>kauppaa</span>
            </div>
          </div>
          
          <div className={styles.trust}>
            <p>Luottavat meihin:</p>
            <div className={styles.logos}>
              <span>🏪 Nordic Outdoor</span>
              <span>👕 Streetwear.fi</span>
              <span>🎮 GameShop</span>
            </div>
          </div>
        </div>
        
        <div className={styles.heroBackground}>
          <div className={styles.blob1} />
          <div className={styles.blob2} />
        </div>
      </section>

      {/* Right side - Onboarding Canvas */}
      <section className={styles.canvasSection}>
        <OnboardingCanvas />
      </section>
    </div>
  );
}


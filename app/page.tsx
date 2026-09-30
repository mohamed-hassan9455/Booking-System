import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>B</span>
          <span>Booking System</span>
        </div>

        <nav className={styles.nav}>
          <Link href="/login" className={styles.loginLink}>
            Log in
          </Link>

          <Link href="/signup" className={styles.signupLink}>
            Create account
          </Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Simple online scheduling</p>

          <h1>
            Make booking time with you
            <span> simple.</span>
          </h1>

          <p className={styles.description}>
            Set your weekly availability, share your personal booking link
            and manage customer requests from one dashboard.
          </p>

          <div className={styles.actions}>
            <Link href="/signup" className={styles.primaryButton}>
              Get started
            </Link>

            <Link href="/login" className={styles.secondaryButton}>
              Owner login
            </Link>
          </div>
        </div>

        <div className={styles.preview}>
          <div className={styles.previewHeader}>
            <div>
              <p className={styles.previewLabel}>Your dashboard</p>
              <h2>Bookings at a glance</h2>
            </div>

            <span className={styles.liveBadge}>Live</span>
          </div>

          <div className={styles.previewCard}>
            <div>
              <p className={styles.cardLabel}>Pending request</p>
              <strong>Tuesday · 10:00</strong>
            </div>

            <span className={styles.pendingBadge}>Pending</span>
          </div>

          <div className={styles.previewCard}>
            <div>
              <p className={styles.cardLabel}>Confirmed booking</p>
              <strong>Wednesday · 14:00</strong>
            </div>

            <span className={styles.acceptedBadge}>Accepted</span>
          </div>

          <div className={styles.availabilityPreview}>
            <p>Weekly availability</p>

            <div className={styles.days}>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <article>
          <span className={styles.featureNumber}>01</span>
          <h2>Set your availability</h2>
          <p>
            Choose when customers can book you and update your schedule
            whenever you need.
          </p>
        </article>

        <article>
          <span className={styles.featureNumber}>02</span>
          <h2>Share your booking link</h2>
          <p>
            Customers can choose an available time without needing to create
            an account.
          </p>
        </article>

        <article>
          <span className={styles.featureNumber}>03</span>
          <h2>Manage requests</h2>
          <p>
            Review pending bookings and accept or reject requests directly
            from your dashboard.
          </p>
        </article>
      </section>

      <footer className={styles.footer}>
        <p>Booking System</p>
        <p>Simple scheduling, without the back-and-forth.</p>
      </footer>
    </main>
  );
}
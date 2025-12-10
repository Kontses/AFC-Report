// import Image from "next/image"; // Removed unused import
import ReportForm from "../components/ReportForm";
import PendingReports from "../components/PendingReports";
import ThemeToggle from "../components/ThemeToggle";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>AFC Report</h1>
          <ThemeToggle />
        </div>
      </header>
      <main className={styles.main}>
        <ReportForm />
        <PendingReports />
      </main>
    </div>
  );
}

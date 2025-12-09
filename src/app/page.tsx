// import Image from "next/image"; // Removed unused import
import ReportForm from "../components/ReportForm";
import PendingReports from "../components/PendingReports";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Metro Reports</h1>
      </header>
      <main className={styles.main}>
        <ReportForm />
        <PendingReports />
      </main>
    </div>
  );
}

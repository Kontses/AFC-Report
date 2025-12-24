"use client";

// import Image from "next/image";
import ReportForm from "../components/ReportForm";
import PendingReports from "../components/PendingReports";
import ThemeToggle from "../components/ThemeToggle";
import styles from "./page.module.css";
import { useState } from "react";
import { History } from "lucide-react";

export default function Home() {
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>AFC Report</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => setHistoryOpen(true)}
              title="View History"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--foreground)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px",
                borderRadius: "50%",
                transition: "background 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--muted)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <History size={24} />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className={styles.main}>
        <ReportForm
          isHistoryOpen={historyOpen}
          onHistoryClose={() => setHistoryOpen(false)}
        />
        <PendingReports />
      </main>
    </div>
  );
}

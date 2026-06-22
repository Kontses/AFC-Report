"use client";

// import Image from "next/image";
import ReportForm from "../components/ReportForm";
import PendingReports from "../components/PendingReports";
import ThemeToggle from "../components/ThemeToggle";
import styles from "./page.module.css";
import { useState } from "react";

import ShiftsCalendarModal from "../components/ShiftsCalendarModal";
import { History, FileSpreadsheet, Calendar } from "lucide-react";

export default function Home() {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>AFC Report</h1>
          <div className={styles.headerActions}>
            <button
              onClick={() => setCalendarOpen(true)}
              title="Προβολή Ημερολογίου Βαρδιών"
              className={styles.headerBtn}
            >
              <Calendar size={24} />
            </button>
            <button
              onClick={() => window.open("https://docs.google.com/spreadsheets/d/1jGgQaW4m4ht5N9rVdho9VoeMfwkqVJvIQELNjQoOoj8/edit?usp=sharing", "_blank")}
              title="Προβολή Google Sheet"
              className={styles.headerBtn}
            >
              <FileSpreadsheet size={24} />
            </button>
            <button
              onClick={() => setHistoryOpen(true)}
              title="Προβολή Ιστορικού"
              className={styles.headerBtn}
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

      <ShiftsCalendarModal 
        isOpen={calendarOpen} 
        onClose={() => setCalendarOpen(false)} 
      />
    </div>
  );
}

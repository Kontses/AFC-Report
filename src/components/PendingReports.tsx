"use client";

import { useState, useEffect } from "react";
import { getLocalReports, markReportSynced, Report } from "../lib/storage";

import styles from "./PendingReports.module.css";

export default function PendingReports() {
    const [reports, setReports] = useState<Report[]>([]);

    useEffect(() => {
        // Load initial
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setReports(getLocalReports().filter(r => !r.synced));

        // Simple poll to refresh list if new reports are added (rudimentary sync)
        const interval = setInterval(() => {
            setReports(getLocalReports().filter(r => !r.synced));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleSync = async () => {
        if (reports.length === 0) return;

        alert(`Syncing ${reports.length} reports...`);

        // Mock API Call
        for (const report of reports) {
            console.log("Uploading", report);
            await new Promise(r => setTimeout(r, 500)); // Fake network delay
            markReportSynced(report.id);
        }

        setReports(getLocalReports().filter(r => !r.synced));
        alert("Sync Complete!");
    };

    if (reports.length === 0) {
        return <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>All local reports synced.</div>;
    }

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>
                Pending Uploads
                <span style={{ fontSize: '0.8em', background: 'var(--primary)', padding: '0.2em 0.6em', borderRadius: '4px' }}>
                    {reports.length}
                </span>
            </h3>
            <ul className={styles.list}>
                {reports.map(r => (
                    <li key={r.id} className={styles.listItem}>
                        <span>{r.device} @ {r.station}</span>
                        <span style={{ fontSize: '0.8em', opacity: 0.7 }}>{new Date(r.reportedDate).toLocaleDateString()}</span>
                    </li>
                ))}
            </ul>
            <button onClick={handleSync} className={styles.syncBtn}>
                Sync Now
            </button>
        </div>
    );
}

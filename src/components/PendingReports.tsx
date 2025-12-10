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
        return <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>All rights reserved © 2025 TRAXIS ENGINEERING.</div>;
    }

    const formatDisplayDate = (dateStr: string) => {
        // Check if it's an ISO string (e.g., 2025-12-10T...)
        if (dateStr && dateStr.includes('T') && dateStr.includes('Z')) {
            return new Date(dateStr).toLocaleString('el-GR', {
                day: 'numeric', month: 'numeric', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: true
            }).replace('pm', 'μμ').replace('am', 'πμ');
        }
        // Otherwise assume it's already formatted
        return dateStr;
    };

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
                        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                            <span style={{ fontWeight: 500 }}>{r.station}, {r.device}, {r.tag}</span>
                            <span style={{ fontSize: '0.8em', opacity: 0.7, marginTop: '0.2rem' }}>
                                {formatDisplayDate(r.reportedDate)}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
            <button onClick={handleSync} className={styles.syncBtn}>
                Sync Now
            </button>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { getLocalReports, markReportSynced, Report } from "../lib/storage";
import { submitReport } from "../lib/api";

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

        // Simple confirmation text for now, or just go for it upon click
        // alert(`Syncing ${reports.length} reports...`); 

        let successCount = 0;
        let failCount = 0;

        for (const report of reports) {
            // Removing internal fields not needed for the sheet is handled by the Sheet script ignoring them,
            // or we could sanitize here. But passing the full object is fine.
            const success = await submitReport(report);
            if (success) {
                markReportSynced(report.id);
                successCount++;
            } else {
                failCount++;
            }
        }

        setReports(getLocalReports().filter(r => !r.synced));

        if (failCount === 0) {
            alert("Sync Complete! All reports uploaded. ☁️");
        } else {
            alert(`Sync Finished. Uploaded: ${successCount}. Failed: ${failCount}. Please check connection.`);
        }
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

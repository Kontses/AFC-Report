"use client";

import { useState, useEffect } from "react";
import { getLocalReports, markReportSynced, deleteReportLocal, Report } from "../lib/storage";
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

        let successCount = 0;
        let failCount = 0;

        for (const report of reports) {
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

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this report?")) {
            deleteReportLocal(id);
            setReports(prev => prev.filter(r => r.id !== id));
        }
    };

    if (reports.length === 0) {
        return <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>All rights reserved © 2025 TRAXIS ENGINEERING.</div>;
    }

    const formatDisplayDate = (dateStr: string) => {
        if (dateStr && dateStr.includes('T') && dateStr.includes('Z')) {
            return new Date(dateStr).toLocaleString('el-GR', {
                day: 'numeric', month: 'numeric', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: true
            }).replace('pm', 'μμ').replace('am', 'πμ');
        }
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
                        <button
                            className={styles.deleteBtn}
                            onClick={(e) => handleDelete(r.id, e)}
                            title="Delete Report"
                        >
                            <svg viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </li>
                ))}
            </ul>
            <button onClick={handleSync} className={styles.syncBtn}>
                Sync Now
            </button>
        </div>
    );
}

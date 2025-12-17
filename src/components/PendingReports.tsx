"use client";

import React, { useState, useEffect } from "react";
import { getLocalReports, markReportSynced, deleteReportLocal, Report } from "../lib/storage";
import { submitReport } from "../lib/api";

import styles from "./PendingReports.module.css";

export default function PendingReports() {
    const [reports, setReports] = useState<Report[]>([]);

    const [isSyncingDisplay, setIsSyncingDisplay] = useState(false); // Only for UI
    const isSyncingRef = React.useRef(false); // True source of truth
    const processingIds = React.useRef(new Set<string>()); // Track distinct IDs being sent

    useEffect(() => {
        // Load initial reports
        const currentReports = getLocalReports().filter(r => !r.synced);
        setReports(currentReports);

        // Auto-sync on mount if online and has reports
        if (navigator.onLine && currentReports.length > 0) {
            handleSync();
        }

        // Listener for coming back online
        const onOnline = () => {
            console.log("Device is back online! Attempting background sync...");
            handleSync();
        };
        window.addEventListener('online', onOnline);

        // Poll to refresh list (in case ReportForm adds new ones)
        const interval = setInterval(() => {
            if (!isSyncingRef.current) {
                const latest = getLocalReports().filter(r => !r.synced);
                // Only update state if length changed to avoid redraws or loops
                if (JSON.stringify(latest) !== JSON.stringify(reports)) {
                    setReports(latest);
                }

                // Also try to sync if we found new reports and are online
                if (latest.length > 0 && navigator.onLine) {
                    handleSync();
                }
            }
        }, 5000); // Check every 5s

        return () => {
            window.removeEventListener('online', onOnline);
            clearInterval(interval);
        };
    }, [reports]);

    const handleSync = async () => {
        // Safe-guard: re-check latest reports from storage to be sure
        const currentReports = getLocalReports().filter(r => !r.synced);

        // Critical Section Guard
        if (currentReports.length === 0 || isSyncingRef.current) return;

        isSyncingRef.current = true;
        setIsSyncingDisplay(true);
        console.log("Starting Auto-Sync...");

        try {
            for (const report of currentReports) {
                // Double-Check: Skip if implementation detail already processing this ID
                if (processingIds.current.has(report.id)) continue;

                processingIds.current.add(report.id);

                try {
                    const success = await submitReport(report);
                    if (success) {
                        markReportSynced(report.id);
                        // Remove from list immediately to reflect progress
                        setReports(prev => prev.filter(r => r.id !== report.id));
                    }
                } finally {
                    processingIds.current.delete(report.id);
                }
            }
        } catch (err) {
            console.error("Auto-sync error:", err);
        } finally {
            isSyncingRef.current = false;
            setIsSyncingDisplay(false);
            // Final consistency check
            setReports(getLocalReports().filter(r => !r.synced));
            console.log("Auto-Sync finished.");
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
            <h3 className={styles.title} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Pending Uploads</span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {isSyncingDisplay && <span style={{ fontSize: '0.7em', color: 'var(--primary)', animation: 'pulse 1s infinite' }}>☁️ Syncing...</span>}
                    <span style={{ fontSize: '0.8em', background: 'var(--primary)', padding: '2px 8px', borderRadius: '12px', color: 'white' }}>
                        {reports.length}
                    </span>
                </div>
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
                            disabled={isSyncingDisplay}
                        >
                            <svg viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

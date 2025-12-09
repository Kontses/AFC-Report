"use client";

import { useState, useEffect } from "react";
import { getLocalReports, markReportSynced, Report } from "../lib/storage";

export default function PendingReports() {
    const [reports, setReports] = useState<Report[]>([]);

    useEffect(() => {
        // Load initial
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
        return <div style={{ padding: '1rem', textAlign: 'center', color: '#888' }}>All reports synced.</div>;
    }

    return (
        <div style={{ padding: '1rem', borderTop: '1px solid #eaeaea', marginTop: '2rem' }}>
            <h3>Pending Reports ({reports.length})</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0' }}>
                {reports.map(r => (
                    <li key={r.id} style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                        {r.reportedDate} - {r.device} @ {r.station}
                    </li>
                ))}
            </ul>
            <button
                onClick={handleSync}
                style={{
                    padding: '0.5rem 1rem',
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                Sync Now
            </button>
        </div>
    );
}

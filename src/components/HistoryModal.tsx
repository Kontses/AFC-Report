"use client";

import React, { useEffect, useState } from "react";
import { X, Edit2, Loader2 } from "lucide-react";

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onEdit: (report: any) => void;
}

export default function HistoryModal({ isOpen, onClose, onEdit }: HistoryModalProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchReports();
        }
    }, [isOpen]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            // Force fresh fetch
            const res = await fetch("/api/reports", { cache: "no-store" });
            if (res.ok) {
                const data = await res.json();
                // Take last 10
                const last10 = data.slice(-10).reverse();
                setReports(last10);
            }
        } catch (error) {
            console.error("Failed to fetch history", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            backdropFilter: "blur(4px)"
        }}>
            <div style={{
                background: "var(--background, #fff)",
                color: "var(--foreground, #000)",
                width: "90%",
                maxWidth: "1000px",
                maxHeight: "90vh",
                overflow: "hidden",
                borderRadius: "16px",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                display: "flex",
                flexDirection: "column"
            }}>
                {/* Header */}
                <div style={{
                    padding: "1.5rem",
                    borderBottom: "1px solid var(--border, #e5e7eb)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Recent History (Last 10)</h2>
                    <button
                        onClick={onClose}
                        style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--muted-foreground, #64748b)" }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: "0.5rem", overflowY: "auto", flex: 1 }}>
                    {loading ? (
                        <div style={{ padding: "3rem", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <Loader2 className="animate-spin" size={32} />
                        </div>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                                <thead>
                                    <tr style={{ background: "var(--muted, #f1f5f9)", textAlign: "left" }}>
                                        <th style={thStyle}>Date</th>
                                        <th style={thStyle}>Station</th>
                                        <th style={thStyle}>Device</th>
                                        <th style={thStyle}>Tag</th>
                                        <th style={thStyle}>Malfunction</th>
                                        <th style={thStyle}>Reported By</th>
                                        <th style={thStyle}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map((r, i) => (
                                        <tr key={i} style={{ borderBottom: "1px solid var(--border, #e5e7eb)" }}>
                                            <td style={tdStyle}>
                                                {r["Date"] ?
                                                    new Date(r["Date"]).toLocaleString('el-GR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                                                    : r["reportedDate"]}
                                            </td>
                                            <td style={tdStyle}>{r["Station"]}</td>
                                            <td style={tdStyle}>{r["Device"]}</td>
                                            <td style={tdStyle}>{r["Tag"]}</td>
                                            <td style={tdStyle}>{r["Malfunction"]}</td>
                                            <td style={tdStyle}>{r["Reported By"]}</td>
                                            <td style={tdStyle}>
                                                <button
                                                    onClick={() => onEdit(r)}
                                                    title="Edit this report"
                                                    style={{
                                                        background: "#f59e0b",
                                                        color: "white",
                                                        border: "none",
                                                        padding: "6px",
                                                        borderRadius: "6px",
                                                        cursor: "pointer",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "4px"
                                                    }}
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const thStyle = { padding: "12px", borderBottom: "2px solid var(--border, #e2e8f0)", color: "var(--muted-foreground, #64748b)" };
const tdStyle = { padding: "12px", whiteSpace: "nowrap" as const };

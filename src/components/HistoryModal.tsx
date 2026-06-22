"use client";

import React, { useEffect, useState } from "react";
import { X, Edit2, Loader2, History as HistoryIcon } from "lucide-react";

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

    const [shouldRender, setShouldRender] = useState(isOpen);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            setIsAnimatingOut(false);
            fetchReports();
        } else {
            setIsAnimatingOut(true);
            const timer = setTimeout(() => {
                setShouldRender(false);
                setIsAnimatingOut(false);
            }, 300); // 300ms για να ολοκληρωθεί το scaleDownModal animation
            return () => clearTimeout(timer);
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

    if (!shouldRender) return null;

    return (
        <div 
            className={isAnimatingOut ? "modal-backdrop-out" : "modal-backdrop-animate"}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                padding: "1rem"
            }}
        >
            <div 
                className={isAnimatingOut ? "modal-content-out" : "modal-content-animate"}
                style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                    width: "90%",
                    maxWidth: "1000px",
                    maxHeight: "90vh",
                    overflow: "hidden",
                    borderRadius: "16px",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    flexDirection: "column"
                }}
            >
                {/* Header / Κεφαλίδα */}
                <div style={{
                    padding: "1.25rem 1.5rem",
                    borderBottom: "1px solid var(--border)",
                    backgroundColor: "var(--input-bg)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <HistoryIcon size={24} color="var(--primary)" />
                        <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", margin: 0 }}>History</h2>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: "var(--card-bg)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                            cursor: "pointer",
                            color: "var(--foreground)",
                            padding: "6px 12px",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            transition: "background 0.2s, border-color 0.2s"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "var(--input-bg)";
                            e.currentTarget.style.borderColor = "var(--secondary)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "var(--card-bg)";
                            e.currentTarget.style.borderColor = "var(--border)";
                        }}
                    >
                        <span style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Κλείσιμο</span>
                        <X size={18} />
                    </button>
                </div>

                {/* Content / Περιεχόμενο */}
                <div style={{ padding: "1.5rem", overflowY: "auto", flex: 1, backgroundColor: "var(--card-bg)" }}>
                    {loading ? (
                        <div style={{ padding: "3rem", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <Loader2 className="animate-spin" size={32} color="var(--primary)" />
                        </div>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                                <thead>
                                    <tr style={{ background: "var(--input-bg)", textAlign: "left" }}>
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
                                        <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
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
                                                        background: "rgba(217, 119, 6, 0.15)",
                                                        color: "#fbbf24",
                                                        border: "1px solid rgba(217, 119, 6, 0.3)",
                                                        padding: "6px",
                                                        borderRadius: "6px",
                                                        cursor: "pointer",
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        transition: "all 0.2s"
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = "rgba(217, 119, 6, 0.3)";
                                                        e.currentTarget.style.borderColor = "#fbbf24";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = "rgba(217, 119, 6, 0.15)";
                                                        e.currentTarget.style.borderColor = "rgba(217, 119, 6, 0.3)";
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

const thStyle = {
    padding: "12px",
    borderBottom: "2px solid var(--border)",
    color: "var(--secondary)",
    fontWeight: "600" as const,
    fontSize: "0.85rem"
};

const tdStyle = {
    padding: "12px",
    color: "var(--foreground)",
    whiteSpace: "nowrap" as const
};

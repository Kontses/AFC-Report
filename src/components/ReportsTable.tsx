"use client";

import React from "react";

interface ReportsTableProps {
    data: any[];
}

export default function ReportsTable({ data }: ReportsTableProps) {
    // Helper to format Date
    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString;
        
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = d.getHours();
        const minutes = String(d.getMinutes()).padStart(2, '0');
        
        const ampm = hours >= 12 ? 'μ.μ.' : 'π.μ.';
        const displayHours = hours % 12 || 12;
        const hourStr = String(displayHours).padStart(2, '0');

        return `${day}/${month}/${year} ${hourStr}:${minutes} ${ampm}`;
    };

    if (!data || data.length === 0) {
        return (
            <div style={{ padding: "3rem", textAlign: "center", color: "#64748b", background: "rgba(255,255,255,0.03)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)" }}>
                Δεν βρέθηκαν αναφορές για τα επιλεγμένα φίλτρα.
            </div>
        );
    }

    return (
        <div style={{
            width: "100%",
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "1rem",
            paddingRight: "0.5rem" // Reduce padding slightly to accommodate scrollbar
        }}>
            <div className="custom-scrollbar" style={{
                maxHeight: "600px",
                overflowY: "auto",
                overflowX: "auto",
                paddingRight: "0.5rem"
            }}>
                <table style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "0.85rem",
                    textAlign: "left",
                    minWidth: "1200px" // Ensure columns don't squish too much
                }}>
                    <thead style={{
                        position: "sticky",
                        top: 0,
                        background: "var(--page-bg, #0f172a)", // Use dark color that matches the app theme
                        zIndex: 10
                    }}>
                        <tr style={{
                            borderBottom: "1px solid rgba(255,255,255,0.2)",
                            color: "var(--sub-text-color, #94a3b8)"
                        }}>
                        <th style={{ padding: "12px 8px" }}>Reported By</th>
                        <th style={{ padding: "12px 8px" }}>Date</th>
                        <th style={{ padding: "12px 8px" }}>Station</th>
                        <th style={{ padding: "12px 8px" }}>Device</th>
                        <th style={{ padding: "12px 8px" }}>Tag</th>
                        <th style={{ padding: "12px 8px" }}>Status</th>
                        <th style={{ padding: "12px 8px" }}>Alarm Code</th>
                        <th style={{ padding: "12px 8px" }}>Malfunction</th>
                        <th style={{ padding: "12px 8px" }}>Impact</th>
                        <th style={{ padding: "12px 8px" }}>Repair Process</th>
                        <th style={{ padding: "12px 8px" }}>Assigned To</th>
                        <th style={{ padding: "12px 8px" }}>Final Result</th>
                        <th style={{ padding: "12px 8px" }}>Comments</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, idx) => (
                        <tr key={idx} style={{
                            borderBottom: "1px solid rgba(255,255,255,0.05)",
                            transition: "background 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                        >
                            <td style={{ padding: "10px 8px", whiteSpace: "nowrap" }}>{row["Reported By"]}</td>
                            <td style={{ padding: "10px 8px", whiteSpace: "nowrap" }}>{formatDate(row["Date"] || row["reportedDate"])}</td>
                            <td style={{ padding: "10px 8px" }}>{row["Station"]}</td>
                            <td style={{ padding: "10px 8px" }}>{row["Device"]}</td>
                            <td style={{ padding: "10px 8px", textAlign: "center" }}>{row["Tag"]}</td>
                            <td style={{ padding: "10px 8px" }}>
                                <span style={{
                                    padding: "2px 6px", 
                                    borderRadius: "4px",
                                    fontSize: "0.75rem",
                                    background: row["Status"] === "Solved" ? "rgba(16,185,129,0.2)" : 
                                               row["Status"] === "Out Of Service" ? "rgba(239,68,68,0.2)" : 
                                               "rgba(245,158,11,0.2)",
                                    color: row["Status"] === "Solved" ? "#10b981" : 
                                           row["Status"] === "Out Of Service" ? "#ef4444" : 
                                           "#f59e0b"
                                }}>
                                    {row["Status"]}
                                </span>
                            </td>
                            <td style={{ padding: "10px 8px" }}>{row["Alarm Code"]}</td>
                            <td style={{ padding: "10px 8px", maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={row["Malfunction"]}>{row["Malfunction"]}</td>
                            <td style={{ padding: "10px 8px" }}>{row["Impact"]}</td>
                            <td style={{ padding: "10px 8px", maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={row["Repair Process"]}>{row["Repair Process"]}</td>
                            <td style={{ padding: "10px 8px", whiteSpace: "nowrap" }}>{row["Assigned To"]}</td>
                            <td style={{ padding: "10px 8px" }}>{row["Final Result"]}</td>
                            <td style={{ padding: "10px 8px", maxWidth: "150px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={row["Comments"]}>{row["Comments"]}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </div>
    );
}

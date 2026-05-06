"use client";

import React, { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

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

    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

    const sortedData = useMemo(() => {
        if (!sortConfig) return data;
        
        return [...data].sort((a, b) => {
            let valA = a[sortConfig.key];
            let valB = b[sortConfig.key];
            
            // Handle null/undefined
            if (valA === undefined || valA === null) valA = "";
            if (valB === undefined || valB === null) valB = "";
            
            // Special handling for dates
            if (sortConfig.key === "Date") {
                valA = new Date(a["Date"] || a["reportedDate"] || 0).getTime();
                valB = new Date(b["Date"] || b["reportedDate"] || 0).getTime();
            }

            if (valA < valB) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (valA > valB) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            
            // Fallback for alphanumeric string comparison (e.g., Station "1(NRS)" vs "10(ANP)")
            if (typeof valA === 'string' && typeof valB === 'string') {
                const cmp = valA.localeCompare(valB, undefined, { numeric: true });
                return sortConfig.direction === 'asc' ? cmp : -cmp;
            }

            return 0;
        });
    }, [data, sortConfig]);

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const renderSortIcon = (columnKey: string) => {
        if (!sortConfig || sortConfig.key !== columnKey) {
            return <ChevronsUpDown size={14} style={{ opacity: 0.3, marginLeft: '4px' }} />;
        }
        return sortConfig.direction === 'asc' 
            ? <ChevronUp size={14} style={{ color: '#3b82f6', marginLeft: '4px' }} />
            : <ChevronDown size={14} style={{ color: '#3b82f6', marginLeft: '4px' }} />;
    };

    const Th = ({ label, columnKey }: { label: string, columnKey: string }) => (
        <th 
            style={{ padding: "12px 8px", cursor: "pointer", userSelect: "none" }}
            onClick={() => requestSort(columnKey)}
        >
            <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                {label}
                {renderSortIcon(columnKey)}
            </div>
        </th>
    );

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
                        <Th label="Reported By" columnKey="Reported By" />
                        <Th label="Date" columnKey="Date" />
                        <Th label="Station" columnKey="Station" />
                        <Th label="Device" columnKey="Device" />
                        <Th label="Tag" columnKey="Tag" />
                        <Th label="Status" columnKey="Status" />
                        <Th label="Alarm Code" columnKey="Alarm Code" />
                        <Th label="Malfunction" columnKey="Malfunction" />
                        <Th label="Impact" columnKey="Impact" />
                        <Th label="Repair Process" columnKey="Repair Process" />
                        <Th label="Assigned To" columnKey="Assigned To" />
                        <Th label="Final Result" columnKey="Final Result" />
                        <Th label="Comments" columnKey="Comments" />
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((row, idx) => (
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

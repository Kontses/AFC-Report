"use client";

import React, { useState } from "react";
import { saveAs } from "file-saver";
import { Download, Loader2 } from "lucide-react";

interface ExportButtonProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reports: any[];
    startDate: string;
    endDate: string;
}

export default function ExportButton({ reports, startDate, endDate }: ExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        if (reports.length === 0) {
            alert("No data to export!");
            return;
        }

        try {
            setIsExporting(true);
            
            // Call the secure Next.js API Route we built that uses xlsx-populate 
            // to perfectly preserve all Native Excel charts!
            const response = await fetch("/api/export", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ reports, startDate, endDate }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Failed to generate Excel file");
            }

            // Get the generated Excel buffer and save it out completely intact
            const blob = await response.blob();
            saveAs(blob, `AFC_Analytics_${startDate}_to_${endDate}.xlsx`);

        } catch (error) {
            console.error(error);
            alert("Σφάλμα κατά την εξαγωγή: " + (error as Error).message);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={isExporting}
            className="export-btn"
            style={{
                background: "rgba(16, 185, 129, 0.1)", // Glassy Green
                color: "#10b981", // Neon Green Text
                border: "1px solid rgba(16, 185, 129, 0.3)",
                padding: "0.6rem 1.2rem",
                borderRadius: "8px",
                cursor: isExporting ? "not-allowed" : "pointer",
                fontSize: "0.9rem",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                transition: "all 0.3s ease",
                backdropFilter: "blur(4px)",
                opacity: isExporting ? 0.7 : 1
            }}
            onMouseOver={(e) => {
                if(!isExporting) {
                    e.currentTarget.style.background = "rgba(16, 185, 129, 0.2)";
                    e.currentTarget.style.boxShadow = "0 0 15px rgba(16, 185, 129, 0.3)";
                }
            }}
            onMouseOut={(e) => {
                if(!isExporting) {
                    e.currentTarget.style.background = "rgba(16, 185, 129, 0.1)";
                    e.currentTarget.style.boxShadow = "none";
                }
            }}
        >
            {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {isExporting ? "Exporting..." : "Export"}
        </button>
    );
}

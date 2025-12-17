"use client";

import React from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Download } from "lucide-react";

interface ExportButtonProps {
    reports: any[];
    startDate: string;
    endDate: string;
}

export default function ExportButton({ reports, startDate, endDate }: ExportButtonProps) {

    const handleExport = async () => {
        if (reports.length === 0) {
            alert("No data to export!");
            return;
        }

        // 1. Create Workbook & Worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Reports");

        // 2. Define Columns & Headers
        // Match the Google Sheet structure roughly based on provided image
        worksheet.columns = [
            { header: "Reported By", key: "Reported By", width: 25 },
            { header: "Date", key: "Date", width: 22, style: { numFmt: 'dd/mm/yyyy hh:mm AM/PM' } },
            { header: "Station", key: "Station", width: 15 },
            { header: "Device", key: "Device", width: 10 },
            { header: "Tag", key: "Tag", width: 10 },
            { header: "Status", key: "Status", width: 15 },
            { header: "Alarm Code", key: "Alarm Code", width: 15 },
            { header: "Malfunction", key: "Malfunction", width: 40 },
            { header: "Impact", key: "Impact", width: 20 },
            { header: "Repair Process", key: "Repair Process", width: 40 },
            { header: "Assigned To", key: "Assigned To", width: 20 },
            { header: "Final Result", key: "Final Result", width: 20 },
            { header: "Comments", key: "Comments", width: 40 },
        ];

        // 3. Add Data (and parse Dates)
        reports.forEach((report) => {
            // Create a shallow copy to safely modify
            const row = { ...report };

            // Handle Date parsing
            // The API returns the column name as key, which from Google Sheets is typically "Date"
            const dateVal = row["Date"] || row["reportedDate"];
            if (dateVal) {
                const parsed = new Date(dateVal);
                if (!isNaN(parsed.getTime())) {
                    row["Date"] = parsed;
                }
            }

            worksheet.addRow(row);
        });

        // 4. Stylize Header Row
        const headerRow = worksheet.getRow(1);
        headerRow.height = 30;

        headerRow.eachCell((cell) => {
            // Style: Green Background, White Font, Bold, Centered
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FF0F5132" } // Deep Green (Google Sheet style)
            };
            cell.font = {
                name: "Arial",
                color: { argb: "FFFFFFFF" }, // White
                bold: true,
                size: 11
            };
            cell.alignment = {
                vertical: "middle",
                horizontal: "center"
            };
            cell.border = {
                top: { style: "thin", color: { argb: "FF9CA3AF" } },
                left: { style: "thin", color: { argb: "FF9CA3AF" } },
                bottom: { style: "thin", color: { argb: "FF9CA3AF" } },
                right: { style: "thin", color: { argb: "FF9CA3AF" } }
            };
        });

        // 5. Stylize Data Rows
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header

            // Zebrafication (Alternating row colors) using refined light grays
            if (rowNumber % 2 === 0) {
                row.eachCell((cell) => {
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "FFF9FAFB" } // Very light gray
                    };
                });
            }

            row.eachCell((cell) => {
                cell.border = {
                    top: { style: "thin", color: { argb: "FFE5E7EB" } }, // Lighter border
                    left: { style: "thin", color: { argb: "FFE5E7EB" } },
                    bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
                    right: { style: "thin", color: { argb: "FFE5E7EB" } }
                };
                cell.alignment = {
                    vertical: "middle",
                    horizontal: "left",
                    wrapText: true
                };
                cell.font = {
                    name: "Arial",
                    size: 10,
                    color: { argb: "FF1F2937" } // Dark gray text
                };
            });
        });

        // 6. Generate File
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(blob, `AFC_Reports_${startDate}_to_${endDate}.xlsx`);
    };

    return (
        <button
            onClick={handleExport}
            className="export-btn"
            style={{
                background: "rgba(16, 185, 129, 0.1)", // Glassy Green
                color: "#10b981", // Neon Green Text
                border: "1px solid rgba(16, 185, 129, 0.3)",
                padding: "0.6rem 1.2rem",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                transition: "all 0.3s ease",
                backdropFilter: "blur(4px)"
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(16, 185, 129, 0.2)";
                e.currentTarget.style.boxShadow = "0 0 15px rgba(16, 185, 129, 0.3)";
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.background = "rgba(16, 185, 129, 0.1)";
                e.currentTarget.style.boxShadow = "none";
            }}
        >
            <Download size={18} />
            Export
        </button>
    );
}

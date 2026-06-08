"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  Calendar,
  Download,
  Upload,
  RotateCcw,
  Plus,
  X,
  ArrowLeft,
  Check,
  ChevronRight,
  CloudUpload,
  CloudDownload
} from "lucide-react";
import styles from "./page.module.css";

const EMPLOYEES = [
  "Emmanouil Kazantzoglou",
  "Evangelos Derventzis",
  "Dimitris Mpazakas",
  "Konstantinos Saltzoglou",
  "Nikos Tsiagkas",
  "Vassilis Kontses",
];

const EMPLOYEE_COLORS: Record<string, { bg: string; text: string }> = {
  "Emmanouil Kazantzoglou": { bg: "#2563eb", text: "#ffffff" },
  "Evangelos Derventzis": { bg: "#059669", text: "#ffffff" },
  "Dimitris Mpazakas": { bg: "#7c3aed", text: "#ffffff" },
  "Konstantinos Saltzoglou": { bg: "#d97706", text: "#ffffff" },
  "Nikos Tsiagkas": { bg: "#e11d48", text: "#ffffff" },
  "Vassilis Kontses": { bg: "#0891b2", text: "#ffffff" },
};

const CATEGORIES = ["ΠΡΩΙ", "ΑΠΟΓΕΥΜΑ", "ΡΕΠΟ", "ΑΔΕΙΑ", "ΓΡΑΦΕΙΟ"] as const;
type Category = typeof CATEGORIES[number];

const DAY_NAMES_HEADERS = ["ΔΕΥΤΕΡΑ", "ΤΡΙΤΗ", "ΤΕΤΑΡΤΗ", "ΠΕΜΠΤΗ", "ΠΑΡΑΣΚΕΥΗ", "ΣΑΒΒΑΤΟ", "ΚΥΡΙΑΚΗ"];
const DAY_NAMES_DISPLAY = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο", "Κυριακή"];

function parseDateRobust(dateStr: string): Date {
  return new Date(dateStr + "T12:00:00");
}

function formatDateStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMondayOfCurrentWeek(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return formatDateStr(monday);
}

function getSundayOfCurrentWeek(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? 0 : 7);
  const sunday = new Date(d.setDate(diff));
  return formatDateStr(sunday);
}

export default function ShiftsPage() {
  const router = useRouter();
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // State: dateStr -> Category -> array of employee names
  const [shifts, setShifts] = useState<Record<string, Record<Category, string[]>>>({});

  // Modal active cell selector
  const [activeCell, setActiveCell] = useState<{ dateStr: string; category: Category } | null>(null);

  // Drag-to-fill state: tracks the employee being dragged to replicate across cells
  const [draggedEmployee, setDraggedEmployee] = useState<string | null>(null);
  const [isFillDrag, setIsFillDrag] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize client-side dates safely and auto-load from Drive
  useEffect(() => {
    setStartDate(getMondayOfCurrentWeek());
    setEndDate(getSundayOfCurrentWeek());
    
    // Auto-load shifts on mount
    const loadInitial = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/shifts/get');
        if (res.ok) {
          const data = await res.json();
          if (data && Object.keys(data).length > 0) {
            const dates = Object.keys(data).sort();
            if (dates.length > 0) {
              setStartDate(dates[0]);
              setEndDate(dates[dates.length - 1]);
            }
            setShifts(data);
          }
        }
      } catch (err) {
        console.error("Auto-load failed", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitial();
  }, []);

  // Auto-save shifts when they change
  useEffect(() => {
    // Skip saving if shifts is empty and we are still loading, to prevent overwriting with empty
    if (isLoading) return;
    if (Object.keys(shifts).length === 0) return;

    const timeoutId = setTimeout(async () => {
      try {
        setIsSaving(true);
        const res = await fetch('/api/shifts/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(shifts)
        });
        if (!res.ok) console.error('Σφάλμα αυτόματης αποθήκευσης');
      } catch (err) {
        console.error("Auto-save failed", err);
      } finally {
        setIsSaving(false);
      }
    }, 2000); // Debounce auto-save by 2 seconds

    return () => clearTimeout(timeoutId);
  }, [shifts, isLoading]);

  // Generate stacked weeks blocks ensuring complete Mon-Sun chunks
  const getWeeksBlocks = (startStr: string, endStr: string): string[][] => {
    if (!startStr || !endStr) return [];
    const start = parseDateRobust(startStr);
    const end = parseDateRobust(endStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return [];

    // Adjust start to Monday
    const startDay = start.getDay();
    const startDiff = startDay === 0 ? -6 : 1 - startDay;
    const realStart = new Date(start);
    realStart.setDate(realStart.getDate() + startDiff);

    // Adjust end to Sunday
    const endDay = end.getDay();
    const endDiff = endDay === 0 ? 0 : 7 - endDay;
    const realEnd = new Date(end);
    realEnd.setDate(realEnd.getDate() + endDiff);

    const weeks: string[][] = [];
    let currentWeek: string[] = [];
    const curr = new Date(realStart);

    while (curr <= realEnd) {
      currentWeek.push(formatDateStr(curr));
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      curr.setDate(curr.getDate() + 1);
    }
    return weeks;
  };

  const weeksBlocks = getWeeksBlocks(startDate, endDate);

  const handleToggleStaff = (employee: string) => {
    if (!activeCell) return;
    const { dateStr, category } = activeCell;

    setShifts((prev) => {
      const dayData = prev[dateStr] || {
        "ΠΡΩΙ": [],
        "ΑΠΟΓΕΥΜΑ": [],
        "ΡΕΠΟ": [],
        "ΑΔΕΙΑ": [],
        "ΓΡΑΦΕΙΟ": [],
      };

      const currentList = dayData[category] || [];
      const exists = currentList.includes(employee);

      if (exists) {
        return {
          ...prev,
          [dateStr]: {
            ...dayData,
            [category]: currentList.filter((e) => e !== employee),
          },
        };
      } else {
        // Enforce maximum 1 category per day: remove employee from all other categories on this date
        const cleanedDayData: Record<Category, string[]> = {
          "ΠΡΩΙ": (dayData["ΠΡΩΙ"] || []).filter((e) => e !== employee),
          "ΑΠΟΓΕΥΜΑ": (dayData["ΑΠΟΓΕΥΜΑ"] || []).filter((e) => e !== employee),
          "ΡΕΠΟ": (dayData["ΡΕΠΟ"] || []).filter((e) => e !== employee),
          "ΑΔΕΙΑ": (dayData["ΑΔΕΙΑ"] || []).filter((e) => e !== employee),
          "ΓΡΑΦΕΙΟ": (dayData["ΓΡΑΦΕΙΟ"] || []).filter((e) => e !== employee),
        };

        return {
          ...prev,
          [dateStr]: {
            ...cleanedDayData,
            [category]: [...cleanedDayData[category], employee],
          },
        };
      }
    });
  };

  const handleRemoveStaff = (e: React.MouseEvent, dateStr: string, category: Category, employee: string) => {
    e.stopPropagation(); // Prevent opening modal
    setShifts((prev) => {
      const dayData = prev[dateStr];
      if (!dayData) return prev;
      const currentList = dayData[category] || [];
      return {
        ...prev,
        [dateStr]: {
          ...dayData,
          [category]: currentList.filter((emp) => emp !== employee),
        },
      };
    });
  };

  const handleReset = () => {
    if (confirm("Είστε σίγουροι ότι θέλετε να καθαρίσετε όλο το πρόγραμμα;")) {
      setShifts({});
    }
  };

  // --- EXCEL EXPORT ---
  const handleExportExcel = async () => {
    if (weeksBlocks.length === 0) {
      alert("Δεν υπάρχουν εβδομάδες για εξαγωγή!");
      return;
    }

    const getArgbColor = (hex: string) => {
      return "FF" + hex.replace("#", "").toUpperCase();
    };

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Shifts", {
      views: [{ showGridLines: true }]
    });

    // Apply gorgeous layout column widths
    ws.columns = [
      { width: 18 }, // Category col
      { width: 26 }, // Mon
      { width: 26 }, // Tue
      { width: 26 }, // Wed
      { width: 26 }, // Thu
      { width: 26 }, // Fri
      { width: 26 }, // Sat
      { width: 26 }, // Sun
    ];

    weeksBlocks.forEach((weekDates) => {
      // Row A: Day Header Names
      const headerRow1 = ws.addRow(["", ...DAY_NAMES_HEADERS]);
      // Row B: Dates DD/MM/YYYY
      const headerRow2 = ws.addRow([
        "",
        ...weekDates.map((ds) => {
          const parts = ds.split("-");
          return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }),
      ]);

      headerRow1.height = 22;
      headerRow2.height = 20;

      // Style Week Header rows
      for (let c = 1; c <= 8; c++) {
        const cell1 = headerRow1.getCell(c);
        const cell2 = headerRow2.getCell(c);

        const fillStyle: ExcelJS.Fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF1E293B" } // slick dark slate header
        };

        cell1.fill = fillStyle;
        cell2.fill = fillStyle;

        cell1.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
        cell2.font = { name: "Arial", size: 9, bold: false, color: { argb: "FF94A3B8" } };

        cell1.alignment = { vertical: "middle", horizontal: "center" };
        cell2.alignment = { vertical: "middle", horizontal: "center" };

        const borderStyle: Partial<ExcelJS.Borders> = {
          left: { style: "thin", color: { argb: "FF334155" } },
          right: { style: "thin", color: { argb: "FF334155" } },
          top: { style: "thin", color: { argb: "FF334155" } },
          bottom: { style: "thin", color: { argb: "FF334155" } },
        };
        cell1.border = borderStyle;
        cell2.border = borderStyle;
      }

      // Data Rows: Shift Categories
      CATEGORIES.forEach((cat) => {
        // Find the maximum number of staff assigned on any day in this week for this category
        const lengths = weekDates.map((ds) => shifts[ds]?.[cat]?.length || 0);
        const maxStaff = Math.max(1, ...lengths);

        const startRowIdx = ws.rowCount + 1;

        for (let subRow = 0; subRow < maxStaff; subRow++) {
          const rowValues = [
            subRow === 0 ? cat : "",
            ...weekDates.map((ds) => {
              const staffList = shifts[ds]?.[cat] || [];
              return staffList[subRow] || "";
            }),
          ];
          const dataRow = ws.addRow(rowValues);
          dataRow.height = 30; // excellent timeline bar height

          // Style Category column cell
          const catCell = dataRow.getCell(1);
          catCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF1F5F9" }
          };
          catCell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FF0F172A" } };
          catCell.alignment = { vertical: "middle", horizontal: "center" };
          catCell.border = {
            left: { style: "thin", color: { argb: "FFCBD5E1" } },
            right: { style: "thin", color: { argb: "FFCBD5E1" } },
            top: { style: "thin", color: { argb: "FFCBD5E1" } },
            bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
          };

          // Style staff cells
          weekDates.forEach((ds, dIdx) => {
            const colNum = dIdx + 2;
            const cell = dataRow.getCell(colNum);
            const staffList = shifts[ds]?.[cat] || [];
            const emp = staffList[subRow];

            let bgColor = "FFFFFFFF";
            let txtColor = "FF334155";
            let isBold = false;

            if (emp) {
              const colorObj = EMPLOYEE_COLORS[emp];
              if (colorObj) {
                bgColor = getArgbColor(colorObj.bg);
                txtColor = getArgbColor(colorObj.text);
                isBold = true;
              }
            }

            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: bgColor }
            };
            cell.font = { name: "Arial", size: 10, bold: isBold, color: { argb: txtColor } };
            cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
            cell.border = {
              left: { style: "thin", color: { argb: "FFE2E8F0" } },
              right: { style: "thin", color: { argb: "FFE2E8F0" } },
              top: { style: "thin", color: { argb: "FFE2E8F0" } },
              bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
            };
          });
        }

        const endRowIdx = ws.rowCount;
        if (endRowIdx > startRowIdx) {
          ws.mergeCells(startRowIdx, 1, endRowIdx, 1);
        }
      });

      // Spacers between stacked weeks blocks
      ws.addRow([]);
      ws.addRow([]);
    });

    // Write file using file-saver
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, `Shifts_Schedule_${startDate}_to_${endDate}.xlsx`);
  };

  // --- ICAL EXPORT ---
  const handleExportICal = () => {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//AFC Reports//Shifts Schedule//EL",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH"
    ];

    const now = new Date();
    const dtstamp = now.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    let eventCount = 0;

    Object.entries(shifts).forEach(([ds, dayCategories]) => {
      const parts = ds.split("-");
      if (parts.length !== 3) return;

      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);

      const dtstart = `${parts[0]}${parts[1]}${parts[2]}`;

      // End date for VALUE=DATE all-day event must be the next day
      const nextDateObj = new Date(year, month, day + 1);
      const nYear = String(nextDateObj.getFullYear());
      const nMonth = String(nextDateObj.getMonth() + 1).padStart(2, "0");
      const nDay = String(nextDateObj.getDate()).padStart(2, "0");
      const dtend = `${nYear}${nMonth}${nDay}`;

      CATEGORIES.forEach((cat) => {
        const staffList = dayCategories[cat] || [];
        staffList.forEach((emp) => {
          eventCount++;
          const uid = `afc-shift-${ds}-${cat}-${emp.replace(/\s+/g, "-")}-${eventCount}@afc-reports`;

          let dtStartLine = "";
          let dtEndLine = "";
          let summaryLine = "";

          if (cat === "ΠΡΩΙ") {
            dtStartLine = `DTSTART:${dtstart}T080000`;
            dtEndLine = `DTEND:${dtstart}T160000`;
            summaryLine = `SUMMARY:${emp}`;
          } else if (cat === "ΑΠΟΓΕΥΜΑ") {
            dtStartLine = `DTSTART:${dtstart}T150000`;
            dtEndLine = `DTEND:${dtstart}T230000`;
            summaryLine = `SUMMARY:${emp}`;
          } else if (cat === "ΓΡΑΦΕΙΟ") {
            dtStartLine = `DTSTART:${dtstart}T080000`;
            dtEndLine = `DTEND:${dtstart}T160000`;
            summaryLine = `SUMMARY:ΓΡΑΦΕΙΟ - ${emp}`;
          } else {
            // ΡΕΠΟ or ΑΔΕΙΑ: All-day events
            dtStartLine = `DTSTART;VALUE=DATE:${dtstart}`;
            dtEndLine = `DTEND;VALUE=DATE:${dtend}`;
            summaryLine = `SUMMARY:${cat} - ${emp}`;
          }

          icsContent.push(
            "BEGIN:VEVENT",
            `UID:${uid}`,
            `DTSTAMP:${dtstamp}`,
            dtStartLine,
            dtEndLine,
            summaryLine,
            "DESCRIPTION:Πρόγραμμα Βαρδιών AFC",
            "END:VEVENT"
          );
        });
      });
    });

    icsContent.push("END:VCALENDAR");

    if (eventCount === 0) {
      alert("Δεν υπάρχουν καταχωρημένες βάρδιες για εξαγωγή!");
      return;
    }

    // Join lines with CRLF as required by RFC 5545
    const fileContent = icsContent.join("\r\n");
    const blob = new Blob([fileContent], { type: "text/calendar;charset=utf-8" });
    saveAs(blob, `Shifts_Schedule_${startDate}_to_${endDate}.ics`);
  };

  // --- EXCEL IMPORT ---
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as unknown[][];

        const newShifts: Record<string, Record<Category, string[]>> = {};
        const extractedDates: string[] = [];

        // Check metadata row for original date range
        let parsedStart = "";
        let parsedEnd = "";
        if (rows[0] && typeof rows[0][1] === "string" && rows[0][1].includes("Διάστημα:")) {
          const matches = rows[0][1].match(/(\d{4}-\d{2}-\d{2})/g);
          if (matches) {
            if (matches.length >= 2) {
              parsedStart = matches[0];
              parsedEnd = matches[1];
            }
          }
        }

        for (let r = 0; r < rows.length; r++) {
          const row = rows[r];
          if (!row) continue;

          // Detect weekly block starting header
          if (row[1] === "ΔΕΥΤΕΡΑ") {
            const dateRow = rows[r + 1];
            if (!dateRow) continue;

            const currentWeekDates: string[] = [];
            for (let col = 1; col <= 7; col++) {
              const cellVal = dateRow[col];
              if (typeof cellVal === "string") {
                const parts = cellVal.split("/");
                if (parts.length === 3) {
                  const ds = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
                  currentWeekDates.push(ds);
                  extractedDates.push(ds);
                }
              }
            }

            let currentCat: Category | null = null;
            // Scan all subsequent rows below the date row until the next weekly block or empty section
            for (let scanR = r + 2; scanR < rows.length; scanR++) {
              const scanRow = rows[scanR];
              if (!scanRow) continue;

              // If we hit the next week block header or an interval header, stop scanning for this week
              if (
                scanRow[1] === "ΔΕΥΤΕΡΑ" ||
                (typeof scanRow[1] === "string" && scanRow[1].includes("Διάστημα:"))
              ) {
                break;
              }

              // Check if column 0 defines a new shift category
              const possibleCat = scanRow[0] as Category;
              if (CATEGORIES.includes(possibleCat)) {
                currentCat = possibleCat;
              }

              // If we have an active category context, read staff assignments for each day
              if (currentCat) {
                const activeCat: Category = currentCat;
                currentWeekDates.forEach((ds, idx) => {
                  const cellVal = scanRow[idx + 1];
                  if (!newShifts[ds]) {
                    newShifts[ds] = {
                      "ΠΡΩΙ": [],
                      "ΑΠΟΓΕΥΜΑ": [],
                      "ΡΕΠΟ": [],
                      "ΑΔΕΙΑ": [],
                      "ΓΡΑΦΕΙΟ": [],
                    };
                  }
                  if (typeof cellVal === "string" && cellVal.trim().length > 0) {
                    const empName = cellVal.trim();
                    if (!newShifts[ds][activeCat].includes(empName)) {
                      newShifts[ds][activeCat].push(empName);
                    }
                  }
                });
              }
            }
          }
        }

        if (extractedDates.length > 0) {
          extractedDates.sort();
          setStartDate(parsedStart ? parsedStart : extractedDates[0]);
          setEndDate(parsedEnd ? parsedEnd : extractedDates[extractedDates.length - 1]);
          setShifts(newShifts);
          alert("Το πρόγραμμα φορτώθηκε επιτυχώς από το Excel!");
        } else {
          alert("Δεν βρέθηκαν έγκυρα δεδομένα εβδομάδων στο αρχείο Excel.");
        }
      } catch (err) {
        console.error(err);
        alert("Σφάλμα κατά την ανάγνωση του αρχείου Excel.");
      }
      // Reset file input
      e.target.value = "";
    };
    reader.readAsBinaryString(file);
  };

  // Helper to format date display nicely e.g. 18/05
  const formatDisplayDate = (ds: string) => {
    const parts = ds.split("-");
    if (parts.length !== 3) return ds;
    return `${parts[2]}/${parts[1]}`;
  };

  return (
    <div className={styles.container}>
      {/* Header Controls */}
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.titleArea}>
            <button
              onClick={() => router.push("/")}
              className={styles.backBtn}
              title="Επιστροφή στην Αρχική"
            >
              <ArrowLeft size={20} />
            </button>
            <Calendar size={28} color="var(--primary)" />
            <h1>Πρόγραμμα Βαρδιών AFC</h1>
          </div>

          <div className={styles.actions}>
            <button onClick={handleExportExcel} className={styles.btnExport}>
              <Download size={18} />
              <span>Export Excel</span>
            </button>

            <button onClick={handleExportICal} className={styles.btnICal} title="Εξαγωγή σε Google/Apple Calendar">
              <Download size={18} />
              <span>Export iCal</span>
            </button>

            <label className={styles.btnImportLabel}>
              <Upload size={18} />
              <span>Import Excel</span>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleImportExcel}
                className={styles.hiddenInput}
              />
            </label>

            <button onClick={handleReset} className={styles.btnReset} title="Καθαρισμός">
              <RotateCcw size={18} />
              <span>Reset</span>
            </button>
            
            {/* Auto-save status indicator */}
            {isSaving && (
              <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: "4px" }}>
                <CloudUpload size={14} className="animate-pulse" />
                Αποθήκευση...
              </span>
            )}
          </div>
        </div>

        <div className={styles.controls}>
          <div className={styles.dateGroup}>
            <label>Από:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={styles.dateInput}
            />
          </div>

          <div className={styles.dateGroup}>
            <label>Έως:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={styles.dateInput}
            />
          </div>
        </div>
      </header>

      {/* Stacked Weeks Layout */}
      <div className={styles.weeksContainer}>
        {weeksBlocks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--secondary)" }}>
            Παρακαλώ επιλέξτε ένα έγκυρο ημερολογιακό διάστημα.
          </div>
        ) : null}

        {weeksBlocks.map((weekDates, wIdx) => {
          const weekStartDisp = formatDisplayDate(weekDates[0]);
          const weekEndDisp = formatDisplayDate(weekDates[weekDates.length - 1]);

          return (
            <div key={wIdx} className={styles.weekBlock}>
              <div className={styles.weekHeaderBar}>
                <span>Εβδομάδα {wIdx + 1}</span>
                <span style={{ fontSize: "0.85rem", fontWeight: "normal" }}>
                  ({weekStartDisp} - {weekEndDisp})
                </span>
              </div>

              {/* Employee Unassigned Days Counters */}
              <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                padding: "8px 16px",
                backgroundColor: "var(--bg-secondary)",
                borderBottom: "1px solid var(--border-color)",
                alignItems: "center"
              }}>
                <span style={{ fontSize: "0.75rem", color: "var(--secondary)", fontWeight: 600, marginRight: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Υπολοιπο:
                </span>
                {EMPLOYEES.map((emp) => {
                  const empColor = EMPLOYEE_COLORS[emp] || { bg: "var(--primary)", text: "#ffffff" };
                  const coveredDaysCount = weekDates.filter((ds) => {
                    const dayShifts = shifts[ds] || {};
                    return Object.values(dayShifts).some((staffList) => staffList.includes(emp));
                  }).length;
                  const daysWithoutShift = 7 - coveredDaysCount;

                  return (
                    <div
                      key={emp}
                      draggable
                      onDragStart={(e) => {
                        e.stopPropagation();
                        setDraggedEmployee(emp);
                        setIsFillDrag(false);
                      }}
                      onDragEnd={() => {
                        setDraggedEmployee(null);
                        setIsFillDrag(false);
                      }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        backgroundColor: empColor.bg,
                        color: empColor.text,
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
                        cursor: "grab"
                      }}
                      title={`Σύρετε (drag) τον ${emp} σε ένα κελί για προσθήκη (${daysWithoutShift} ημέρες χωρίς βάρδια)`}
                    >
                      <span>{emp.split(" ")[0]}</span>
                      <span style={{
                        backgroundColor: "rgba(0, 0, 0, 0.2)",
                        color: empColor.text,
                        padding: "1px 6px",
                        borderRadius: "10px",
                        fontSize: "0.75rem",
                        minWidth: "14px",
                        textAlign: "center"
                      }}>
                        {daysWithoutShift}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className={styles.tableWrapper}>
                <table className={styles.weekTable}>
                  <thead>
                    <tr>
                      <th className={styles.th} style={{ width: "110px" }}></th>
                      {weekDates.map((ds, dIdx) => {
                        const isWeekend = dIdx === 5 ? true : dIdx === 6 ? true : false;
                        return (
                          <th
                            key={ds}
                            className={`${styles.th} ${isWeekend ? styles.thWeekend : ""}`}
                          >
                            <div className={styles.thDayName}>{DAY_NAMES_DISPLAY[dIdx]}</div>
                            <div className={styles.thDate}>{formatDisplayDate(ds)}</div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {CATEGORIES.map((cat) => (
                      <tr key={cat}>
                        <td className={styles.categoryCell}>{cat}</td>
                        {weekDates.map((ds, dIdx) => {
                          const isWeekend = dIdx === 5 ? true : dIdx === 6 ? true : false;
                          const selectedStaff = shifts[ds]?.[cat] || [];

                          return (
                            <td
                              key={ds}
                              className={`${styles.td} ${isWeekend ? styles.tdWeekend : ""}`}
                              onClick={() => setActiveCell({ dateStr: ds, category: cat })}
                              onDragOver={(e) => e.preventDefault()}
                              onDragEnter={() => {
                                if (draggedEmployee && isFillDrag) {
                                  setShifts((prev) => {
                                    const dayData = prev[ds] || {
                                      "ΠΡΩΙ": [],
                                      "ΑΠΟΓΕΥΜΑ": [],
                                      "ΡΕΠΟ": [],
                                      "ΑΔΕΙΑ": [],
                                      "ΓΡΑΦΕΙΟ": [],
                                    };
                                    const currentList = dayData[cat] || [];
                                    if (currentList.includes(draggedEmployee)) {
                                      return prev;
                                    }
                                    const cleanedDayData: Record<Category, string[]> = {
                                      "ΠΡΩΙ": (dayData["ΠΡΩΙ"] || []).filter((e) => e !== draggedEmployee),
                                      "ΑΠΟΓΕΥΜΑ": (dayData["ΑΠΟΓΕΥΜΑ"] || []).filter((e) => e !== draggedEmployee),
                                      "ΡΕΠΟ": (dayData["ΡΕΠΟ"] || []).filter((e) => e !== draggedEmployee),
                                      "ΑΔΕΙΑ": (dayData["ΑΔΕΙΑ"] || []).filter((e) => e !== draggedEmployee),
                                      "ΓΡΑΦΕΙΟ": (dayData["ΓΡΑΦΕΙΟ"] || []).filter((e) => e !== draggedEmployee),
                                    };
                                    return {
                                      ...prev,
                                      [ds]: {
                                        ...cleanedDayData,
                                        [cat]: [...cleanedDayData[cat], draggedEmployee],
                                      },
                                    };
                                  });
                                }
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                if (draggedEmployee) {
                                  setShifts((prev) => {
                                    const dayData = prev[ds] || {
                                      "ΠΡΩΙ": [],
                                      "ΑΠΟΓΕΥΜΑ": [],
                                      "ΡΕΠΟ": [],
                                      "ΑΔΕΙΑ": [],
                                      "ΓΡΑΦΕΙΟ": [],
                                    };
                                    const currentList = dayData[cat] || [];
                                    if (currentList.includes(draggedEmployee)) {
                                      return prev;
                                    }
                                    const cleanedDayData: Record<Category, string[]> = {
                                      "ΠΡΩΙ": (dayData["ΠΡΩΙ"] || []).filter((e) => e !== draggedEmployee),
                                      "ΑΠΟΓΕΥΜΑ": (dayData["ΑΠΟΓΕΥΜΑ"] || []).filter((e) => e !== draggedEmployee),
                                      "ΡΕΠΟ": (dayData["ΡΕΠΟ"] || []).filter((e) => e !== draggedEmployee),
                                      "ΑΔΕΙΑ": (dayData["ΑΔΕΙΑ"] || []).filter((e) => e !== draggedEmployee),
                                      "ΓΡΑΦΕΙΟ": (dayData["ΓΡΑΦΕΙΟ"] || []).filter((e) => e !== draggedEmployee),
                                    };
                                    return {
                                      ...prev,
                                      [ds]: {
                                        ...cleanedDayData,
                                        [cat]: [...cleanedDayData[cat], draggedEmployee],
                                      },
                                    };
                                  });
                                }
                              }}
                            >
                              <div className={styles.cellContent}>
                                {selectedStaff.length === 0 ? (
                                  <div className={styles.emptyPrompt}>
                                    <Plus size={14} style={{ margin: "0 auto" }} />
                                  </div>
                                ) : null}

                                {selectedStaff.map((emp) => {
                                  const empColor = EMPLOYEE_COLORS[emp] || { bg: "var(--primary)", text: "#ffffff" };
                                  return (
                                    <div
                                      key={emp}
                                      style={{
                                        width: "100%",
                                        boxSizing: "border-box",
                                        backgroundColor: empColor.bg,
                                        color: empColor.text,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "4px 4px 4px 8px",
                                        borderRadius: "6px",
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                                        transition: "opacity 0.2s"
                                      }}
                                    >
                                      <div style={{ display: "flex", alignItems: "center", gap: "6px", overflow: "hidden" }}>
                                        <span
                                          style={{
                                            fontSize: "0.8rem",
                                            fontWeight: 600,
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis"
                                          }}
                                          title={emp}
                                        >
                                          {emp.split(" ")[0]}
                                        </span>
                                        <span
                                          className={styles.chipRemove}
                                          style={{ color: "inherit", opacity: 0.8 }}
                                          onClick={(e) => handleRemoveStaff(e, ds, cat, emp)}
                                          title="Αφαίρεση"
                                        >
                                          <X size={10} />
                                        </span>
                                      </div>

                                      <div
                                        draggable
                                        onDragStart={(e) => {
                                          e.stopPropagation();
                                          setDraggedEmployee(emp);
                                          setIsFillDrag(true);
                                        }}
                                        onDragEnd={() => {
                                          setDraggedEmployee(null);
                                          setIsFillDrag(false);
                                        }}
                                        title="Σύρετε (drag) τη λαβή για γέμισμα"
                                        style={{
                                          cursor: "ew-resize",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          padding: "2px 4px",
                                          background: "rgba(0, 0, 0, 0.15)",
                                          borderRadius: "4px",
                                          marginLeft: "4px"
                                        }}
                                      >
                                        <ChevronRight size={14} style={{ opacity: 0.9 }} />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Staff Selector Popup Modal */}
      {activeCell ? (
        <div className={styles.modalOverlay} onClick={() => setActiveCell(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3>Επιλογή Ατόμων</h3>
                <div className={styles.modalSubtitle}>
                  {activeCell.category} - {formatDisplayDate(activeCell.dateStr)}
                </div>
              </div>
              <button className={styles.closeBtn} onClick={() => setActiveCell(null)}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.staffList}>
              {EMPLOYEES.map((emp) => {
                const isSelected = shifts[activeCell.dateStr]?.[activeCell.category]?.includes(emp) ? true : false;
                return (
                  <div
                    key={emp}
                    className={`${styles.staffItem} ${isSelected ? styles.staffItemSelected : ""}`}
                    onClick={() => handleToggleStaff(emp)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          backgroundColor: EMPLOYEE_COLORS[emp]?.bg || "var(--primary)"
                        }}
                      />
                      <span>{emp}</span>
                    </div>
                    <div className={styles.checkboxIcon}>
                      {isSelected ? <Check size={12} color="#fff" /> : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

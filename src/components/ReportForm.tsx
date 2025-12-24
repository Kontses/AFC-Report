"use client";

import React, { useState, useEffect } from "react";
import styles from "./ReportForm.module.css";
import { saveReportLocal, markReportSynced } from "../lib/storage";
import HistoryModal from "./HistoryModal";
import { Save, Send, Pencil } from "lucide-react";

interface ReportFormProps {
  isHistoryOpen: boolean;
  onHistoryClose: () => void;
}

export default function ReportForm({ isHistoryOpen, onHistoryClose }: ReportFormProps) {
  const [formData, setFormData] = useState({
    reportBy: "Emmanouil Kazantzoglou",
    station: "1(NRS)",
    device: "ATIM",
    tag: "",
    status: "Solved",
    alarmCode: "",
    malfunction: "",
    impact: "",
    repairProcess: "",
    assignedTo: "TRAXIS ENGINEERING",
    finalResult: ["OK"],
    comments: "",
    reportedDate: "", // stores the ISO or formatted string
  });

  const [autoTime, setAutoTime] = useState(true);
  const [isMultiTag, setIsMultiTag] = useState(false);
  const [multiTags, setMultiTags] = useState("");

  // Edit State
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    // Load saved reporter from local storage
    const savedReporter = localStorage.getItem("lastReporter");
    if (savedReporter) {
      if (!isEditMode) { // Only auto-fill if not editing
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData(prev => ({ ...prev, reportBy: savedReporter }));
      }
    }

    // Load saved station from local storage
    const savedStation = localStorage.getItem("lastStation");
    if (savedStation) {
      if (!isEditMode) {
        setFormData(prev => ({ ...prev, station: savedStation }));
      }
    }
  }, [isEditMode]);

  // Auto-fill Rules
  const ALARM_RULES: Record<string, Partial<typeof formData>> = {
    // ---------> COIN PARTS ALARMS <---------
    "MPP 104": {
      malfunction: "Coin Payment: Coinbox Full",
      repairProcess: "Needs ΤΗΕΜΑ",
      assignedTo: "THEMA",
      status: "Rejected",
      finalResult: ["Only Accepts Banknotes", "Only Accepts Card"]
    },
    "MPP 101": {
      malfunction: "Coin Payment: Coinbox Failure",
      repairProcess: "Test Coin parts",
      assignedTo: "TRAXIS ENGINEERING",
      status: "Solved",
      finalResult: ["OK"]
    },
    "MPP 011": {
      malfunction: "Coin Payment: Coin Acceptor Failure",
      repairProcess: "Test Coin parts",
      assignedTo: "TRAXIS ENGINEERING",
      status: "Solved",
      finalResult: ["OK"]
    },
    "MPP 105": {
      malfunction: "Coin Payment: Unauthorized Cashbox Withdrawal",
      repairProcess: "Needs ΤΗΕΜΑ",
      assignedTo: "THEMA",
      status: "Rejected",
      finalResult: ["Only Accepts Banknotes", "Only Accepts Card"]
    },
    "MPP 214": {
      malfunction: "Coin reserve 1: Exchanged outside of the procedure",
      repairProcess: "Needs ΤΗΕΜΑ",
      assignedTo: "THEMA",
      status: "Rejected",
      finalResult: ["Only Accepts Banknotes", "Only Accepts Card"]
    },
    "MPP 234": {
      malfunction: "Coin reserve 2: Exchanged outside of the procedure",
      repairProcess: "Needs ΤΗΕΜΑ",
      assignedTo: "THEMA",
      status: "Rejected",
      finalResult: ["Only Accepts Banknotes", "Only Accepts Card"]
    },
    "MPP 701": {
      malfunction: "Coin payment : Deactivation",
      repairProcess: "Putting coin payment in service from SSUP",
      assignedTo: "TRAXIS ENGINEERING",
      status: "Solved",
      finalResult: ["OK"]
    },
    // ---------> BANKNOTE PARTS ALARMS <---------
    "APB 001": {
      malfunction: "Banknote Acceptance Faulty",
      repairProcess: "Removing the jammed banknotes and restart",
      assignedTo: "TRAXIS ENGINEERING",
      status: "Solved",
      finalResult: ["OK"]
    },
    "RPB 105": {
      malfunction: "Banknote Cashbox: Unauthorized Withdrawal",
      repairProcess: "Needs ΤΗΕΜΑ",
      assignedTo: "THEMA",
      status: "Rejected",
      finalResult: ["Only Accepts Coins", "Only Accepts Card"]
    },
    "RPB 601": {
      malfunction: "Banknote Payment: Communication Error",
      repairProcess: "Removing the jammed banknotes and restart",
      assignedTo: "TRAXIS ENGINEERING",
      status: "Solved",
      finalResult: ["OK"]
    },
    "RPB 701": {
      malfunction: "Banknote Payment: Local/Remote Out Of Order",
      repairProcess: "Putting banknote payment in service from SSUP",
      assignedTo: "TRAXIS ENGINEERING",
      status: "Solved",
      finalResult: ["OK"]
    },
    // ---------> TICKET-RECEIPT PRINTER ALARMS <---------
    "MIC 001": {
      malfunction: "E-Ticket Distribution: KO",
      repairProcess: "Cleaning Printer, delete css.bin, Restart",
      assignedTo: "TRAXIS ENGINEERING",
      status: "Solved",
      finalResult: ["OK"]
    },
    "MIC 007": {
      malfunction: "E- Ticket distribution : Reading/Writing failure",
      repairProcess: "Cleaning Printer, delete, css.bin Restart",
      assignedTo: "TRAXIS ENGINEERING",
      status: "Solved",
      finalResult: ["OK"]
    },
    "EIC 100": {
      malfunction: "E-Ticket distribution : Completely empty",
      repairProcess: "Needs ΤΗΕΜΑ",
      assignedTo: "THEMA",
      status: "Rejected",
      finalResult: ["OK"]
    },
    "EIR 003": {
      malfunction: "Paper empty",
      repairProcess: "Needs ΤΗΕΜΑ",
      assignedTo: "THEMA",
      status: "Rejected",
      finalResult: ["OK"]
    },
    "MIR 004": {
      malfunction: "Printer Jamming",
      repairProcess: "Testing the receipt printer",
      assignedTo: "TRAXIS ENGINEERING",
      status: "Solved",
      finalResult: ["OK"]
    },
    // ---------> POS ALARMS <---------
    "MBB 003": {
      malfunction: "Payment Module is Busy",
      repairProcess: "Acknowledged Alarm and Red Button",
      assignedTo: "TRAXIS ENGINEERING",
      status: "Solved",
      finalResult: ["OK"]
    },
    "MBB 601": {
      malfunction: "Connection Card Ko",
      repairProcess: "Restart",
      assignedTo: "TRAXIS ENGINEERING",
      status: "Solved",
      finalResult: ["OK"]
    },
    // ---------> GENERAL ALARMS <---------
    "AEQ 024": {
      malfunction: "Put The System Out of Order by SSUP",
      repairProcess: "Unknown",
      assignedTo: "TRAXIS ENGINEERING",
      status: "Solved",
      finalResult: ["OK"]
    },
    "AEQ 031": {
      malfunction: "Out Of Service Done By Agent",
      repairProcess: "Unknown",
      assignedTo: "TRAXIS ENGINEERING",
      status: "Solved",
      finalResult: ["OK"]
    },
    "AEQ 062": {
      malfunction: "SSUP Default",
      repairProcess: "AFA002",
      assignedTo: "TRAXIS ENGINEERING",
      status: "Solved",
      finalResult: ["OK"]
    },
    "ART 13": {
      malfunction: "Forgot card",
      repairProcess: "Opening and closing Atim",
      assignedTo: "TRAXIS ENGINEERING",
      status: "Solved",
      finalResult: ["OK"]
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      let newData = { ...prev, [name]: value };

      // Auto-fill logic based on Alarm Code
      if (name === "alarmCode" && ALARM_RULES[value]) {
        const rule = ALARM_RULES[value];
        newData = { ...newData, ...rule };
      }

      // Device switch logic: clear incompatible fields
      if (name === "device") {
        if (value !== "GATE") {
          newData.impact = ""; // Clear Impact if not GATE
        }
        if (value !== "ATIM") {
          newData.alarmCode = ""; // Clear Alarm Code if not ATIM
        }
      }

      // Save persistent fields to local storage (only if not editing)
      if (!isEditMode) {
        if (name === "reportBy") {
          localStorage.setItem("lastReporter", value);
        }
        if (name === "station") {
          localStorage.setItem("lastStation", value);
        }
      }

      return newData;
    });
  };

  useEffect(() => {
    // Live Clock for Auto Mode
    if (autoTime && !isEditMode) {
      const updateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        const newTime = now.toISOString().slice(0, 16);

        setFormData(prev => {
          if (prev.reportedDate !== newTime) {
            return { ...prev, reportedDate: newTime };
          }
          return prev;
        });
      };

      updateTime(); // Update immediately
      const interval = setInterval(updateTime, 1000); // Update every second

      return () => clearInterval(interval);
    }
  }, [autoTime, isEditMode]);

  const handleAutoTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isEditMode) return; // Prevent changing auto mode during edit
    const isChecked = e.target.checked;
    setAutoTime(isChecked);

    if (isChecked) {
      // Set current local time immediately
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setFormData(prev => ({ ...prev, reportedDate: now.toISOString().slice(0, 16) }));
    }
  };

  const handleFinalResultToggle = (value: string) => {
    setFormData(prev => {
      let current = prev.finalResult;

      if (current.includes(value)) {
        // Remove if present
        current = current.filter(item => item !== value);
      } else {
        // Add
        current = [...current, value];

        // Mutual exclusivity logic: OK and Out of service cannot coexist
        if (value === "OK") {
          current = current.filter(item => item !== "Out of service");
        }
        if (value === "Out of service") {
          current = current.filter(item => item !== "OK");
        }
      }

      return { ...prev, finalResult: current };
    });
  };

  // --- History & Edit Logic ---

  const handleEditReport = (report: any) => {
    // Map API/Excel keys to form keys

    const mappedData = {
      reportBy: report["Reported By"] || report.reportBy || "",
      station: report["Station"] || report.station || "",
      device: report["Device"] || report.device || "ATIM",
      tag: report["Tag"] || report.tag || "",
      status: report["Status"] || report.status || "Solved",
      alarmCode: report["Alarm Code"] || report.alarmCode || "",
      malfunction: report["Malfunction"] || report.malfunction || "",
      impact: report["Impact"] || report.impact || "",
      repairProcess: report["Repair Process"] || report.repairProcess || "",
      assignedTo: report["Assigned To"] || report.assignedTo || "TRAXIS ENGINEERING",
      finalResult: (report["Final Result"] || report.finalResult || "OK").split(", "),
      comments: report["Comments"] || report.comments || "",
      reportedDate: ""
    };

    // Handle Date 
    let dateVal = report["Date"] || report["reportedDate"];
    if (dateVal) {
      try {
        const d = new Date(dateVal);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        mappedData.reportedDate = d.toISOString().slice(0, 16);
      } catch (e) {
        console.error("Date parse error", e);
        mappedData.reportedDate = "";
      }
    }

    setFormData(mappedData);
    setIsEditMode(true);
    setAutoTime(false); // Disable auto-time to keep original date
    setIsMultiTag(false); // Simplify to single tag mode for edit
    onHistoryClose(); // Close modal using prop

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    if (confirm("Cancel editing? Unsaved changes will be lost.")) {
      setIsEditMode(false);
      setAutoTime(true);
      // Reset form to defaults or handle as needed
      setFormData(prev => ({
        ...prev,
        tag: "",
        alarmCode: "",
        malfunction: "",
        comments: "",
        repairProcess: "",
        finalResult: ["OK"],
        // Keep station/reporter maybe?
      }));
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Tags processing
      let tagsToSubmit: string[] = [];

      if (isMultiTag) {
        tagsToSubmit = multiTags.split(',')
          .map(t => t.trim())
          .filter(t => t.length > 0);

        if (tagsToSubmit.length === 0) {
          alert("Please enter at least one tag.");
          setIsSubmitting(false);
          return;
        }
      } else {
        if (!formData.tag) {
          alert("Please provide a Tag.");
          setIsSubmitting(false);
          return;
        }
        tagsToSubmit = [formData.tag];
      }

      // Determine final timestamp
      let finalDate = new Date();
      if (!autoTime && formData.reportedDate) {
        finalDate = new Date(formData.reportedDate);
      }

      // Format to Greek locale
      const formattedDate = finalDate.toLocaleString('el-GR', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
        .replace(/pm|μμ/i, 'μ.μ.')
        .replace(/am|πμ/i, 'π.μ.');

      // Submit for each tag
      let successCount = 0;

      const currentEditor = localStorage.getItem("lastReporter") || "Unknown Engineer";

      for (const tag of tagsToSubmit) {

        let commentsFinal = formData.comments;
        if (isEditMode) {
          commentsFinal += ` - Edited by ${currentEditor}`;
        }

        const submissionData = {
          ...formData,
          tag: tag,
          comments: commentsFinal,
          finalResult: formData.finalResult.join(", "),
          reportedDate: formattedDate
        };

        console.log(`Submitting report for Tag ${tag}:`, submissionData);
        saveReportLocal(submissionData);
        successCount++;
      }

      // Trigger sync
      window.dispatchEvent(new Event('sync-trigger'));

      const msg = isEditMode
        ? "Report Correction Submitted! 📝 (Pending Sync)"
        : (successCount > 1 ? `${successCount} Reports Saved to Queue! 📨` : "Report Saved to Queue! 📨");

      alert(msg);

      // Reset form
      setIsEditMode(false);
      setAutoTime(true); // Re-enable auto time
      setFormData(prev => ({
        ...prev,
        tag: "",
        alarmCode: "",
        comments: "",
        malfunction: "",
        repairProcess: "",
        finalResult: ["OK"],
        reportedDate: ""
      }));
      setMultiTags("");

    } catch (error) {
      console.error("Failed to save", error);
      alert("Error saving report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: "relative" }}>

      {/* Form Title Change if Editing */}
      {isEditMode && (
        <div style={{
          background: "#fff7ed", border: "1px solid #fdba74", color: "#c2410c",
          padding: "0.75rem", borderRadius: "8px", marginBottom: "1.5rem",
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "bold" }}>
            <Pencil size={18} />
            Editing Report
          </div>
          <button
            onClick={handleCancelEdit}
            style={{ background: "transparent", border: "none", color: "#c2410c", textDecoration: "underline", cursor: "pointer", fontSize: "0.9rem" }}
          >
            Cancel
          </button>
        </div>
      )}

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={onHistoryClose}
        onEdit={handleEditReport}
      />

      <form className={styles.form} onSubmit={handleSubmit}>

        <div className={styles.group}>
          <label htmlFor="reportBy">Report By {isEditMode && "(Locked)"}</label>
          <select
            id="reportBy"
            name="reportBy"
            value={formData.reportBy}
            onChange={handleChange}
            required
            disabled={isEditMode}
            style={isEditMode ? { background: "#f1f5f9", cursor: "not-allowed", opacity: 0.8 } : {}}
          >
            <option value="Emmanouil Kazantzoglou">Emmanouil Kazantzoglou</option>
            <option value="Konstantinos Saltzoglou">Konstantinos Saltzoglou</option>
            <option value="Dimitris Mpazakas">Dimitris Mpazakas</option>
            <option value="Nikos Tsiagkas">Nikos Tsiagkas</option>
            <option value="Kostantinos Andreadis">Kostantinos Andreadis</option>
            <option value="Vassilis Kontses">Vassilis Kontses</option>
          </select>
        </div>

        <div className={styles.group}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label htmlFor="reportedDate" style={{ marginBottom: 0 }}>Date & Time {isEditMode && "(Locked)"}</label>
            <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.3rem', color: isEditMode ? '#94a3b8' : 'var(--primary)' }}>
              <input
                type="checkbox"
                checked={autoTime}
                onChange={handleAutoTimeChange}
                style={{ width: 'auto', margin: 0 }}
                disabled={isEditMode}
              />
              Auto Mode
            </label>
          </div>
          <input
            type="datetime-local"
            id="reportedDate"
            name="reportedDate"
            value={formData.reportedDate}
            onChange={handleChange}
            disabled={autoTime || isEditMode}
            required={!autoTime}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.group}>
            <label htmlFor="station">Station</label>
            <select id="station" name="station" value={formData.station} onChange={handleChange} required>
              <option value="1(NRS)">1(NRS)</option>
              <option value="2(DMK)">2(DMK)</option>
              <option value="3(VNZ)">3(VNZ)</option>
              <option value="4(AGS)">4(AGS)</option>
              <option value="5(SNT)">5(SNT)</option>
              <option value="6(PNP)">6(PNP)</option>
              <option value="7(PPF)">7(PPF)</option>
              <option value="8(EFK)">8(EFK)</option>
              <option value="9(FLM)">9(FLM)</option>
              <option value="10(ANP)">10(ANP)</option>
              <option value="11(MRT)">11(MRT)</option>
              <option value="12(VLG)">12(VLG)</option>
              <option value="13(NEL)">13(NEL)</option>
            </select>
          </div>
          <div className={styles.group}>
            <label htmlFor="device">Device</label>
            <select id="device" name="device" value={formData.device} onChange={handleChange}>
              <option value="ATIM">ATIM</option>
              <option value="GATE">GATE</option>
              <option value="ATLAS">ATLAS</option>
            </select>
          </div>
        </div>

        <div className={styles.group}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label htmlFor="tag">Tag</label>
            <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', cursor: isEditMode ? 'not-allowed' : 'pointer', gap: '0.3rem', color: '#64748b', opacity: isEditMode ? 0.5 : 1 }}>
              <input
                type="checkbox"
                checked={isMultiTag}
                onChange={(e) => {
                  if (isEditMode) return;
                  setIsMultiTag(e.target.checked);
                  if (!e.target.checked) setMultiTags("");
                  else setFormData(prev => ({ ...prev, tag: "" }));
                }}
                style={{ width: 'auto', margin: 0 }}
                disabled={isEditMode}
              />
              Multiple Entry
            </label>
          </div>

          {isMultiTag ? (
            <input
              type="text"
              value={multiTags}
              onChange={(e) => setMultiTags(e.target.value)}
              placeholder="e.g. 1, 2, 3"
              required
            />
          ) : (
            <input
              type="number"
              id="tag"
              name="tag"
              value={formData.tag}
              onChange={handleChange}
              min="1"
              max="999"
              required
            />
          )}
          {isMultiTag && <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Separate tags with commas</div>}
        </div>

        <div className={styles.sectionDivider}></div>

        <div className={styles.row}>
          <div className={styles.group}>
            <label htmlFor="status">Status</label>
            <select id="status" name="status" value={formData.status} onChange={handleChange}>
              <option value="Solved">Solved</option>
              <option value="In Progress">In Progress</option>
              <option value="Rejected">Rejected</option>
              <option value="Out Of Service">Out Of Service</option>
            </select>
          </div>
          <div className={styles.group}></div>
        </div>

        <div className={styles.group}>
          <label htmlFor="alarmCode">Alarm Code</label>
          <input
            type="text"
            id="alarmCode"
            name="alarmCode"
            value={formData.alarmCode}
            onChange={handleChange}
            list="alarmCodes"
            disabled={formData.device !== 'ATIM'}
            placeholder={formData.device !== 'ATIM' ? "N/A" : ""}
          />
          <datalist id="alarmCodes">
            {[
              "No Alarm",
              "ACR 001", "ACR 003", "AEQ 012", "AEQ 024", "AEQ 031", "AEQ 062",
              "AFA 002", "AIC 601", "AIR 003", "Air 006", "APB 001", "ART 013",
              "ART 203", "EIC 100", "EIC 102", "EIC 112", "ETP 006", "MBB 002",
              "MBB 003", "MBB 601", "MIC 001", "MIC 004", "MIC 007", "MIR 004",
              "MPP 011", "MPP 101", "MPP 102", "MPP 104", "MPP 105", "MPP 214",
              "MPP 701", "RPB 104", "RPB 105", "RPB 601", "RPB 701"
            ].map((code) => (
              <option key={code} value={code} />
            ))}
          </datalist>
        </div>

        <div className={styles.group}>
          <label htmlFor="malfunction">Malfunction</label>
          <input
            type="text"
            id="malfunction"
            name="malfunction"
            value={formData.malfunction}
            onChange={handleChange}
            list="malfunctions"
          />
          <datalist id="malfunctions">
            {(() => {
              const COMMON = [
                "Out Of Power",
                "Out of Order on ATLAS",
                "Out Of Service Done By Agent",
                "Reboot By Itself",
                "Screen Freeze"
              ];

              const GATE_ONLY = [
                "After Validation Doors Remain Closed",
                "Broken Gate",
                "Concentrator Link Error",
                "Doors remain open",
                "Incorrect Configuration",
                "Red X",
                "SAM Error",
                "Validator Light Is Off",
                "Validator Link Error",
                "Validator Not Readable",
                "Validator Reboot By Itself"
              ];

              const ATIM_ONLY = [
                "ATIM Has Run Out of Change",
                "Bad Smiley",
                "Banknote Acceptance Faulty",
                "Banknote Cashbox: Full",
                "Banknote Cashbox: Unauthorized Withdrawal",
                "Banknote Payment: Communication Error",
                "Banknote Payment: Local/Remote Out Of Order",
                "CA01:002 Not Initialized",
                "Coin Payment: Coin Acceptor Failure",
                "Coin Payment: Coin Box Missing",
                "Coin Payment: Coinbox Failure",
                "Coin Payment: Coinbox Full",
                "Coin Payment: Deactivation",
                "Coin Payment: Jammed Coins",
                "Coin Payment: Unauthorized Cashbox Withdrawal",
                "CTD Link Failure",
                "Current Status",
                "Default from ATLAS",
                "Eagle Acceptor Issue",
                "Engine Defect",
                "EQ01:024 Outage Supervisory",
                "E-Ticket Distribution: Reading/Writing failure",
                "E-Ticket Distribution: Completely Empty",
                "E-Ticket Distribution: Jamming",
                "E-Ticket Distribution: KO",
                "E-Ticket Distribution: Stock 1 Empty",
                "E-Ticket Distribution: Stock 2 Empty",
                "Frozen POS",
                "Locker Issue",
                "Paper Empty",
                "Payment By Cash HS",
                "Payment Module Connection Error",
                "Payment Module is Busy",
                "Payment is approved Freezing Message",
                "POS Irruption",
                "Printer Jamming",
                "Printer link error",
                "Put The System Out of Order by SSUP",
                "Red light on banknote acceptor",
                "Reserve boxes are missing",
                "SAN Absent",
                "SSUP Default",
                "SSUP Link Failure",
                "Ticket Printer R/W Failure",
                "UPS Defect",
                "Use of banknotes returns to home screen",
                "Use of POS Returns to Home Screen"
              ];

              let optionsToShow: string[] = [];

              if (formData.device === "GATE") {
                optionsToShow = [...GATE_ONLY, ...COMMON];
              } else {
                // ATIM and others
                optionsToShow = [...ATIM_ONLY, ...COMMON];
              }

              // Sort Alphabetically
              optionsToShow = optionsToShow.sort();

              return optionsToShow.map((item) => (
                <option key={item} value={item} />
              ));
            })()}
          </datalist>
        </div>

        <div className={styles.group}>
          <label htmlFor="impact">Impact of Malfunction</label>
          <input
            type="text"
            id="impact"
            name="impact"
            value={formData.impact}
            onChange={handleChange}
            list="impacts"
            disabled={formData.device !== 'GATE'}
            placeholder={formData.device !== 'GATE' ? "N/A" : ""}
          />
          <datalist id="impacts">
            {[
              "No Entry",
              "No Entry/Exit",
              "No Exit",
              "Unauthorized Entry/Exit"
            ].map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </div>

        <div className={styles.group}>
          <label htmlFor="repairProcess">Repair Process</label>
          <input
            type="text"
            id="repairProcess"
            name="repairProcess"
            value={formData.repairProcess}
            onChange={handleChange}
            list="repairProcesses"
          />
          <datalist id="repairProcesses">
            {[
              "Acknowledged Alarm and Red Button",
              "AFA002",
              "Broken recycle",
              "Clean Sim Card",
              "Cleaning Printer, delete css.bin, Restart",
              "Concentration call",
              "Needs Conduent",
              "Needs ΤΗΕΜΑ",
              "Opening ATIM and closing",
              "Put USB",
              "Putting in service by SSUP",
              "Putting the banknote payment in service",
              "Reinstall Software",
              "Removing the jammed banknotes and restart",
              "Reset",
              "Restart",
              "Shutdown/Startup",
              "Test Coin parts",
              "Test the coin parts restart",
              "Testing the receipt printer",
              "Unplug X1"
            ].map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </div>

        <div className={styles.group}>
          <label htmlFor="assignedTo">Assigned To</label>
          <select id="assignedTo" name="assignedTo" value={formData.assignedTo} onChange={handleChange}>
            <option value="TRAXIS ENGINEERING">TRAXIS ENGINEERING</option>
            <option value="THEMA">THEMA</option>
            <option value="Conduent">Conduent</option>
          </select>
        </div>

        <div className={styles.group}>
          <label>Final Result</label>
          <div className={styles.chipContainer}>
            {[
              "OK",
              "Out of Service",
              "Only Accepts Card",
              "Only Accepts Coins",
              "Only Accepts Banknotes"
            ].map(opt => {
              // Logic to disable specific options for GATE
              const isGate = formData.device === 'GATE';
              const restrictedOptions = ["Only Accepts Card", "Only Accepts Coins", "Only Accepts Banknotes"];
              const isDisabled = isGate && restrictedOptions.includes(opt);

              return (
                <div
                  key={opt}
                  className={`
                    ${styles.chip} 
                    ${formData.finalResult.includes(opt) ? styles.active : ''} 
                    ${isDisabled ? styles.disabledChip : ''}
                    `}
                  onClick={() => !isDisabled && handleFinalResultToggle(opt)}
                  style={isDisabled ? { opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' } : {}}
                >
                  {opt}
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.group}>
          <label htmlFor="comments">Comments</label>
          <textarea id="comments" name="comments" value={formData.comments} onChange={handleChange} rows={3} />
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isSubmitting}
          style={isEditMode ? { background: "#f59e0b" } : {}}
        >
          {isSubmitting ? "Sending..." : (isEditMode ? "Submit Edit" : "Submit Report")}
        </button>

      </form>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import styles from "./ReportForm.module.css";
import { saveReportLocal, markReportSynced } from "../lib/storage";
import { submitReport } from "../lib/api";

export default function ReportForm() {
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

  useEffect(() => {
    // Load saved reporter from local storage
    const savedReporter = localStorage.getItem("lastReporter");
    if (savedReporter) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(prev => ({ ...prev, reportBy: savedReporter }));
    }

    // Load saved station from local storage
    const savedStation = localStorage.getItem("lastStation");
    if (savedStation) {
      setFormData(prev => ({ ...prev, station: savedStation }));
    }
  }, []);

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
      repairProcess: "Cleaning Printer delete css.bin Restart",
      assignedTo: "TRAXIS ENGINEERING",
      status: "Solved",
      finalResult: ["OK"]
    },
    "MIC 007": {
      malfunction: "E- Ticket distribution : Reading/Writing failure",
      repairProcess: "Cleaning Printer delete css.bin Restart",
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

      // Save persistent fields to local storage
      if (name === "reportBy") {
        localStorage.setItem("lastReporter", value);
      }
      if (name === "station") {
        localStorage.setItem("lastStation", value);
      }

      return newData;
    });
  };

  useEffect(() => {
    // Initialize date if empty
    if (!formData.reportedDate && autoTime) {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(prev => ({ ...prev, reportedDate: now.toISOString().slice(0, 16) }));
    }
  }, [autoTime, formData.reportedDate]);

  const handleAutoTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Determine final timestamp
    let finalDate = new Date();
    if (!autoTime && formData.reportedDate) {
      finalDate = new Date(formData.reportedDate);
    }

    // Format to Greek locale: d/M/yyyy h:mm tt
    // Example: 9/12/2025 2:00 μμ
    const formattedDate = finalDate.toLocaleString('el-GR', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).replace('pm', 'μμ').replace('am', 'πμ');

    const submissionData = {
      ...formData,
      finalResult: formData.finalResult.join(", "), // Convert array to comma-separated string
      reportedDate: formattedDate
    };

    console.log("Submitting report:", submissionData);

    try {
      // 1. Always save locally first (as draft/history)
      const savedReport = saveReportLocal(submissionData);

      // 2. Try to upload to Cloud
      const isOnline = navigator.onLine; // Basic check, but fetch will also fail if offline
      let uploaded = false;

      if (isOnline) {
        uploaded = await submitReport(submissionData);
      }

      if (uploaded) {
        markReportSynced(savedReport.id);
        alert("Report Sent & Saved! 🚀");
      } else {
        alert("No Internet? Report saved LOCALLY. Sync later! 💾");
      }

      // Reset form (keep reporter, maybe station)
      setFormData(prev => ({
        ...prev,
        tag: "",
        alarmCode: "",
        comments: "",
        malfunction: "",
        repairProcess: "",
        finalResult: ["OK"], // Reset to default
        // If autoTime is true, we don't need to reset reportedDate as it's generated on submit.
        reportedDate: ""
      }));
    } catch (error) {
      console.error("Failed to save", error);
      alert("Error saving report");
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>

      <div className={styles.group}>
        <label htmlFor="reportBy">Report By</label>
        <select id="reportBy" name="reportBy" value={formData.reportBy} onChange={handleChange} required>
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
          <label htmlFor="reportedDate" style={{ marginBottom: 0 }}>Date & Time</label>
          <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.3rem', color: 'var(--primary)' }}>
            <input
              type="checkbox"
              checked={autoTime}
              onChange={handleAutoTimeChange}
              style={{ width: 'auto', margin: 0 }}
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
          disabled={autoTime}
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
          </select>
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.group}>
          <label htmlFor="tag">Tag</label>
          <input type="number" id="tag" name="tag" value={formData.tag} onChange={handleChange} min="1" max="19" required />
        </div>
        <div className={styles.group}>
          <label htmlFor="status">Status</label>
          <select id="status" name="status" value={formData.status} onChange={handleChange}>
            <option value="Solved">Solved</option>
            <option value="In Progress">In Progress</option>
            <option value="Rejected">Rejected</option>
            <option value="Out Of Service">Out Of Service</option>
          </select>
        </div>
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
              "out of order on ATLAS",
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
              "Red X on Entry",
              "Red X on Exit",
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
              "POS Irruption",
              "Printer Jamming",
              "Printer link error",
              "Put The System Out of Order by SSUP",
              "Red light on banknote acceptor",
              "Reserve boxes are missing",
              "SAN Absent",
              "SSUP Default",
              "SSUP Link Failure",
              "Ticket is Valid But Doors Remain Closed",
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
            "No Entry No Exit",
            "No Exit",
            "Unauthorized Entry or Exit"
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
            "Cleaning Printer delete css.bin Restart",
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
            "Out of service",
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

      <button type="submit" className={styles.submitBtn}>Submit Report</button>
    </form>
  );
}

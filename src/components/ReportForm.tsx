"use client";

import { useState, useEffect } from "react";
import styles from "./ReportForm.module.css";
import { saveReportLocal } from "../lib/storage";

export default function ReportForm() {
  const [formData, setFormData] = useState({
    reportBy: "",
    station: "",
    device: "ATIM",
    tag: "",
    status: "Solved",
    alarmCode: "",
    malfunction: "",
    impact: "",
    repairProcess: "",
    assignedTo: "TRAXIS ENGINEERING",
    finalResult: "OK",
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(prev => ({ ...prev, station: savedStation }));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      // Auto-fill logic
      if (name === "alarmCode" && value === "MIC 007") {
        newData.malfunction = "Ticket Printer R/W Error";
        newData.repairProcess = "Cleaning Printer Sensor";
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
      setFormData(prev => ({ ...prev, reportedDate: now.toISOString().slice(0, 16) }));
    }
  }, []);

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

  const handleSubmit = (e: React.FormEvent) => {
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
      reportedDate: formattedDate
    };

    console.log("Submitting report:", submissionData);

    try {
      saveReportLocal(submissionData);
      alert("Report saved locally!");
      // Reset form (keep reporter, maybe station)
      setFormData(prev => ({
        ...prev,
        tag: "",
        alarmCode: "",
        comments: "",
        malfunction: "",
        repairProcess: "",
        // If autoTime is true, we don't need to reset reportedDate as it's generated on submit.
        // If autoTime is false, maybe keep it or clear it? Clearing for now.
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
            "ACR 001", "ACR 003", "AEQ 012", "AEQ 024", "AEQ 031", "AEQ 062",
            "AFA 002", "AIC 601", "AIR 003", "Air 006", "APB 001", "ART 013",
            "ART 203", "EIC 100", "EIC 102", "EIC 112", "ETP 006", "MBB 002",
            "MBB 003", "MBB 601", "MIC 001", "MIC 004", "MIC 007", "MIR 004",
            "MPP 011", "MPP 101", "MPP 102", "MPP 104", "MPP 105", "MPP 214",
            "MPP 701", "No Alarm", "RPB 104", "RPB 105", "RPB 601", "RPB 701"
          ].map((code) => (
            <option key={code} value={code} />
          ))}
        </datalist>
      </div>

      <div className={styles.group}>
        <label htmlFor="malfunction">Malfunction</label>
        <input type="text" id="malfunction" name="malfunction" value={formData.malfunction} onChange={handleChange} />
      </div>

      <div className={styles.group}>
        <label htmlFor="repairProcess">Repair Process</label>
        <input type="text" id="repairProcess" name="repairProcess" value={formData.repairProcess} onChange={handleChange} />
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
        <label htmlFor="comments">Comments</label>
        <textarea id="comments" name="comments" value={formData.comments} onChange={handleChange} rows={3} />
      </div>

      <button type="submit" className={styles.submitBtn}>Submit Report</button>
    </form>
  );
}

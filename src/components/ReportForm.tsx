"use client";

import { useState } from "react";
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
    assignedTo: "",
    finalResult: "OK",
    comments: "",
  });

  /* 
  // Removed useEffect to avoid lint warning. Logic moved to handleChange.
  */

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      // Auto-fill logic
      if (name === "alarmCode" && value === "MIC 007") {
        newData.malfunction = "Ticket Printer R/W Error";
        newData.repairProcess = "Cleaning Printer Sensor";
      }

      return newData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting report:", formData);

    try {
      saveReportLocal(formData);
      alert("Report saved locally!");
      // Reset form or redirect
      setFormData(prev => ({ ...prev, tag: "", alarmCode: "", comments: "" })); // Keep user/station for convenience?
    } catch (error) {
      console.error("Failed to save", error);
      alert("Error saving report");
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>Daily Report</h2>

      <div className={styles.group}>
        <label htmlFor="reportBy">Report By</label>
        <input type="text" id="reportBy" name="reportBy" value={formData.reportBy} onChange={handleChange} required />
      </div>

      <div className={styles.row}>
        <div className={styles.group}>
          <label htmlFor="station">Station</label>
          <select id="station" name="station" value={formData.station} onChange={handleChange} required>
            <option value="">Select...</option>
            <option value="1(NRS)">1(NRS)</option>
            <option value="2(DMK)">2(DMK)</option>
            <option value="3(VNZ)">3(VNZ)</option>
            {/* Add more stations */}
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
          <input type="number" id="tag" name="tag" value={formData.tag} onChange={handleChange} required />
        </div>
        <div className={styles.group}>
          <label htmlFor="status">Status</label>
          <select id="status" name="status" value={formData.status} onChange={handleChange}>
            <option value="Solved">Solved</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      <div className={styles.group}>
        <label htmlFor="alarmCode">Alarm Code</label>
        <input type="text" id="alarmCode" name="alarmCode" value={formData.alarmCode} onChange={handleChange} list="alarmCodes" />
        <datalist id="alarmCodes">
          <option value="MIC 007" />
          <option value="No Alarm" />
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
        <input type="text" id="assignedTo" name="assignedTo" value={formData.assignedTo} onChange={handleChange} />
      </div>

      <div className={styles.group}>
        <label htmlFor="comments">Comments</label>
        <textarea id="comments" name="comments" value={formData.comments} onChange={handleChange} rows={3} />
      </div>

      <button type="submit" className={styles.submitBtn}>Submit Report</button>
    </form>
  );
}

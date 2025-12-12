export interface Report {
  id: string;
  reportBy: string;
  reportedDate: string; // ISO string
  station: string;
  device: string;
  tag: string; // Changed to string to handle '09' etc perfectly
  status: string;
  alarmCode: string;
  malfunction: string;
  impact: string;
  repairProcess: string;
  assignedTo: string;
  finalResult: string;
  comments: string;
  synced: boolean;
}

const STORAGE_KEY = "metro_reports_offline";

export function saveReportLocal(report: Omit<Report, "id" | "synced">): Report {
  const newReport: Report = {
    ...report,
    id: crypto.randomUUID(),
    synced: false,
    reportedDate: report.reportedDate || new Date().toISOString(),
  };

  const existing = getLocalReports();
  const updated = [newReport, ...existing];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  return newReport;
}

export function getLocalReports(): Report[] {
  if (typeof window === "undefined") return [];
  const start = localStorage.getItem(STORAGE_KEY);
  return start ? JSON.parse(start) : [];
}

export function markReportSynced(id: string) {
  const existing = getLocalReports();
  const updated = existing.map(r => r.id === id ? { ...r, synced: true } : r);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

// For clearing synced reports later if needed
export function clearSyncedReports() {
  const existing = getLocalReports();
  const pending = existing.filter(r => !r.synced);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
}

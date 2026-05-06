"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Dashboard3DCharts from "../../components/Dashboard3DCharts";
import ReportsTable from "../../components/ReportsTable";
import MultiSelect from "../../components/MultiSelect";
import ExportButton from "../../components/ExportButton";
import Link from "next/link";
import { format, startOfMonth, parseISO, isWithinInterval, endOfDay, startOfDay } from "date-fns";
import { ArrowLeft, Calendar, BarChart3, TableProperties } from "lucide-react";
import ThemeToggle from "../../components/ThemeToggle";
import { useTheme } from "../../components/ThemeProvider";

export default function Dashboard() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [reports, setReports] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [filteredReports, setFilteredReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState<"charts" | "table">("charts");

    // Default: Current Month
    const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
    const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

    // Filters
    const [selectedStations, setSelectedStations] = useState<string[]>([]);
    const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedAlarms, setSelectedAlarms] = useState<string[]>([]);

    const { theme } = useTheme();
    const isDark = theme === "dark";

    // Theme Variables
    const pageBg = isDark ? "#0b1120" : "#f8fafc";
    const pageBgImage = isDark
        ? "radial-gradient(circle at 10% 20%, rgba(230, 57, 70, 0.1) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(16, 185, 129, 0.05) 0%, transparent 20%)"
        : "radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 20%)"; // Lighter gradient
    const textColor = isDark ? "#fff" : "#1e293b";
    const subTextColor = isDark ? "#94a3b8" : "#64748b";
    const glassBg = isDark ? "rgba(30, 41, 59, 0.4)" : "rgba(255, 255, 255, 0.6)";
    const glassBorder = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
    const inputBg = isDark ? "rgba(15, 23, 42, 0.6)" : "#fff";
    const inputBorder = isDark ? "#334155" : "#cbd5e1";


    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/reports");
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setReports(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Computed options based on all reports
    const { stations, devices, tags, alarms } = useMemo(() => {
        const stationSet = new Set<string>();
        const deviceSet = new Set<string>();
        const tagSet = new Set<string>();
        const alarmSet = new Set<string>();

        reports.forEach(r => {
            if (r.Station || r.station) stationSet.add(r.Station || r.station);
            const dev = r.Device || r.device;
            if (dev) deviceSet.add(String(dev).toUpperCase());
            if (r.Tag || r.tag) tagSet.add(String(r.Tag || r.tag));
            if (r["Alarm Code"] || r.alarmCode) alarmSet.add(r["Alarm Code"] || r.alarmCode);
        });

        return {
            stations: Array.from(stationSet).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
            devices: Array.from(deviceSet).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
            tags: Array.from(tagSet).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
            alarms: Array.from(alarmSet).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        };
    }, [reports]);

    const handleClearFilters = () => {
        setStartDate(format(startOfMonth(new Date()), "yyyy-MM-dd"));
        setEndDate(format(new Date(), "yyyy-MM-dd"));
        setSelectedStations([]);
        setSelectedDevices([]);
        setSelectedTags([]);
        setSelectedAlarms([]);
    };

    const filterData = useCallback(() => {
        if (!reports.length) return;
        const start = startOfDay(parseISO(startDate));
        const end = endOfDay(parseISO(endDate));

        const result = reports.filter(r => {
            const dateStr = r["Date"] || r["reportedDate"];
            if (!dateStr) return false;
            try {
                let d = new Date(dateStr);
                if (isNaN(d.getTime())) {
                    const parts = dateStr.split(" ")[0].split("/");
                    if (parts.length === 3) d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                }
                if (isNaN(d.getTime())) return false;
                if (!isWithinInterval(d, { start, end })) return false;
            } catch {
                return false;
            }

            // Station Filter
            const st = r.Station || r.station;
            if (selectedStations.length > 0 && !selectedStations.includes(st)) return false;

            // Device Filter
            const dev = r.Device || r.device;
            if (selectedDevices.length > 0 && dev && !selectedDevices.includes(String(dev).toUpperCase())) return false;

            // Tag Filter
            const tag = String(r.Tag || r.tag);
            if (selectedTags.length > 0 && !selectedTags.includes(tag)) return false;

            // Alarm Filter
            const alarm = r["Alarm Code"] || r.alarmCode;
            if (selectedAlarms.length > 0 && !selectedAlarms.includes(alarm)) return false;

            return true;
        });
        setFilteredReports(result);
    }, [reports, startDate, endDate, selectedStations, selectedDevices, selectedTags, selectedAlarms]);



    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterData();
    }, [filterData]);

    return (
        <div style={{
            minHeight: "100vh",
            background: pageBg,
            backgroundImage: pageBgImage,
            color: textColor,
            fontFamily: "'Inter', sans-serif",
            transition: "background 0.3s, color 0.3s"
        }}>

            {/* Navbar / Header */}
            <div style={{
                padding: "1.5rem 2rem",
                borderBottom: `1px solid ${glassBorder}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backdropFilter: "blur(10px)",
                background: isDark ? "rgba(11, 17, 32, 0.8)" : "rgba(255, 255, 255, 0.8)",
                position: "sticky",
                top: 0,
                zIndex: 50,
                transition: "background 0.3s, border 0.3s"
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '12px', height: '12px', background: '#e63946', borderRadius: '50%', boxShadow: '0 0 10px #e63946' }}></div>
                    <h1 style={{ fontSize: "1.2rem", fontWeight: "700", letterSpacing: "0.5px" }}>
                        AFC <span style={{ color: subTextColor }}>ANALYTICS</span>
                    </h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    {/* Moved Total Reports & Export here */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginRight: '1rem' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.7rem', color: subTextColor, textTransform: 'uppercase', letterSpacing: '1px' }}>Total Reports</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: textColor, lineHeight: '1.2' }}>{filteredReports.length}</div>
                        </div>
                        <ExportButton reports={filteredReports} startDate={startDate} endDate={endDate} />
                    </div>

                    <div style={{ width: '1px', height: '24px', background: glassBorder }}></div>

                    <ThemeToggle />
                    <Link href="/" className="back-link" style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        color: subTextColor, textDecoration: 'none', fontSize: '0.9rem',
                        transition: 'color 0.2s'
                    }}>
                        <ArrowLeft size={16} /> Back to Form
                    </Link>
                </div>
            </div>

            <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem" }}>

                {/* Controls Bar */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: glassBg,
                    border: `1px solid ${glassBorder}`,
                    padding: "1rem 1.5rem",
                    borderRadius: "16px",
                    marginBottom: "2rem",
                    flexWrap: "nowrap",
                    overflow: "visible",
                    gap: "1.5rem",
                    transition: "background 0.3s, border 0.3s"
                }}>

                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-end', flexWrap: 'nowrap' }}>
                        <div className="date-input-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                            <label style={{ fontSize: '0.75rem', color: subTextColor, textTransform: 'uppercase', letterSpacing: '1px' }}>Start Date</label>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: subTextColor }} />
                                <input
                                    type="date"
                                    lang="el-GR"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    style={{
                                        background: inputBg,
                                        border: `1px solid ${inputBorder}`,
                                        color: textColor,
                                        padding: '0.5rem 0.5rem 0.5rem 2.2rem',
                                        borderRadius: '8px',
                                        outline: 'none',
                                        fontSize: '0.9rem',
                                        colorScheme: isDark ? 'dark' : 'light'
                                    }}
                                />
                            </div>
                        </div>

                        <div className="date-input-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                            <label style={{ fontSize: '0.75rem', color: subTextColor, textTransform: 'uppercase', letterSpacing: '1px' }}>End Date</label>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: subTextColor }} />
                                <input
                                    type="date"
                                    lang="el-GR"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    style={{
                                        background: inputBg,
                                        border: `1px solid ${inputBorder}`,
                                        color: textColor,
                                        padding: '0.5rem 0.5rem 0.5rem 2.2rem',
                                        borderRadius: '8px',
                                        outline: 'none',
                                        fontSize: '0.9rem',
                                        colorScheme: isDark ? 'dark' : 'light'
                                    }}
                                />
                            </div>
                        </div>

                        {/* New Filters */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                            <label style={{ fontSize: '0.75rem', color: subTextColor, textTransform: 'uppercase', letterSpacing: '1px' }}>Station</label>
                            <MultiSelect options={stations} selected={selectedStations} onChange={setSelectedStations} placeholder="Όλοι" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                            <label style={{ fontSize: '0.75rem', color: subTextColor, textTransform: 'uppercase', letterSpacing: '1px' }}>Device</label>
                            <MultiSelect options={devices} selected={selectedDevices} onChange={setSelectedDevices} placeholder="Όλα" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                            <label style={{ fontSize: '0.75rem', color: subTextColor, textTransform: 'uppercase', letterSpacing: '1px' }}>Tag</label>
                            <MultiSelect options={tags} selected={selectedTags} onChange={setSelectedTags} placeholder="Όλα" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                            <label style={{ fontSize: '0.75rem', color: subTextColor, textTransform: 'uppercase', letterSpacing: '1px' }}>Alarm Code</label>
                            <MultiSelect options={alarms} selected={selectedAlarms} onChange={setSelectedAlarms} placeholder="Όλα" />
                        </div>
                    </div>

                    {/* Clear Filters Button - Moved outside the filter group to align right */}
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button
                            onClick={handleClearFilters}
                            style={{
                                background: "rgba(230, 57, 70, 0.1)",
                                color: "#e63946",
                                border: `1px solid rgba(230, 57, 70, 0.3)`,
                                padding: "0 1rem",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "0.85rem",
                                fontWeight: "600",
                                height: "33px", // Match typical input height
                                transition: "all 0.2s",
                                whiteSpace: "nowrap"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(230, 57, 70, 0.2)"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(230, 57, 70, 0.1)"}
                        >
                            Καθαρισμός
                        </button>
                    </div>

                </div>

                {/* Tabs */}
                <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
                    <button
                        onClick={() => setActiveView("charts")}
                        style={{
                            display: "flex", alignItems: "center", gap: "0.5rem",
                            padding: "0.6rem 1.2rem",
                            borderRadius: "8px",
                            background: activeView === "charts" ? "rgba(59, 130, 246, 0.15)" : glassBg,
                            color: activeView === "charts" ? "#3b82f6" : subTextColor,
                            border: `1px solid ${activeView === "charts" ? "rgba(59, 130, 246, 0.3)" : glassBorder}`,
                            cursor: "pointer",
                            fontWeight: activeView === "charts" ? "600" : "500",
                            transition: "all 0.2s"
                        }}
                    >
                        <BarChart3 size={18} /> Γραφήματα
                    </button>
                    <button
                        onClick={() => setActiveView("table")}
                        style={{
                            display: "flex", alignItems: "center", gap: "0.5rem",
                            padding: "0.6rem 1.2rem",
                            borderRadius: "8px",
                            background: activeView === "table" ? "rgba(59, 130, 246, 0.15)" : glassBg,
                            color: activeView === "table" ? "#3b82f6" : subTextColor,
                            border: `1px solid ${activeView === "table" ? "rgba(59, 130, 246, 0.3)" : glassBorder}`,
                            cursor: "pointer",
                            fontWeight: activeView === "table" ? "600" : "500",
                            transition: "all 0.2s"
                        }}
                    >
                        <TableProperties size={18} /> Δεδομένα
                    </button>
                </div>

                {loading ? (
                    <div style={{ height: '400px', display: 'flex', flexDirection: 'column', gap: '1.2rem', justifyContent: 'center', alignItems: 'center', color: subTextColor }}>
                        <div className="loading-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 500, letterSpacing: '0.5px' }}>Loading Analytics...</div>
                    </div>
                ) : (
                    activeView === "charts" ? (
                        <Dashboard3DCharts data={filteredReports} />
                    ) : (
                        <ReportsTable data={filteredReports} />
                    )
                )}

            </div>

            {/* Footer */}
            <div style={{ textAlign: "center", padding: "2rem 0 1rem", color: subTextColor, fontSize: "0.85rem" }}>
                All rights reserved © 2026 TRAXIS ENGINEERING
            </div>

        </div>
    );
}

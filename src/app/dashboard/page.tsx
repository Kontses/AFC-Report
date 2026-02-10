"use client";

import { useState, useEffect, useCallback } from "react";
import Dashboard3DCharts from "../../components/Dashboard3DCharts";
import ExportButton from "../../components/ExportButton";
import Link from "next/link";
import { format, startOfMonth, parseISO, isWithinInterval, endOfDay, startOfDay } from "date-fns";
import { ArrowLeft, Calendar } from "lucide-react";
import ThemeToggle from "../../components/ThemeToggle";
import { useTheme } from "../../components/ThemeProvider";

export default function Dashboard() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [reports, setReports] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [filteredReports, setFilteredReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Default: Current Month
    const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
    const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

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
                return isWithinInterval(d, { start, end });
            } catch {
                return false;
            }
        });
        setFilteredReports(result);
    }, [reports, startDate, endDate]);



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
                    flexWrap: "wrap",
                    gap: "1.5rem",
                    transition: "background 0.3s, border 0.3s"
                }}>

                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <div className="date-input-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                            <label style={{ fontSize: '0.75rem', color: subTextColor, textTransform: 'uppercase', letterSpacing: '1px' }}>Start Date</label>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: subTextColor }} />
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    style={{
                                        background: inputBg,
                                        border: `1px solid ${inputBorder}`,
                                        color: textColor,
                                        padding: '0.5rem 0.5rem 0.5rem 2.2rem',
                                        borderRadius: '8px',
                                        outline: 'none',
                                        fontSize: '0.9rem'
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
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    style={{
                                        background: inputBg,
                                        border: `1px solid ${inputBorder}`,
                                        color: textColor,
                                        padding: '0.5rem 0.5rem 0.5rem 2.2rem',
                                        borderRadius: '8px',
                                        outline: 'none',
                                        fontSize: '0.9rem'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.8rem', color: subTextColor }}>Total Reports</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: textColor }}>{filteredReports.length}</div>
                        </div>
                        <div style={{ width: '1px', height: '30px', background: glassBorder }}></div>
                        <ExportButton reports={filteredReports} startDate={startDate} endDate={endDate} />
                    </div>

                </div>

                {loading ? (
                    <div style={{ height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#64748b' }}>
                        <div className="loader">Loading Analytics...</div>
                    </div>
                ) : (
                    <Dashboard3DCharts data={filteredReports} />
                )}

            </div>

        </div>
    );
}

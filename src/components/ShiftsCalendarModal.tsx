"use client";

import React, { useEffect, useState } from "react";
import { X, Loader2, Calendar as CalendarIcon, User } from "lucide-react";
import { format, parseISO, isToday } from "date-fns";
import { el } from "date-fns/locale";

interface ShiftsCalendarModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const EMPLOYEE_COLORS: Record<string, { bg: string; text: string }> = {
    "Emmanouil Kazantzoglou": { bg: "#2563eb", text: "#ffffff" },
    "Evangelos Derventzis": { bg: "#059669", text: "#ffffff" },
    "Dimitris Mpazakas": { bg: "#7c3aed", text: "#ffffff" },
    "Konstantinos Saltzoglou": { bg: "#d97706", text: "#ffffff" },
    "Nikos Tsiagkas": { bg: "#e11d48", text: "#ffffff" },
    "Vassilis Kontses": { bg: "#0891b2", text: "#ffffff" },
};

export default function ShiftsCalendarModal({ isOpen, onClose }: ShiftsCalendarModalProps) {
    const [shiftsData, setShiftsData] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [filterEmployee, setFilterEmployee] = useState<string>("All");

    useEffect(() => {
        if (isOpen) {
            fetchShifts();
        }
    }, [isOpen]);

    const fetchShifts = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/shifts/get", { cache: "no-store" });
            if (res.ok) {
                const data = await res.json();
                setShiftsData(data);
            }
        } catch (error) {
            console.error("Failed to fetch shifts", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const dates = Object.keys(shiftsData).sort();

    // Get unique employees for the filter dropdown
    const allEmployees = new Set<string>();
    dates.forEach(date => {
        const dayShifts = shiftsData[date];
        Object.values(dayShifts).forEach((staffList: any) => {
            staffList.forEach((emp: string) => allEmployees.add(emp));
        });
    });

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000, backdropFilter: "blur(5px)",
            padding: "1rem" // added padding to prevent touching edges on mobile
        }}>
            <div style={{
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                width: "100%",
                maxWidth: "800px",
                maxHeight: "90vh",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden"
            }}>
                {/* Header */}
                <div style={{
                    padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)",
                    display: "flex", flexDirection: "column", gap: "1rem",
                    backgroundColor: "var(--input-bg)"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <CalendarIcon size={24} color="var(--primary)" />
                            <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", margin: 0 }}>Shifts</h2>
                        </div>
                        <button onClick={onClose} style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "8px", cursor: "pointer", color: "var(--foreground)", padding: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Κλείσιμο</span>
                            <X size={18} />
                        </button>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--card-bg)", padding: "6px 12px", borderRadius: "8px", border: "1px solid var(--border)", width: "fit-content" }}>
                        <User size={16} color="var(--secondary)" />
                        <select
                            value={filterEmployee}
                            onChange={(e) => setFilterEmployee(e.target.value)}
                            style={{ background: "transparent", border: "none", color: "var(--foreground)", outline: "none", cursor: "pointer", fontSize: "0.9rem" }}
                        >
                            <option value="All">Team</option>
                            {Array.from(allEmployees).sort().map(emp => (
                                <option key={emp} value={emp}>{emp}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: "1.5rem", maxHeight: "60vh", overflowY: "auto" }}>
                    {loading ? (
                        <div style={{ padding: "4rem", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "1rem" }}>
                            <Loader2 className="animate-spin" size={40} color="var(--primary)" />
                            <span style={{ color: "var(--secondary)" }}>Φόρτωση βαρδιών...</span>
                        </div>
                    ) : dates.length === 0 ? (
                        <div style={{ padding: "3rem", textAlign: "center", color: "var(--secondary)" }}>
                            Δεν υπάρχουν αποθηκευμένες βάρδιες στο Google Drive.
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {dates.map((dateStr) => {
                                const dayObj = shiftsData[dateStr];
                                const isCurrentDay = isToday(parseISO(dateStr));

                                // Check if the filter applies to this day
                                let dayHasFilteredEmployee = false;
                                if (filterEmployee !== "All") {
                                    Object.values(dayObj).forEach((staffList: any) => {
                                        if (staffList.includes(filterEmployee)) dayHasFilteredEmployee = true;
                                    });
                                } else {
                                    dayHasFilteredEmployee = true;
                                }

                                if (!dayHasFilteredEmployee) return null;

                                return (
                                    <div key={dateStr} style={{
                                        border: `1px solid ${isCurrentDay ? 'var(--primary)' : 'var(--border)'}`,
                                        borderRadius: "12px",
                                        overflow: "hidden",
                                        boxShadow: isCurrentDay ? "0 0 0 1px var(--primary)" : "none"
                                    }}>
                                        <div style={{
                                            background: isCurrentDay ? "rgba(230, 57, 70, 0.1)" : "var(--input-bg)",
                                            padding: "10px 16px",
                                            fontWeight: "bold",
                                            borderBottom: "1px solid var(--border)",
                                            display: "flex",
                                            justifyContent: "space-between"
                                        }}>
                                            <span style={{ textTransform: "capitalize", color: isCurrentDay ? "var(--primary)" : "var(--foreground)" }}>
                                                {format(parseISO(dateStr), 'EEEE, d MMMM yyyy', { locale: el })}
                                            </span>
                                            {isCurrentDay && <span style={{ fontSize: "0.8rem", background: "var(--primary)", color: "white", padding: "2px 8px", borderRadius: "12px" }}>Σήμερα</span>}
                                        </div>
                                        <div style={{ padding: "12px 16px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px", background: "var(--card-bg)" }}>
                                            {Object.entries(dayObj).map(([category, staffList]: [string, any]) => {
                                                if (!staffList || staffList.length === 0) return null;

                                                // If filtering, only show categories that include the employee, or show all if "All"
                                                if (filterEmployee !== "All" && !staffList.includes(filterEmployee)) return null;

                                                return (
                                                    <div key={category} style={{ background: "var(--input-bg)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                                                        <div style={{ fontSize: "0.8rem", color: "var(--secondary)", marginBottom: "8px", fontWeight: "bold" }}>
                                                            {category}
                                                        </div>
                                                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                                            {staffList.map((emp: string) => {
                                                                const isHighlight = filterEmployee === emp;
                                                                const empColor = EMPLOYEE_COLORS[emp] || { bg: "#555", text: "#fff" };

                                                                return (
                                                                    <div key={emp} style={{
                                                                        display: "flex", alignItems: "center", gap: "8px",
                                                                        padding: "4px 8px", borderRadius: "6px",
                                                                        background: empColor.bg, color: empColor.text,
                                                                        fontSize: "0.9rem",
                                                                        border: isHighlight ? "2px solid white" : "none"
                                                                    }}>
                                                                        <span>{emp}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

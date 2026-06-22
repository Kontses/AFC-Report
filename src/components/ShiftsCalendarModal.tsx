"use client";

import React, { useEffect, useState, useRef } from "react";
import { X, Loader2, Calendar as CalendarIcon, User, ChevronLeft, ChevronRight } from "lucide-react";
import { format, parseISO, isToday, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, isSameMonth, isSameDay } from "date-fns";
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
    const [viewMode, setViewMode] = useState<"list" | "month">("list");
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    
    // States για πλοήγηση και snap/highlight ημέρας από Month σε List
    const [scrollToDate, setScrollToDate] = useState<string | null>(null);
    const [highlightedDate, setHighlightedDate] = useState<string | null>(null);
    const [hasScrolledToday, setHasScrolledToday] = useState(false);
    
    // Καταστάσεις για smooth animations εισόδου/εξόδου (entrance/exit)
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    
    // Ref για τη σημερινή ημέρα (magnetic snap)
    const todayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            setIsAnimatingOut(false);
            fetchShifts();
        } else {
            setIsAnimatingOut(true);
            const timer = setTimeout(() => {
                setShouldRender(false);
                setIsAnimatingOut(false);
            }, 300); // 300ms για να ολοκληρωθεί το scaleDownModal animation
            
            // Επαναφορά όταν κλείνει το modal
            setHasScrolledToday(false);
            setScrollToDate(null);
            setHighlightedDate(null);
            
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Εφέ για το αυτόματο μαγνητικό snap/scroll στη σημερινή ημέρα (μόνο μία φορά κατά το άνοιγμα στη list προβολή)
    useEffect(() => {
        if (isOpen && !loading && viewMode === "list" && !hasScrolledToday) {
            const timer = setTimeout(() => {
                if (todayRef.current) {
                    todayRef.current.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });
                    setHasScrolledToday(true);
                }
            }, 300); // 300ms για να συμπίπτει με το τέλος του scale-up animation του modal
            return () => clearTimeout(timer);
        }
    }, [isOpen, loading, viewMode, hasScrolledToday]);

    // Εφέ για το snap/scroll στην ημέρα που έκανε κλικ ο χρήστης από τη μηνιαία προβολή
    useEffect(() => {
        if (viewMode === "list" && scrollToDate) {
            const timer = setTimeout(() => {
                const element = document.getElementById(`day-card-${scrollToDate}`);
                if (element) {
                    element.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });
                }
                setScrollToDate(null);
            }, 150);

            const highlightTimer = setTimeout(() => {
                setHighlightedDate(null);
            }, 2500); // Αφαίρεση του highlight μετά από 2.5 δευτερόλεπτα

            return () => {
                clearTimeout(timer);
                clearTimeout(highlightTimer);
            };
        }
    }, [viewMode, scrollToDate]);

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

    if (!shouldRender) return null;

    const dates = Object.keys(shiftsData).sort();

    // Get unique employees for the filter dropdown
    const allEmployees = new Set<string>();
    dates.forEach(date => {
        const dayShifts = shiftsData[date];
        Object.values(dayShifts).forEach((staffList: any) => {
            staffList.forEach((emp: string) => allEmployees.add(emp));
        });
    });

    // Helper to generate the 35/42 days grid for monthly view
    const getMonthGridDays = (monthDate: Date) => {
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthStart);
        const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
        const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
        return eachDayOfInterval({ start: gridStart, end: gridEnd });
    };

    // Helper to format date object to yyyy-MM-dd key string
    const formatDateStr = (d: Date): string => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    return (
        <div 
            className={isAnimatingOut ? "modal-backdrop-out" : "modal-backdrop-animate"}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                padding: "1rem"
            }}
        >
            <div 
                className={isAnimatingOut ? "modal-content-out" : "modal-content-animate"}
                style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--border)",
                    borderRadius: "16px",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                    width: "90%",
                    maxWidth: "800px",
                    maxHeight: "90vh",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden"
                }}
            >
                {/* Header / Κεφαλίδα */}
                <div 
                    className="mobile-compact-header"
                    style={{
                        padding: "1.25rem 1.5rem",
                        borderBottom: "1px solid var(--border)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                        backgroundColor: "var(--input-bg)"
                    }}
                >
                    {/* Γραμμή 1: Τίτλος, Month Selector (αν Month View), Κλείσιμο */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", gap: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                            <CalendarIcon size={20} color="var(--primary)" />
                            <h2 style={{ fontSize: "1.15rem", fontWeight: "bold", margin: 0 }}>Shifts</h2>
                        </div>

                        {viewMode === "month" && (
                            <div style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                gap: "4px", 
                                background: "var(--card-bg)", 
                                borderRadius: "8px", 
                                border: "1px solid var(--border)", 
                                padding: "2px 4px",
                                flexShrink: 0
                            }}>
                                <button 
                                    onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
                                    style={{ background: "transparent", border: "none", color: "var(--foreground)", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}
                                    title="Previous Month"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span style={{ 
                                    fontSize: "0.85rem", 
                                    fontWeight: "bold", 
                                    color: "var(--foreground)", 
                                    minWidth: "85px", 
                                    textAlign: "center", 
                                    textTransform: "capitalize",
                                    whiteSpace: "nowrap"
                                }}>
                                    {format(currentMonth, 'LLLL yyyy', { locale: el })}
                                </span>
                                <button 
                                    onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
                                    style={{ background: "transparent", border: "none", color: "var(--foreground)", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}
                                    title="Next Month"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}

                        <button
                            onClick={onClose}
                            style={{
                                background: "var(--card-bg)",
                                border: "1px solid var(--border)",
                                borderRadius: "8px",
                                cursor: "pointer",
                                color: "var(--foreground)",
                                padding: "6px 10px",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                transition: "background 0.2s, border-color 0.2s",
                                flexShrink: 0
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "var(--input-bg)";
                                e.currentTarget.style.borderColor = "var(--secondary)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "var(--card-bg)";
                                e.currentTarget.style.borderColor = "var(--border)";
                            }}
                        >
                            <span className="mobile-hide-text" style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Κλείσιμο</span>
                            <X size={16} />
                        </button>
                    </div>

                    {/* Γραμμή 2: Dropdown Team & Toggle Buttons List/Month */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", width: "100%" }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                background: "var(--card-bg)",
                                padding: "6px 10px",
                                borderRadius: "8px",
                                border: "1px solid var(--border)",
                                flex: "1",
                                minWidth: 0,
                                maxWidth: "180px",
                                transition: "border-color 0.2s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--secondary)"}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
                        >
                            <User size={14} color="var(--secondary)" style={{ flexShrink: 0 }} />
                            <select
                                value={filterEmployee}
                                onChange={(e) => setFilterEmployee(e.target.value)}
                                style={{ background: "transparent", border: "none", color: "var(--foreground)", outline: "none", cursor: "pointer", fontSize: "0.85rem", width: "100%" }}
                            >
                                <option value="All">Team</option>
                                {Array.from(allEmployees).sort().map(emp => (
                                    <option key={emp} value={emp}>{emp}</option>
                                ))}
                            </select>
                        </div>

                        {/* Toggle buttons for view modes */}
                        <div style={{ display: "flex", background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "8px", padding: "2px", flexShrink: 0 }}>
                            <button
                                onClick={() => setViewMode("list")}
                                style={{
                                    background: viewMode === "list" ? "var(--primary)" : "transparent",
                                    color: viewMode === "list" ? "#ffffff" : "var(--secondary)",
                                    border: "none",
                                    padding: "5px 10px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "0.8rem",
                                    fontWeight: "bold",
                                    transition: "all 0.2s"
                                }}
                            >
                                List
                            </button>
                            <button
                                onClick={() => setViewMode("month")}
                                style={{
                                    background: viewMode === "month" ? "var(--primary)" : "transparent",
                                    color: viewMode === "month" ? "#ffffff" : "var(--secondary)",
                                    border: "none",
                                    padding: "5px 10px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "0.8rem",
                                    fontWeight: "bold",
                                    transition: "all 0.2s"
                                }}
                            >
                                Month
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="mobile-compact-content" style={{ padding: "1.5rem", maxHeight: "60vh", overflowY: "auto" }}>
                    {loading ? (
                        <div style={{ padding: "4rem", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "1rem" }}>
                            <Loader2 className="animate-spin" size={40} color="var(--primary)" />
                            <span style={{ color: "var(--secondary)" }}>Φόρτωση βαρδιών...</span>
                        </div>
                    ) : dates.length === 0 ? (
                        <div style={{ padding: "3rem", textAlign: "center", color: "var(--secondary)" }}>
                            Δεν υπάρχουν καταχωρημένες βάρδιες.
                        </div>
                    ) : viewMode === "list" ? (
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

                                const isClickHighlight = dateStr === highlightedDate;
                                return (
                                    <div 
                                        key={dateStr} 
                                        id={`day-card-${dateStr}`}
                                        ref={isCurrentDay ? todayRef : undefined}
                                        className={isClickHighlight ? "click-card-highlight" : isCurrentDay ? "today-card-highlight" : ""}
                                        style={{
                                            border: `1px solid ${isClickHighlight ? '#fbbf24' : isCurrentDay ? 'var(--primary)' : 'var(--border)'}`,
                                            borderRadius: "12px",
                                            overflow: "hidden",
                                            boxShadow: isClickHighlight ? "0 0 0 1px #fbbf24" : isCurrentDay ? "0 0 0 1px var(--primary)" : "none",
                                            transition: "border-color 0.3s, box-shadow 0.3s"
                                        }}
                                    >
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
                    ) : (
                        /* Month Calendar view */
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {/* Grid weekdays header */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", textAlign: "center", borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>
                                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((dayName, idx) => (
                                    <div key={dayName} style={{ fontSize: "0.8rem", fontWeight: "bold", color: idx >= 5 ? "var(--primary)" : "var(--secondary)" }}>
                                        {dayName}
                                    </div>
                                ))}
                            </div>

                            {/* Grid days */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
                                {getMonthGridDays(currentMonth).map((dayDate) => {
                                    const dateStr = formatDateStr(dayDate);
                                    const dayObj = shiftsData[dateStr] || {};
                                    const isCurrentDay = isToday(dayDate);
                                    const isCurrentMonth = isSameMonth(dayDate, currentMonth);

                                    return (
                                        <div 
                                            key={dateStr}
                                            onClick={() => {
                                                setScrollToDate(dateStr);
                                                setHighlightedDate(dateStr);
                                                setViewMode("list");
                                            }}
                                            style={{
                                                minHeight: "85px",
                                                border: `1px solid ${isCurrentDay ? 'var(--primary)' : 'var(--border)'}`,
                                                borderRadius: "8px",
                                                padding: "4px",
                                                background: isCurrentDay 
                                                    ? "rgba(230, 57, 70, 0.05)" 
                                                    : isCurrentMonth ? "var(--card-bg)" : "rgba(255, 255, 255, 0.02)",
                                                opacity: isCurrentMonth ? 1 : 0.4,
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: "4px",
                                                boxShadow: isCurrentDay ? "0 0 0 1px var(--primary)" : "none",
                                                overflow: "hidden",
                                                cursor: "pointer",
                                                transition: "all 0.2s"
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = "var(--secondary)";
                                                e.currentTarget.style.backgroundColor = isCurrentDay 
                                                    ? "rgba(230, 57, 70, 0.08)" 
                                                    : "rgba(255, 255, 255, 0.05)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = isCurrentDay ? 'var(--primary)' : 'var(--border)';
                                                e.currentTarget.style.backgroundColor = isCurrentDay 
                                                    ? "rgba(230, 57, 70, 0.05)" 
                                                    : isCurrentMonth ? "var(--card-bg)" : "rgba(255, 255, 255, 0.02)";
                                            }}
                                        >
                                            {/* Day number header */}
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", fontWeight: "bold" }}>
                                                <span 
                                                    style={isCurrentDay ? {
                                                        background: "var(--primary)",
                                                        color: "white",
                                                        width: "18px",
                                                        height: "18px",
                                                        borderRadius: "50%",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        fontSize: "0.7rem"
                                                    } : {
                                                        color: isCurrentMonth ? "var(--foreground)" : "var(--secondary)"
                                                    }}
                                                >
                                                    {dayDate.getDate()}
                                                </span>
                                                {isCurrentDay && <span style={{ fontSize: "0.6rem", color: "var(--primary)", fontWeight: "bold" }}>Today</span>}
                                            </div>

                                            {/* Compact Shift Events */}
                                            <div style={{ display: "flex", flexDirection: "column", gap: "2px", overflowY: "auto", flex: 1 }}>
                                                {Object.entries(dayObj).map(([category, staffList]: [string, any]) => {
                                                    if (!staffList || staffList.length === 0) return null;

                                                    // Apply filter if any is selected
                                                    const filteredStaff = filterEmployee === "All" 
                                                        ? staffList 
                                                        : staffList.filter((emp: string) => emp === filterEmployee);

                                                    if (filteredStaff.length === 0) return null;

                                                    return filteredStaff.map((emp: string) => {
                                                        const empColor = EMPLOYEE_COLORS[emp] || { bg: "#555", text: "#fff" };
                                                        
                                                        // Get compact category abbreviation
                                                        let catLabel = category;
                                                        if (category === "ΠΡΩΙ") catLabel = "Π";
                                                        else if (category === "ΑΠΟΓΕΥΜΑ") catLabel = "Α";
                                                        else if (category === "ΓΡΑΦΕΙΟ") catLabel = "Γρ";
                                                        else if (category === "ΡΕΠΟ") catLabel = "Ρ";
                                                        else if (category === "ΑΔΕΙΑ") catLabel = "Αδ";

                                                        return (
                                                            <div 
                                                                key={`${category}-${emp}`}
                                                                style={{
                                                                    background: empColor.bg,
                                                                    color: empColor.text,
                                                                    fontSize: "0.7rem",
                                                                    padding: "2px 4px",
                                                                    borderRadius: "4px",
                                                                    fontWeight: "bold",
                                                                    whiteSpace: "nowrap",
                                                                    overflow: "hidden",
                                                                    textOverflow: "ellipsis",
                                                                    display: "flex",
                                                                    gap: "2px",
                                                                    lineHeight: "1"
                                                                }}
                                                                title={`${category} - ${emp}`}
                                                            >
                                                                <span style={{ opacity: 0.8 }}>{catLabel}:</span>
                                                                <span>{emp.split(" ")[0]}</span>
                                                            </div>
                                                        );
                                                    });
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

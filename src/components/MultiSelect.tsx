import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface MultiSelectProps {
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder: string;
}

export default function MultiSelect({ options, selected, onChange, placeholder }: MultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const inputBg = isDark ? "rgba(15, 23, 42, 0.6)" : "#fff";
    const inputBorder = isDark ? "#334155" : "#cbd5e1";
    const textColor = isDark ? "#fff" : "#1e293b";
    const dropdownBg = isDark ? "#1e293b" : "#fff";
    const hoverBg = isDark ? "#334155" : "#f1f5f9";

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleOption = (option: string) => {
        if (selected.includes(option)) {
            onChange(selected.filter(item => item !== option));
        } else {
            onChange([...selected, option]);
        }
    };

    const displayText = selected.length === 0 
        ? placeholder 
        : selected.length === 1 
            ? selected[0] 
            : `${selected.length} επιλεγμένα`;

    return (
        <div ref={dropdownRef} style={{ position: "relative", minWidth: "160px" }}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: inputBg,
                    border: `1px solid ${inputBorder}`,
                    color: textColor,
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                }}
            >
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {displayText}
                </span>
                <ChevronDown size={14} style={{ marginLeft: "8px", flexShrink: 0 }} />
            </div>

            {isOpen && (
                <div style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    marginTop: "4px",
                    background: dropdownBg,
                    border: `1px solid ${inputBorder}`,
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    zIndex: 100,
                    maxHeight: "250px",
                    overflowY: "auto",
                    padding: "0.25rem"
                }}>
                    {options.length === 0 ? (
                        <div style={{ padding: "0.5rem", fontSize: "0.85rem", color: textColor, opacity: 0.5 }}>
                            Δεν βρέθηκαν δεδομένα
                        </div>
                    ) : (
                        options.map(option => (
                            <div 
                                key={option}
                                onClick={() => toggleOption(option)}
                                style={{
                                    padding: "0.5rem",
                                    display: "flex",
                                    alignItems: "center",
                                    cursor: "pointer",
                                    fontSize: "0.85rem",
                                    color: textColor,
                                    borderRadius: "4px",
                                    transition: "background 0.2s"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = hoverBg}
                                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                            >
                                <div style={{ 
                                    width: "14px", 
                                    height: "14px", 
                                    border: `1px solid ${selected.includes(option) ? "#3b82f6" : inputBorder}`, 
                                    borderRadius: "3px",
                                    marginRight: "8px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: selected.includes(option) ? "#3b82f6" : "transparent"
                                }}>
                                    {selected.includes(option) && <Check size={10} color="#fff" />}
                                </div>
                                {option}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

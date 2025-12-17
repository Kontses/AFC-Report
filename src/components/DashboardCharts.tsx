"use client";

import React from "react";
import { Chart } from "react-google-charts";

interface Report {
    Station: string;
    Device: string;
    Malfunction: string;
    [key: string]: string | number; // allow other fields
}

interface DashboardChartsProps {
    reports: Report[];
}

export default function DashboardCharts({ reports }: DashboardChartsProps) {

    // 1. Prepare Data for Column Chart (Station vs Count)
    const stationCounts = reports.reduce((acc, curr) => {
        const station = curr.Station || "Unknown";
        acc[station] = (acc[station] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const stationData = [
        ["Station", "Total Reports"],
        ...Object.entries(stationCounts).map(([station, count]) => [station, count]),
    ];

    // 2. Prepare Data for Gate Malfunctions (Pie)
    const gateReports = reports.filter(r => r.Device === "GATE");
    const gateCounts = gateReports.reduce((acc, curr) => {
        const m = curr.Malfunction || "Unknown";
        acc[m] = (acc[m] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const gateData = [
        ["Malfunction", "Count"],
        ...Object.entries(gateCounts),
    ];

    // 3. Prepare Data for ATIM Malfunctions (Pie)
    const atimReports = reports.filter(r => r.Device === "ATIM");
    const atimCounts = atimReports.reduce((acc, curr) => {
        const m = curr.Malfunction || "Unknown";
        acc[m] = (acc[m] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const atimData = [
        ["Malfunction", "Count"],
        ...Object.entries(atimCounts),
    ];

    // Common Options
    const commonOptions = {
        backgroundColor: "transparent",
        legend: { textStyle: { color: "#ccc" } },
        titleTextStyle: { color: "#fff", fontSize: 16 },
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Station Chart */}
            <div style={cardStyle}>
                <h3>Malfunctions/Station</h3>
                <Chart
                    chartType="ColumnChart"
                    width="100%"
                    height="400px"
                    data={stationData.length > 1 ? stationData : [["Station", "Reports"], ["No Data", 0]]}
                    options={{
                        ...commonOptions,
                        colors: ["#e63946"],
                        vAxis: {
                            textStyle: { color: "#ccc" },
                            gridlines: { color: "#333" }
                        },
                        hAxis: {
                            textStyle: { color: "#ccc" }
                        },
                        // Pseudo-3D effect not fully supported in standard material charts, 
                        // but we can try is3D: true on some types or standard look.
                        // ColumnChart doesn't support 'is3D' natively like Pie, but we style it cleanly.
                    }}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

                {/* Gate Malfunctions */}
                <div style={cardStyle}>
                    <h3>Gate Malfunctions</h3>
                    <Chart
                        chartType="PieChart"
                        width="100%"
                        height="400px"
                        data={gateData.length > 1 ? gateData : [["Malfunction", "Count"], ["No Data", 1]]}
                        options={{
                            ...commonOptions,
                            is3D: true, // Requested 3D
                            slices: {
                                0: { offset: 0.1 }, // Pop out the largest slice slightly
                            }
                        }}
                    />
                </div>

                {/* ATIM Malfunctions */}
                <div style={cardStyle}>
                    <h3>ATIM Malfunctions</h3>
                    <Chart
                        chartType="PieChart"
                        width="100%"
                        height="400px"
                        data={atimData.length > 1 ? atimData : [["Malfunction", "Count"], ["No Data", 1]]}
                        options={{
                            ...commonOptions,
                            is3D: true, // Requested 3D
                        }}
                    />
                </div>

            </div>
        </div>
    );
}

const cardStyle = {
    background: 'var(--card-bg)',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid var(--border)'
};

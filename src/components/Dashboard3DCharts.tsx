"use client";

import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import { useTheme } from "./ThemeProvider";

interface Dashboard3DChartsProps {
    reports: any[];
}

export default function Dashboard3DCharts({ reports }: Dashboard3DChartsProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const textColor = isDark ? '#fff' : '#1e293b';
    const subTextColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? '#334155' : '#e2e8f0';
    const cardBg = isDark
        ? 'linear-gradient(180deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)'
        : 'linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(241, 245, 249, 0.9) 100%)';
    const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
    const cardShadow = isDark ? '0 8px 32px rgba(0,0,0,0.2)' : '0 8px 32px rgba(0,0,0,0.05)';
    const tooltipBg = isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.95)';
    const tooltipBorder = isDark ? '#334155' : '#e2e8f0';

    // Data Helper
    // Data Helper: Top 5 + Others
    // Data Helper: Sort Descending (Show All)
    const processData = (data: { [key: string]: number }) => {
        // Sort by value descending and return all
        return Object.entries(data)
            .sort((a, b) => b[1] - a[1])
            .map(([name, value]) => ({ name, value }));
    };

    const { stationNames, stationValues, gateData, atimData } = useMemo(() => {
        // 1. Enforce Station Order
        const STATION_ORDER = [
            "1(NRS)", "2(DMK)", "3(VNZ)", "4(AGS)", "5(SNT)", "6(PNP)",
            "7(PPF)", "8(EFK)", "9(FLM)", "10(ANP)", "11(MRT)", "12(VLG)", "13(NEL)"
        ];

        const sCounts: Record<string, number> = {};
        reports.forEach(r => {
            const s = r.Station || "Unknown";
            sCounts[s] = (sCounts[s] || 0) + 1;
        });

        // Map strict order. User requested specific order. We will show ALL stations to keep x-axis consistent.
        const stations = STATION_ORDER;
        const sValues = STATION_ORDER.map(s => sCounts[s] || 0);

        // Gate
        const gCounts: Record<string, number> = {};
        reports.filter(r => r.Device === "GATE").forEach(r => {
            const m = r.Malfunction || "Unknown";
            gCounts[m] = (gCounts[m] || 0) + 1;
        });
        const gateProcessed = processData(gCounts);

        // ATIM
        const aCounts: Record<string, number> = {};
        reports.filter(r => r.Device === "ATIM").forEach(r => {
            const m = r.Malfunction || "Unknown";
            aCounts[m] = (aCounts[m] || 0) + 1;
        });
        const atimProcessed = processData(aCounts);

        return {
            stationNames: stations,
            stationValues: sValues,
            gateData: gateProcessed,
            atimData: atimProcessed
        };
    }, [reports]);

    // --- CHART 1: STATION (Premium Gradient Bar) ---
    const barOption = {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross', // Shows both vertical and horizontal lines
                crossStyle: { color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)', type: 'dashed' },
                label: { backgroundColor: '#334155' }
            },
            backgroundColor: tooltipBg,
            borderColor: tooltipBorder,
            textStyle: { color: textColor }
        },
        grid: { left: '3%', right: '4%', bottom: '5%', containLabel: true },
        xAxis: {
            type: 'category',
            data: stationNames,
            axisLabel: { color: subTextColor, rotate: 45, fontSize: 11 },
            axisLine: { lineStyle: { color: gridColor } },
            axisTick: { show: false }
        },
        yAxis: {
            type: 'value',
            axisLabel: { color: subTextColor },
            splitLine: { lineStyle: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', type: 'dashed' } },
            axisPointer: {
                label: {
                    precision: 0
                }
            }
        },
        series: [
            {
                name: 'Reports',
                type: 'bar',
                barWidth: '40%', // Thicker, nicer looking
                itemStyle: {
                    borderRadius: [6, 6, 0, 0],
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#f59e0b' }, // Amber
                        { offset: 1, color: '#ea580c' }  // Orange Red
                    ]),
                    shadowBlur: 10,
                    shadowColor: 'rgba(245, 158, 11, 0.3)'
                },
                data: stationValues,
                showBackground: true,
                backgroundStyle: {
                    color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.03)',
                    borderRadius: [6, 6, 0, 0]
                }
            }
        ]
    };

    // --- CHART 2 & 3: PIE (3D Donut style) ---
    const getPieOption = (data: any[], colorStart: string, colorEnd: string) => {
        const PIE_COLORS = [
            '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
            '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
        ];

        return {
            backgroundColor: 'transparent',
            // Title removed, handled via HTML for better alignment
            tooltip: {
                trigger: 'item',
                backgroundColor: tooltipBg,
                borderColor: tooltipBorder,
                textStyle: { color: textColor }
            },
            legend: {
                type: 'scroll',
                orient: 'vertical',
                left: '55%', // Start slightly after middle
                top: 'middle', // Vertically centered
                bottom: 20,
                textStyle: { color: subTextColor, fontSize: 12 }, // Larger font
                pageTextStyle: { color: textColor },
                formatter: (name: string) => {
                    return name.length > 35 ? name.substr(0, 35) + '...' : name; // More chars
                },
                tooltip: {
                    show: true,
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    textStyle: { color: textColor },
                    formatter: (params: any) => {
                        // params is the legend name
                        const name = typeof params === 'string' ? params : params.name;
                        const itemIndex = data.findIndex(d => d.name === name);
                        const item = data[itemIndex];
                        const val = item ? item.value : '';
                        const color = PIE_COLORS[itemIndex % PIE_COLORS.length];

                        // Custom HTML to mimic the series tooltip
                        return `
                            <div style="font-size:12px;color:${subTextColor};margin-bottom:4px;font-weight:600">Malfunctions</div>
                            <div style="display:flex;align-items:center;gap:8px;font-size:13px">
                                <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background-color:${color};box-shadow: 0 0 5px ${color}"></span>
                                <span>${name}</span>
                                <span style="font-weight:bold;margin-left:auto">${val}</span>
                            </div>
                        `;
                    }
                }
            },
            series: [
                {
                    name: 'Malfunctions',
                    type: 'pie',
                    radius: ['45%', '70%'], // Thick Donut
                    center: ['25%', '50%'], // Center of the Left Half (0-50%)
                    color: PIE_COLORS, // Explicitly set colors
                    itemStyle: {
                        borderRadius: 8,
                        borderColor: isDark ? '#1e293b' : '#fff', // Match card bg
                        borderWidth: 3,
                        shadowBlur: 10,
                        shadowColor: 'rgba(0, 0, 0, 0.2)'
                    },
                    label: { show: false },
                    data: data
                }
            ]
        };
    };

    return (
        <div className="charts-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* 1. Station Bar Chart */}
            <div className="glass-panel"
                style={{
                    padding: '1.5rem',
                    borderRadius: '20px',
                    background: cardBg,
                    border: `1px solid ${cardBorder}`,
                    boxShadow: cardShadow
                }}>
                <h3 style={{ color: textColor, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.1rem' }}>
                    <div style={{ width: '4px', height: '24px', background: '#f59e0b', borderRadius: '2px' }}></div>
                    Malfunctions/Station
                </h3>
                <ReactECharts option={barOption} style={{ height: '350px' }} theme={isDark ? "dark" : undefined} />
            </div>

            {/* 2. Grid for Pies */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                {/* Gate Pie */}
                <div className="glass-panel"
                    style={{
                        padding: '1.5rem',
                        borderRadius: '20px',
                        background: cardBg,
                        border: `1px solid ${cardBorder}`,
                        boxShadow: cardShadow
                    }}>
                    <h3 style={{ color: textColor, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.1rem' }}>
                        <div style={{ width: '4px', height: '24px', background: '#3b82f6', borderRadius: '2px' }}></div>
                        Gate Malfunctions
                    </h3>
                    <ReactECharts option={getPieOption(gateData, '#3b82f6', '#2563eb')} style={{ height: '320px' }} />
                </div>

                {/* ATIM Pie */}
                <div className="glass-panel"
                    style={{
                        padding: '1.5rem',
                        borderRadius: '20px',
                        background: cardBg,
                        border: `1px solid ${cardBorder}`,
                        boxShadow: cardShadow
                    }}>
                    <h3 style={{ color: textColor, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.1rem' }}>
                        <div style={{ width: '4px', height: '24px', background: '#10b981', borderRadius: '2px' }}></div>
                        ATIM Malfunctions
                    </h3>
                    <ReactECharts option={getPieOption(atimData, '#10b981', '#059669')} style={{ height: '320px' }} />
                </div>

            </div>
        </div>
    );
}

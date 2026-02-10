"use client";

import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import { useTheme } from "./ThemeProvider";

interface Dashboard3DChartsProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[];
}

export default function Dashboard3DCharts({ data }: Dashboard3DChartsProps) {
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
        data.forEach(r => {
            const s = r.Station || "Unknown";
            sCounts[s] = (sCounts[s] || 0) + 1;
        });

        // Map strict order. User requested specific order. We will show ALL stations to keep x-axis consistent.
        const stations = STATION_ORDER;
        const sValues = STATION_ORDER.map(s => sCounts[s] || 0);

        // Gate
        const gCounts: Record<string, number> = {};
        data.filter(r => r.Device === "GATE").forEach(r => {
            const m = r.Malfunction || "Unknown";
            gCounts[m] = (gCounts[m] || 0) + 1;
        });
        const gateProcessed = processData(gCounts);

        // ATIM
        const aCounts: Record<string, number> = {};
        data.filter(r => r.Device === "ATIM").forEach(r => {
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
    }, [data]);

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getPieOption = (data: any[]) => {
        const PIE_COLORS = [
            '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
            '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
        ];

        return {
            tooltip: {
                trigger: 'item',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter: (params: any) => {
                    return `<b>${params.name}</b><br/>${params.value} Reports (${params.percent}%)`;
                },
                backgroundColor: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                borderColor: isDark ? '#475569' : '#cbd5e1',
                textStyle: {
                    color: isDark ? '#fff' : '#1e293b'
                }
            },
            series: [
                {
                    name: 'Malfunctions',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['50%', '50%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: isDark ? '#0b1120' : '#fff',
                        borderWidth: 2
                    },
                    label: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: 20,
                            fontWeight: 'bold',
                            color: isDark ? '#fff' : '#1e293b'
                        },
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    },
                    labelLine: {
                        show: false
                    },
                    data: Object.entries(data).map(([name, value], index) => ({
                        value,
                        name,
                        itemStyle: { color: PIE_COLORS[index % PIE_COLORS.length] }
                    }))
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
                    <ReactECharts option={getPieOption(gateData)} style={{ height: '320px' }} />
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
                    <ReactECharts option={getPieOption(atimData)} style={{ height: '320px' }} />
                </div>

            </div>
        </div>
    );
}

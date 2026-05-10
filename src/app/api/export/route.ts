import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
// @ts-expect-error - No types available
import XlsxPopulate from 'xlsx-populate';

export async function POST(request: Request) {
    try {
        const { reports, startDate, endDate } = await request.json();

        // 1. Read the Template file
        const templatePath = path.join(process.cwd(), 'public', 'Template.xlsx');
        const templateBuffer = await fs.readFile(templatePath);

        // 2. Load into xlsx-populate
        const workbook = await XlsxPopulate.fromDataAsync(templateBuffer);

        // 3. Get Sheets
        const atimSheet = workbook.sheet("ATIM");
        const gateSheet = workbook.sheet("GATE");
        const chartDataSheet = workbook.sheet("ChartData");

        const atimReports = reports.filter((r: any) => r.Device && r.Device.toUpperCase().includes("ATIM"));
        const gateReports = reports.filter((r: any) => r.Device && r.Device.toUpperCase().includes("GATE"));

        const formatDate = (dateString: string) => {
            if (!dateString) return "";
            const d = new Date(dateString);
            if (isNaN(d.getTime())) return dateString;
            
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            
            return `${day}/${month}/${year} ${hours}:${minutes}`;
        };

        // Helper to populate raw list sheets
        const populateListSheet = (sheet: any, data: any[]) => {
            // First, recreate the beautiful Header row
            const headers = [
                "Reported By", "Date", "Station", "Device", "Tag", "Status", 
                "Alarm Code", "Malfunction", "Impact", "Repair Process", 
                "Assigned To", "Final Result", "Comments"
            ];
            
            headers.forEach((header, idx) => {
                const colLetter = String.fromCharCode(65 + idx); // A, B, C...
                const cell = sheet.cell(`${colLetter}1`);
                cell.value(header);
                cell.style({
                    fill: "0F5132",
                    fontColor: "FFFFFF",
                    bold: true,
                    fontSize: 11,
                    fontFamily: "Arial",
                    verticalAlignment: "center",
                    horizontalAlignment: "center"
                });
            });
            sheet.row(1).height(30);
            
            // Adjust column widths manually since xlsx-populate doesn't auto-fit easily
            sheet.column("A").width(25);
            sheet.column("B").width(22);
            sheet.column("C").width(15);
            sheet.column("D").width(10);
            sheet.column("E").width(10);
            sheet.column("F").width(15);
            sheet.column("G").width(15);
            sheet.column("H").width(40);
            sheet.column("I").width(20);
            sheet.column("J").width(40);
            sheet.column("K").width(20);
            sheet.column("L").width(20);
            sheet.column("M").width(40);

            // Now populate Data
            let rowIdx = 2; // Start after headers
            data.forEach((r: any) => {
                const rowValues = [
                    r["Reported By"] || "",
                    formatDate(r["Date"] || r["reportedDate"]),
                    r["Station"] || "",
                    r["Device"] || "",
                    r["Tag"] || "",
                    r["Status"] || "",
                    r["Alarm Code"] || "",
                    r["Malfunction"] || "",
                    r["Impact"] || "",
                    r["Repair Process"] || "",
                    r["Assigned To"] || "",
                    r["Final Result"] || "",
                    r["Comments"] || ""
                ];

                rowValues.forEach((val, idx) => {
                    const colLetter = String.fromCharCode(65 + idx); // A, B, C...
                    const cell = sheet.cell(`${colLetter}${rowIdx}`);
                    cell.value(val);
                    
                    const isAlternate = rowIdx % 2 === 0;
                    
                    // Add standard borders and text wrapping
                    cell.style({
                        fill: isAlternate ? "E2EFDA" : "FFFFFF",
                        leftBorderStyle: "thin",
                        leftBorderColor: "E5E7EB",
                        rightBorderStyle: "thin",
                        rightBorderColor: "E5E7EB",
                        topBorderStyle: "thin",
                        topBorderColor: "E5E7EB",
                        bottomBorderStyle: "thin",
                        bottomBorderColor: "E5E7EB",
                        verticalAlignment: "center",
                        fontFamily: "Arial",
                        fontSize: 10,
                        wrapText: true
                    });
                });
                rowIdx++;
            });
            
            // Apply AutoFilter to the entire populated range
            const lastRow = rowIdx - 1;
            sheet.autoFilter(sheet.range(`A1:M${lastRow}`));
        };

        populateListSheet(atimSheet, atimReports);
        populateListSheet(gateSheet, gateReports);

        // 4. Fill ChartData calculations
        const stationCounts: Record<string, number> = {};
        const gateCounts: Record<string, number> = {};
        const atimCounts: Record<string, number> = {};

        reports.forEach((r: any) => {
            const s = r.Station || "Unknown";
            stationCounts[s] = (stationCounts[s] || 0) + 1;
        });
        gateReports.forEach((r: any) => {
            const m = r.Malfunction || "Unknown";
            gateCounts[m] = (gateCounts[m] || 0) + 1;
        });
        atimReports.forEach((r: any) => {
            const m = r.Malfunction || "Unknown";
            atimCounts[m] = (atimCounts[m] || 0) + 1;
        });

        const STATION_ORDER = [
            "1(NRS)", "2(DMK)", "3(VNZ)", "4(AGS)", "5(SNT)", "6(PNP)",
            "7(PPF)", "8(EFK)", "9(FLM)", "10(ANP)", "11(MRT)", "12(VLG)", "13(NEL)"
        ];

        // Fill Station
        STATION_ORDER.forEach((st, idx) => {
            const rowNumber = idx + 2;
            chartDataSheet.cell(`A${rowNumber}`).value(st);
            chartDataSheet.cell(`B${rowNumber}`).value(stationCounts[st] || 0);
        });

        // Fill Gate
        Object.entries(gateCounts).sort((a,b) => b[1]-a[1]).forEach(([m, c], idx) => {
            const rowNumber = idx + 2;
            chartDataSheet.cell(`D${rowNumber}`).value(m);
            chartDataSheet.cell(`E${rowNumber}`).value(c);
        });

        // Fill ATIM
        Object.entries(atimCounts).sort((a,b) => b[1]-a[1]).forEach(([m, c], idx) => {
            const rowNumber = idx + 2;
            chartDataSheet.cell(`G${rowNumber}`).value(m);
            chartDataSheet.cell(`H${rowNumber}`).value(c);
        });

        // 5. Generate output buffer
        const outputBuffer = await workbook.outputAsync();

        // 6. Return the blob correctly for downloading
        const formatFilenameDate = (dateStr: string) => {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}-${month}-${year}`;
        };

        const fileStartDate = formatFilenameDate(startDate);
        const fileEndDate = formatFilenameDate(endDate);

        return new NextResponse(outputBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="AFC_Analytics_${fileStartDate}_to_${fileEndDate}.xlsx"`,
            },
        });

    } catch (error: any) {
        console.error("API Export Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

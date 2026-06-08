import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const googleUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;

    if (!googleUrl) {
        return NextResponse.json({ error: 'Configuration Error: Missing Google Script URL' }, { status: 500 });
    }

    try {
        const response = await fetch(`${googleUrl}?action=getShifts`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            const text = await response.text();
            console.error("Google Script Fetch Error:", text);
            return NextResponse.json({ error: 'Google Script responded with error' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Proxy Fetch Error:", error);
        return NextResponse.json({ error: 'Failed to connect to Google Sheets' }, { status: 500 });
    }
}

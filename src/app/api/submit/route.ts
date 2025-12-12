import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const data = await request.json();
    const googleUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;

    if (!googleUrl) {
        return NextResponse.json({ error: 'Configuration Error: Missing Google Script URL' }, { status: 500 });
    }

    try {
        // Google Apps Script Web Apps follow redirects (302). 
        // fetch server-side in Node follows them by default.
        const response = await fetch(googleUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            // Try to read error text if possible
            const text = await response.text();
            console.error("Google Script Error:", text);
            return NextResponse.json({ error: 'Google Script responded with error' }, { status: response.status });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Proxy Error:", error);
        return NextResponse.json({ error: 'Failed to connect to Google Sheets' }, { status: 500 });
    }
}

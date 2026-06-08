import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const data = await request.json();
    const googleUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;

    if (!googleUrl) {
        return NextResponse.json({ error: 'Configuration Error: Missing Google Script URL' }, { status: 500 });
    }

    try {
        const payload = {
            action: 'saveShifts',
            shiftsData: data
        };

        const response = await fetch(googleUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
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

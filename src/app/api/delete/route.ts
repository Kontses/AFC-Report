import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const data = await request.json();
    const googleUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;

    if (!googleUrl) {
        return NextResponse.json({ error: 'Configuration Error: Missing Google Script URL' }, { status: 500 });
    }

    if (!data.rowIndex) {
        return NextResponse.json({ error: 'Missing rowIndex' }, { status: 400 });
    }

    try {
        const payload = {
            action: "delete",
            rowIndex: data.rowIndex
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
            console.error("Google Script Delete Error:", text);
            return NextResponse.json({ error: 'Google Script responded with error' }, { status: response.status });
        }

        const result = await response.json();
        return NextResponse.json(result);

    } catch (error) {
        console.error("Delete Proxy Error:", error);
        return NextResponse.json({ error: 'Failed to connect to Google Sheets' }, { status: 500 });
    }
}

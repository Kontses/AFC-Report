import { Report } from './storage';

export async function submitReport(data: Partial<Report>): Promise<boolean> {
    try {
        const res = await fetch('/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!res.ok) return false;

        const json = await res.json();
        return json.success;
    } catch (e) {
        console.error("Submission failed", e);
        return false;
    }
}

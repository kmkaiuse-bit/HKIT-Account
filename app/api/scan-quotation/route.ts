import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'OPENROUTER_API_KEY not configured' }, { status: 500 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = file.type || 'image/jpeg';

    const body = {
      model: 'google/gemini-2.0-flash-lite',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${base64}` },
            },
            {
              type: 'text',
              text: 'Extract from this quotation or invoice: the supplier/company name, the total amount in HKD (number only, no currency symbol), and a brief description of the items or services. Return JSON only, no markdown: {"supplier_name":"...","amount":0,"description":"..."}',
            },
          ],
        },
      ],
    };

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://hkit-account.vercel.app',
        'X-Title': 'HKIT Payment Request System',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('OpenRouter error:', err);
      return NextResponse.json({ success: false, error: `OpenRouter: ${res.status} — ${err}` }, { status: 500 });
    }

    const data = await res.json();
    const content: string = data.choices?.[0]?.message?.content ?? '';

    // Strip markdown code fences if present
    const cleaned = content.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();

    let parsed: { supplier_name?: string; amount?: number; description?: string } = {};
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error('Failed to parse AI response:', cleaned);
      return NextResponse.json({ success: false, error: 'Could not parse AI response' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      supplier_name: parsed.supplier_name ?? '',
      amount: parsed.amount ?? '',
      description: parsed.description ?? '',
    });
  } catch (error) {
    console.error('scan-quotation error:', error);
    const message = error instanceof Error ? error.message : 'Scan failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

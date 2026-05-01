import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { item_name, merchant } = await req.json();

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY || '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `I just bought: "${item_name}" from "${merchant || 'unknown merchant'}".
Respond ONLY with a valid JSON object (no markdown, no explanation) with these fields:
{
  "typical_return_days": number or null,
  "typical_warranty_months": number or null,
  "suggested_category": one of "electronics|clothing|home|sports|beauty|books|food|other",
  "tip": "one short sentence tip about this purchase (returns, warranty, care, etc)"
}`
      }]
    })
  });

  const data = await res.json();
  const text = data.content?.[0]?.text || '{}';
  const clean = text.replace(/```json|```/g, '').trim();
  try {
    return NextResponse.json(JSON.parse(clean));
  } catch {
    return NextResponse.json({ tip: 'Could not parse AI response.' });
  }
}

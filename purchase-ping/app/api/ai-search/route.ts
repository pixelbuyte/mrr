import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { query, purchases } = await req.json();

  const purchaseList = purchases
    .map((p: any) => `- ${p.item_name} from ${p.merchant}, $${p.price}, bought ${p.order_date}${p.notes ? `, notes: ${p.notes}` : ''}`)
    .join('\n');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY || '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `Here are my purchases:\n${purchaseList}\n\nUser query: "${query}"\n\nHelp me find what I'm looking for. Be conversational, specific, and helpful. If you find matching items, mention them by name. Keep it under 150 words.`
      }]
    })
  });

  const data = await res.json();
  const answer = data.content?.[0]?.text || 'No answer found.';
  return NextResponse.json({ answer });
}

import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { systemPrompt, userMessage } = body

    if (!systemPrompt || !userMessage) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 3000,
        system: systemPrompt,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: userMessage }],
      }),
    })

    // Read as text first to avoid JSON parse crash
    const rawText = await response.text()

    let data: { content?: Array<{ type: string; text?: string }>; error?: { message?: string } }
    try {
      data = JSON.parse(rawText)
    } catch {
      return NextResponse.json({ error: 'API returned non-JSON: ' + rawText.slice(0, 200) }, { status: 500 })
    }

    if (!response.ok) {
      return NextResponse.json({ error: data?.error?.message ?? 'API error ' + response.status }, { status: response.status })
    }

    const text = (data.content ?? [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text ?? '')
      .join('\n')

    return NextResponse.json({ text })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

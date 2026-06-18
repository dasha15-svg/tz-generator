export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { systemPrompt, userMessage } = body

    if (!systemPrompt || !userMessage) {
      return Response.json({ error: 'Missing params' }, { status: 400 })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    })

    const raw = await response.text()

    let data: { content?: Array<{ type: string; text?: string }>; error?: { message?: string } }
    try {
      data = JSON.parse(raw)
    } catch {
      return Response.json({ error: 'API error: ' + raw.slice(0, 200) }, { status: 500 })
    }

    if (!response.ok) {
      return Response.json({ error: data?.error?.message ?? 'API error ' + response.status }, { status: response.status })
    }

    const text = (data.content ?? [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text ?? '')
      .join('\n')

    return Response.json({ text })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return Response.json({ error: message }, { status: 500 })
  }
}

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { systemPrompt, userMessage } = body

    if (!systemPrompt || !userMessage) {
      return Response.json({ error: 'Missing params' }, { status: 400 })
    }

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        stream: true,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    })

    if (!anthropicRes.ok) {
      const err = await anthropicRes.text()
      return Response.json({ error: err.slice(0, 200) }, { status: anthropicRes.status })
    }

    // Pipe SSE stream directly to client
    return new Response(anthropicRes.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (err: unknown) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}

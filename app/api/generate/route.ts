import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { systemPrompt, userMessage } = body

    if (!systemPrompt || !userMessage) {
      return NextResponse.json({ error: 'Missing systemPrompt or userMessage' }, { status: 400 })
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      system: systemPrompt,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{ role: 'user', content: userMessage }],
    } as Parameters<typeof client.messages.create>[0])

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map(b => b.text)
      .join('\n')

    return NextResponse.json({ text })
  } catch (err: unknown) {
    console.error('API error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

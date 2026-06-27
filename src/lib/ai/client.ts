import Anthropic from '@anthropic-ai/sdk'

function createClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY is not configured. ' +
        'Add it to your .env.local file.',
    )
  }
  return new Anthropic({ apiKey })
}

export const anthropic = createClient()

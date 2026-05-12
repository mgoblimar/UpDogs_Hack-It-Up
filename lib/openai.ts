import OpenAI from 'openai'

const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY

if (!apiKey) {
  throw new Error('Missing EXPO_PUBLIC_OPENAI_API_KEY. Check your .env file.')
}

export const openai = new OpenAI({ apiKey })

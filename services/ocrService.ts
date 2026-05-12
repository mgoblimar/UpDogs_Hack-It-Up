import { openai } from '@/lib/openai'
import type { BillInput } from '@/types/bill'

const OCR_PROVIDER = process.env.EXPO_PUBLIC_OCR_PROVIDER ?? 'openrouter'

const OCR_PROMPT = `You are an OCR specialist for Philippine Meralco electricity bills.
Extract ONLY the fields below from the bill image and return valid JSON.

IMPORTANT RULES:
- "totalAmount" = "Charges for this billing period" (NOT "Total Amount Due" which includes previous unpaid balance)
- "ratePerKwh" = the "Your rate this month ₱X.XX per kWh" value shown on front page
- "distributionCharge" = the Distribution (Meralco) subtotal (includes metering + supply sub-items)
- "taxes" = Government Taxes total (VAT)
- "universalCharges" = Universal Charges total
- "fitAll" = FiT-All (Renewable) total
- All amounts in Philippine Peso as plain numbers, no symbols
- Return null for any field not visible in the image

Return ONLY this JSON, no other text:
{
  "totalAmount": number or null,
  "kwh": number or null,
  "city": string or null,
  "billingMonth": string or null,
  "ratePerKwh": number or null,
  "generationCharge": number or null,
  "transmissionCharge": number or null,
  "systemLossCharge": number or null,
  "distributionCharge": number or null,
  "subsidies": number or null,
  "universalCharges": number or null,
  "fitAll": number or null,
  "taxes": number or null
}`

async function extractWithOpenRouter(base64Image: string): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY
  if (!apiKey) throw new Error('EXPO_PUBLIC_OPENROUTER_API_KEY is not set.')

  console.log('[OCR] Using OpenRouter, sending image...')
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'nvidia/nemotron-nano-12b-v2-vl:free',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: OCR_PROMPT },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    console.error('[OCR] OpenRouter HTTP error:', response.status, err)
    throw new Error(`OpenRouter API error ${response.status}: ${err}`)
  }

  const json = await response.json()
  console.log('[OCR] OpenRouter full JSON:', JSON.stringify(json))
  const text = json.choices?.[0]?.message?.content ?? ''
  console.log('[OCR] OpenRouter extracted text:', text)
  return text
}

async function extractWithGemini(base64Image: string): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY
  if (!apiKey) throw new Error('EXPO_PUBLIC_GEMINI_API_KEY is not set.')

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`

  console.log('[OCR] Using Gemini, sending image...')
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: OCR_PROMPT },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64Image,
              },
            },
          ],
        },
      ],
      generationConfig: { maxOutputTokens: 600 },
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    console.error('[OCR] Gemini HTTP error:', response.status, err)
    throw new Error(`Gemini API error ${response.status}: ${err}`)
  }

  const json = await response.json()
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  console.log('[OCR] Gemini raw response:', text)
  return text
}

async function extractWithOpenAI(base64Image: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 600,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${base64Image}`, detail: 'high' },
          },
          { type: 'text', text: OCR_PROMPT },
        ],
      },
    ],
  })
  return response.choices[0]?.message?.content ?? ''
}

export async function extractBillFromImage(base64Image: string): Promise<Partial<BillInput>> {
  const content =
    OCR_PROVIDER === 'openai'
      ? await extractWithOpenAI(base64Image)
      : OCR_PROVIDER === 'gemini'
      ? await extractWithGemini(base64Image)
      : await extractWithOpenRouter(base64Image)

  console.log('[OCR] Provider:', OCR_PROVIDER)
  console.log('[OCR] Full content:', content)
  // Strip markdown code fences if present (```json ... ``` or ``` ... ```)
  const stripped = content.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim()
  const jsonMatch = stripped.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    console.error('[OCR] No JSON found in response:', content)
    throw new Error('Hindi ma-extract ang data mula sa larawan. Subukan ang manual input.')
  }

  const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>
  const num = (v: unknown) => (typeof v === 'number' ? v : undefined)
  const str = (v: unknown) => (typeof v === 'string' ? v : undefined)

  return {
    totalAmount: num(parsed.totalAmount),
    kwh: num(parsed.kwh),
    city: str(parsed.city),
    billingMonth: str(parsed.billingMonth),
    ratePerKwh: num(parsed.ratePerKwh),
    generationCharge: num(parsed.generationCharge),
    transmissionCharge: num(parsed.transmissionCharge),
    systemLossCharge: num(parsed.systemLossCharge),
    distributionCharge: num(parsed.distributionCharge),
    subsidies: num(parsed.subsidies),
    universalCharges: num(parsed.universalCharges),
    fitAll: num(parsed.fitAll),
    taxes: num(parsed.taxes),
  }
}

import { openai } from '@/lib/openai'
import type { BillInput } from '@/types/bill'

const OCR_SYSTEM_PROMPT = `You are an OCR specialist for Philippine electricity bills (Meralco).
Extract bill data from the image and return ONLY valid JSON with this exact structure:
{
  "totalAmount": number,
  "kwh": number,
  "city": string,
  "billingMonth": string,
  "generationCharge": number or null,
  "transmissionCharge": number or null,
  "systemLossCharge": number or null,
  "distributionCharge": number or null,
  "supplyCharge": number or null,
  "meteringCharge": number or null,
  "subsidies": number or null,
  "taxes": number or null
}
All amounts in Philippine Peso (numbers only, no symbols). Return null for any field not found.`

export async function extractBillFromImage(base64Image: string): Promise<Partial<BillInput>> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
              detail: 'high',
            },
          },
          {
            type: 'text',
            text: OCR_SYSTEM_PROMPT,
          },
        ],
      },
    ],
  })

  const content = response.choices[0]?.message?.content ?? ''

  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Hindi ma-extract ang data mula sa larawan. Subukan ang manual input.')
  }

  const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>

  return {
    totalAmount: typeof parsed.totalAmount === 'number' ? parsed.totalAmount : undefined,
    kwh: typeof parsed.kwh === 'number' ? parsed.kwh : undefined,
    city: typeof parsed.city === 'string' ? parsed.city : undefined,
    billingMonth: typeof parsed.billingMonth === 'string' ? parsed.billingMonth : undefined,
    generationCharge: typeof parsed.generationCharge === 'number' ? parsed.generationCharge : undefined,
    transmissionCharge: typeof parsed.transmissionCharge === 'number' ? parsed.transmissionCharge : undefined,
    systemLossCharge: typeof parsed.systemLossCharge === 'number' ? parsed.systemLossCharge : undefined,
    distributionCharge: typeof parsed.distributionCharge === 'number' ? parsed.distributionCharge : undefined,
    supplyCharge: typeof parsed.supplyCharge === 'number' ? parsed.supplyCharge : undefined,
    meteringCharge: typeof parsed.meteringCharge === 'number' ? parsed.meteringCharge : undefined,
    subsidies: typeof parsed.subsidies === 'number' ? parsed.subsidies : undefined,
    taxes: typeof parsed.taxes === 'number' ? parsed.taxes : undefined,
  }
}

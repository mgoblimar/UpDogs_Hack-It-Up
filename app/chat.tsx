import { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useBillStore } from '@/store/billStore'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const CEREBRAS_API_KEY = process.env.EXPO_PUBLIC_CEREBRAS_API_KEY ?? ''

function buildSystemPrompt(billContext: string): string {
  return `Ikaw ay si KuryenteKo AI — isang matulungin na assistant para sa mga Pilipino tungkol sa kanilang kuryente at electricity bill.

Mag-sagot sa Taglish (halo ng Tagalog at English). Gumamit ng simple at madaling maintindihan na salita. Maging maikli at direkta sa punto, pero kumpleto ang impormasyon.

IYONG EXPERTISE:
- Meralco billing: generation, transmission, system loss, distribution, supply, metering charges
- ERC (Energy Regulatory Commission) rules at consumer rights
- Philippine electricity laws at regulations
- Lifeline rate para sa low-income households (0-100 kWh/month)
- Paano mag-file ng reklamo sa ERC o DTI
- Sub-meter abuse ng mga landlord
- Tips para mabawasan ang electricity bill
- Paliwanag ng mga technical terms sa electricity

ERC RATES (April 2026):
- Generation: max ₱8.3864/kWh
- Transmission: max ₱0.95/kWh
- System Loss: max ₱0.78/kWh (max 8.5% ng system load)
- Distribution: max ₱2.76/kWh (frozen since Aug 2022)
- Overall Meralco residential rate: max ₱14.3496/kWh

${billContext}

IMPORTANT RULES:
- Huwag lumampas ng 3 paragraphs ang sagot maliban kung kailangan talaga
- Gumamit ng bullet points para sa mga listahan
- Kung hindi mo alam ang sagot, sabihing "Hindi ko sigurado, pero pwede kang makipag-ugnayan sa Meralco hotline: 16211 o sa ERC."
- Huwag mag-recommend ng illegal na actions`
}

function buildBillContext(
  billInput: { totalAmount: number; kwh: number; city: string; ratePerKwh?: number } | null,
  verdict: { status: string; overchargeAmount: number; userRatePerKwh: number; ercMaxRatePerKwh: number } | null
): string {
  if (!billInput || !verdict) return ''

  const statusLabel =
    verdict.status === 'overcharged'
      ? 'NA-OVERCHARGE (rate ay higit sa ERC maximum)'
      : verdict.status === 'high'
      ? 'MATAAS (rate ay malapit sa ERC maximum)'
      : 'NORMAL (rate ay nasa loob ng ERC limits)'

  return `BILL NG USER (kasalukuyang session):
- Lungsod: ${billInput.city}
- Total bill: ₱${billInput.totalAmount.toFixed(2)}
- Consumption: ${billInput.kwh} kWh
- Rate: ₱${verdict.userRatePerKwh.toFixed(4)}/kWh
- Status: ${statusLabel}
- ERC max rate: ₱${verdict.ercMaxRatePerKwh.toFixed(4)}/kWh${
    verdict.overchargeAmount > 0
      ? `\n- Tinatayang labis na sinisingil: ₱${verdict.overchargeAmount.toFixed(2)}`
      : ''
  }

Gamitin ang context na ito kapag sumasagot tungkol sa bill ng user.`
}

const INITIAL_MESSAGE: Message = {
  id: '0',
  role: 'assistant',
  content:
    'Kumusta! Ako si KuryenteKo AI. 🤖⚡\n\nMaaari kang magtanong tungkol sa iyong electricity bill, mga charges, ERC rights, o kung paano mababawasan ang iyong bill.\n\nAno ang gusto mong malaman?',
}

export default function ChatScreen() {
  const billInput = useBillStore((s) => s.billInput)
  const verdict = useBillStore((s) => s.verdict)
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<ScrollView>(null)

  const hasBillContext = !!(billInput && verdict)

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true })
  }, [messages])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    try {
      const billContext = buildBillContext(
        billInput as Parameters<typeof buildBillContext>[0],
        verdict as Parameters<typeof buildBillContext>[1]
      )
      const systemPrompt = buildSystemPrompt(billContext)

      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...updatedMessages.map((m) => ({ role: m.role, content: m.content })),
      ]

      const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${CEREBRAS_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b',
          max_tokens: 600,
          messages: apiMessages,
        }),
      })

      if (!response.ok) {
        const err = await response.text()
        console.error('[Chat] Cerebras error:', response.status, err)
        throw new Error(`API error ${response.status}`)
      }

      const json = await response.json()
      const reply = json.choices?.[0]?.message?.content ?? ''

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: reply },
      ])
    } catch (err) {
      console.error('[Chat] Error:', err)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
            'Paumanhin, may error sa aking koneksyon. Subukan ulit mamaya. Para sa agarang tulong, tawagan ang Meralco hotline: **16211**.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-stone-50" edges={['bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        {/* Bill context banner */}
        {hasBillContext && (
          <View className="bg-brand-orange/10 border-b border-brand-orange/20 px-4 py-2">
            <Text className="text-brand-orange text-xs font-medium">
              🧾 May na-load na bill mula sa {billInput?.city} — pwede kang magtanong tungkol dito
            </Text>
          </View>
        )}

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4"
          contentContainerClassName="py-4 gap-3"
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}

          {loading && (
            <View className="flex-row items-center gap-2 px-3 py-3 bg-white rounded-2xl rounded-bl-sm self-start max-w-xs shadow-sm">
              <ActivityIndicator size="small" color="#F97316" />
              <Text className="text-stone-400 text-sm">Iniisip...</Text>
            </View>
          )}
        </ScrollView>

        {/* Input bar */}
        <View className="flex-row items-end gap-2 px-4 py-3 bg-white border-t border-stone-100">
          <TextInput
            className="flex-1 bg-stone-100 rounded-2xl px-4 py-3 text-stone-800 text-base"
            placeholder="Magtanong tungkol sa bill mo..."
            placeholderTextColor="#A8A29E"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={!input.trim() || loading}
            className={`rounded-full w-11 h-11 items-center justify-center ${
              input.trim() && !loading ? 'bg-brand-orange' : 'bg-stone-200'
            }`}
            activeOpacity={0.8}
          >
            <Text className="text-white text-lg">↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  return (
    <View className={`max-w-xs ${isUser ? 'self-end' : 'self-start'}`}>
      <View
        className={`rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-brand-orange rounded-br-sm'
            : 'bg-white rounded-bl-sm shadow-sm'
        }`}
      >
        <Text
          className={`text-sm leading-5 ${isUser ? 'text-white' : 'text-stone-800'}`}
        >
          {message.content}
        </Text>
      </View>
    </View>
  )
}

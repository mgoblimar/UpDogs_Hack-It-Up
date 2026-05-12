export interface FAQEntry {
  id: string
  question: string
  answer: string
  category: 'generation' | 'transmission' | 'system_loss' | 'lifeline' | 'complaint' | 'general'
  monthValid?: string
}

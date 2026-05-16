import { useState } from 'react'
import { useAudioRecorder, AudioModule, RecordingPresets } from 'expo-audio'

const GROQ_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY ?? ''

export function useVoiceInput(onTranscript: (text: string) => void) {
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY)

  async function startRecording() {
    setError(null)
    try {
      const status = await AudioModule.requestRecordingPermissionsAsync()
      if (!status.granted) {
        setError('Kailangan ng microphone permission.')
        return
      }
      await recorder.prepareToRecordAsync()
      recorder.record()
      setIsRecording(true)
    } catch (e) {
      console.error('[Voice] Start error:', e)
      setError('Hindi masimulang mag-record.')
    }
  }

  async function stopAndTranscribe() {
    if (!isRecording) return
    setIsRecording(false)
    setIsTranscribing(true)

    try {
      await recorder.stop()
      const uri = recorder.uri
      if (!uri) return

      const formData = new FormData()
      formData.append('file', { uri, type: 'audio/m4a', name: 'voice.m4a' } as unknown as Blob)
      formData.append('model', 'whisper-large-v3-turbo')

      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${GROQ_KEY}` },
        body: formData,
      })

      if (!response.ok) {
        const err = await response.text()
        console.error('[Voice] Groq error:', response.status, err)
        throw new Error(`Groq error ${response.status}`)
      }

      const json = await response.json()
      const transcript: string = json.text ?? ''
      if (transcript.trim()) onTranscript(transcript.trim())
    } catch (e) {
      console.error('[Voice] Transcribe error:', e)
      setError('Hindi ma-transcribe ang audio. Subukan ulit.')
    } finally {
      setIsTranscribing(false)
    }
  }

  function toggle() {
    if (isRecording) stopAndTranscribe()
    else startRecording()
  }

  return { toggle, isRecording, isTranscribing, error }
}

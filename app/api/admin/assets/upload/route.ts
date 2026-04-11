import { NextRequest } from 'next/server'
import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import mammoth from 'mammoth'
import { getAdminClient } from '@/lib/supabase-admin'

// App Router route segment config — allow up to 60 s for PDF text extraction.
// Body size is governed by the deployment platform (Vercel: 4.5 MB serverless),
// not by a per-route config in App Router (that pattern is Pages Router only).
export const maxDuration = 60

// Hardcoded tenant/owner for now — will be replaced with auth context
const HARDCODED_TENANT_ID = '00000000-0000-0000-0000-000000000001'
const HARDCODED_OWNER_ID = '00000000-0000-0000-0000-000000000001'

const ACCEPTED_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/plain': 'txt',
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

async function extractText(buffer: Buffer, mimeType: string): Promise<string> {
  const fileType = ACCEPTED_TYPES[mimeType]

  switch (fileType) {
    case 'pdf': {
      const base64 = buffer.toString('base64')
      const { text } = await generateText({
        model: anthropic('claude-sonnet-4-6'),
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'file',
                data: base64,
                mimeType: 'application/pdf',
              },
              {
                type: 'text',
                text: 'Extract all text from this document exactly as written. Return only the extracted text with no commentary.',
              },
            ],
          },
        ],
        maxTokens: 16000,
      })
      return text
    }
    case 'docx': {
      const result = await mammoth.extractRawText({ buffer })
      return result.value
    }
    case 'txt': {
      return buffer.toString('utf-8')
    }
    default:
      throw new Error(`Unsupported file type: ${mimeType}`)
  }
}

export async function POST(req: NextRequest) {
  console.log('[assets/upload] route hit')

  let formData: FormData
  try {
    formData = await req.formData()
  } catch (err) {
    console.error('[assets/upload] formData parse failed:', err)
    return Response.json({ error: 'Invalid multipart form data' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!file || !(file instanceof File)) {
    console.error('[assets/upload] missing file field, keys:', [...formData.keys()])
    return Response.json({ error: 'Missing file field' }, { status: 400 })
  }

  console.log('[assets/upload] file received:', { name: file.name, type: file.type, size: file.size })

  if (file.size > MAX_FILE_SIZE) {
    console.error('[assets/upload] file too large:', file.size)
    return Response.json({ error: 'File exceeds 10 MB limit' }, { status: 400 })
  }

  if (!ACCEPTED_TYPES[file.type]) {
    console.error('[assets/upload] unsupported type:', file.type)
    return Response.json(
      { error: `Unsupported file type. Accepted: ${Object.values(ACCEPTED_TYPES).join(', ')}` },
      { status: 400 },
    )
  }

  let raw: string
  try {
    console.log('[assets/upload] starting text extraction for type:', file.type)
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    raw = await extractText(buffer, file.type)
    console.log('[assets/upload] text extraction complete, length:', raw.length)
  } catch (err) {
    console.error('[assets/upload] text extraction failed:', err instanceof Error ? { message: err.message, stack: err.stack } : err)
    return Response.json({ error: 'Failed to extract text from file' }, { status: 422 })
  }

  if (!raw.trim()) {
    console.error('[assets/upload] extracted text is empty')
    return Response.json({ error: 'No text could be extracted from this file' }, { status: 422 })
  }

  const supabase = getAdminClient()

  console.log('[assets/upload] inserting content record:', { name: file.name, rawLength: raw.trim().length })
  const { data, error } = await supabase
    .from('content')
    .insert({
      tenant_id: HARDCODED_TENANT_ID,
      owner_id: HARDCODED_OWNER_ID,
      name: file.name,
      type: 'document',
      raw: raw.trim(),
    })
    .select('id, name, raw')
    .single()

  if (error) {
    console.error('[assets/upload] supabase insert failed:', { message: error.message, code: error.code, details: error.details, hint: error.hint })
    return Response.json({ error: error.message }, { status: 500 })
  }

  console.log('[assets/upload] success, content_id:', data.id)
  return Response.json({
    content_id: data.id,
    name: data.name,
    raw: data.raw,
  })
}

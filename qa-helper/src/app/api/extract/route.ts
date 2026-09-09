import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

export async function POST(req: Request) {
  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json(
      { error: 'Request harus berupa multipart form-data.' },
      { status: 400 }
    )
  }

  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'File tidak ditemukan.' }, { status: 400 })
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: 'Ukuran file maksimal 10 MB.' },
      { status: 400 }
    )
  }

  const name = file.name.toLowerCase()
  const text = await file.text()

  let extracted = ''
  if (name.endsWith('.txt') || name.endsWith('.md')) {
    extracted = text
  } else if (name.endsWith('.docx')) {
    const mammoth = await import('mammoth')
    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await mammoth.extractRawText({ buffer })
    extracted = result.value
  } else if (name.endsWith('.pdf')) {
    // pdf-parse v2 — dynamic import di runtime nodejs
    const mod = await import('pdf-parse')
    const PDFParse = mod.PDFParse
    const buffer = Buffer.from(await file.arrayBuffer())
    const parser = new PDFParse({ data: new Uint8Array(buffer) })
    const parsed = await parser.getText()
    extracted = parsed?.text ?? ''
  } else {
    return NextResponse.json(
      { error: 'Format tidak didukung. Gunakan .pdf, .docx, .txt, atau .md.' },
      { status: 400 }
    )
  }

  const clean = extracted.trim()
  if (!clean) {
    return NextResponse.json(
      { error: 'Tidak ada teks yang bisa dibaca dari file tersebut.' },
      { status: 422 }
    )
  }

  return NextResponse.json({ text: clean, fileName: file.name })
}

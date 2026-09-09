export interface InvitationData {
  groom?: {
    name: string
    fullName?: string
    nickname?: string
    instagram?: string
    sonOf?: string
  }
  bride?: {
    name: string
    fullName?: string
    nickname?: string
    instagram?: string
    daughterOf?: string
  }
  quote?: string
  quoteSource?: string
  event?: {
    title?: string
    date?: string
    time?: string
    venue?: string
    address?: string
    mapsUrl?: string
  }
  story?: Array<{ title: string; date?: string; text: string }>
  gift?: {
    // Single-account (legacy) form
    bankName?: string
    accountNumber?: string
    accountName?: string
    address?: string
    // Multiple accounts form
    accounts?: Array<{
      bankName?: string
      accountNumber?: string
      accountName?: string
    }>
  }
  streaming?: { url?: string }
  dresscode?: string
  gallery?: string[]
  sections?: {
    story?: boolean
    gift?: boolean
    streaming?: boolean
    gallery?: boolean
    dresscode?: boolean
    maps?: boolean
  }
}

export function parseInvitationData(raw: string): InvitationData {
  try {
    return JSON.parse(raw) as InvitationData
  } catch {
    return {}
  }
}

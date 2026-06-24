import { createHmac, timingSafeEqual } from 'crypto'

function getSecret(): string {
  const secret = process.env.NEWSLETTER_UNSUBSCRIBE_SECRET?.trim()
  if (!secret) {
    throw new Error('NEWSLETTER_UNSUBSCRIBE_SECRET ist nicht konfiguriert')
  }
  return secret
}

export function createUnsubscribeToken(contactId: string): string {
  const signature = createHmac('sha256', getSecret()).update(contactId).digest('hex')
  return Buffer.from(`${contactId}.${signature}`).toString('base64url')
}

export function verifyUnsubscribeToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8')
    const dotIndex = decoded.indexOf('.')
    if (dotIndex === -1) return null

    const contactId = decoded.slice(0, dotIndex)
    const signature = decoded.slice(dotIndex + 1)
    if (!contactId || !signature) return null

    const expected = createHmac('sha256', getSecret()).update(contactId).digest('hex')
    const sigBuffer = Buffer.from(signature)
    const expectedBuffer = Buffer.from(expected)

    if (sigBuffer.length !== expectedBuffer.length) return null
    if (!timingSafeEqual(sigBuffer, expectedBuffer)) return null

    return contactId
  } catch {
    return null
  }
}

export function getUnsubscribeUrl(contactId: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3000'
  const token = createUnsubscribeToken(contactId)
  return `${siteUrl}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`
}

export function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function wrapNewsletterHtml(options: {
  previewText?: string | null
  bodyHtml: string
  unsubscribeUrl?: string | null
}): string {
  const preview = options.previewText?.trim()
  const preheader = preview
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preview)}</div>`
    : ''

  const footer = options.unsubscribeUrl
    ? `<p style="margin-top:32px;font-size:12px;color:#666;">
        Du erhältst diese E-Mail, weil du Kontakt mit tierisch gut betreut hattest.
        <a href="${escapeHtml(options.unsubscribeUrl)}" style="color:#666;">Newsletter abbestellen</a>
      </p>`
    : `<p style="margin-top:32px;font-size:12px;color:#666;">
        tierisch gut betreut GmbH · Test-Mail
      </p>`

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Georgia,serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:24px;">
${preheader}
<div>${options.bodyHtml}</div>
${footer}
</body>
</html>`
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function buildPlainText(bodyHtml: string, unsubscribeUrl?: string | null): string {
  const text = stripHtml(bodyHtml)
  if (unsubscribeUrl) {
    return `${text}\n\n---\nNewsletter abbestellen: ${unsubscribeUrl}`
  }
  return text
}

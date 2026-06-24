import type { SupabaseClient } from '@supabase/supabase-js'
import { sendNewsletterEmail } from '@/lib/email'
import { getUnsubscribeUrl } from '@/lib/newsletter-unsubscribe'
import { resolveNewsletterRecipients } from '@/lib/newsletter-groups'
import { buildPlainText, wrapNewsletterHtml } from '@/lib/newsletter-template'
import type { NewsletterCampaign } from '@/lib/types'

async function finalizeCampaign(
  adminClient: SupabaseClient,
  campaignId: string,
  stats: { sent: number; failed: number; skipped: number }
) {
  const status = stats.failed > 0 && stats.sent === 0 ? 'failed' : 'sent'

  await adminClient
    .from('newsletter_campaigns')
    .update({
      status,
      sent_at: new Date().toISOString(),
      stats,
      updated_at: new Date().toISOString(),
    })
    .eq('id', campaignId)

  return stats
}

export async function executeCampaignSend(
  adminClient: SupabaseClient,
  campaign: NewsletterCampaign
): Promise<{ sent: number; failed: number; skipped: number }> {
  await adminClient
    .from('newsletter_campaigns')
    .update({ status: 'sending', updated_at: new Date().toISOString() })
    .eq('id', campaign.id)

  const recipients = await resolveNewsletterRecipients(adminClient, campaign.recipient_config)
  let sent = 0
  let failed = 0

  for (const contact of recipients) {
    const unsubscribeUrl = getUnsubscribeUrl(contact.id)
    const html = wrapNewsletterHtml({
      previewText: campaign.preview_text,
      bodyHtml: campaign.html_body,
      unsubscribeUrl,
    })
    const text = campaign.plain_text || buildPlainText(campaign.html_body, unsubscribeUrl)

    const result = await sendNewsletterEmail({
      to: contact.email.trim(),
      subject: campaign.subject,
      html,
      text,
      replyTo: campaign.reply_to || undefined,
      previewText: campaign.preview_text || undefined,
      unsubscribeUrl,
      listUnsubscribeUrl: unsubscribeUrl,
    })

    if (result.status === 'sent') {
      sent += 1
      await adminClient.from('newsletter_send_logs').insert({
        campaign_id: campaign.id,
        contact_id: contact.id,
        email: contact.email,
        status: 'sent',
      })
    } else {
      failed += 1
      await adminClient.from('newsletter_send_logs').insert({
        campaign_id: campaign.id,
        contact_id: contact.id,
        email: contact.email,
        status: 'failed',
        error_message: result.error,
      })
    }

    await new Promise((r) => setTimeout(r, 500))
  }

  return finalizeCampaign(adminClient, campaign.id, { sent, failed, skipped: 0 })
}

export async function sendCampaignTestEmail(
  campaign: Pick<NewsletterCampaign, 'subject' | 'preview_text' | 'html_body' | 'plain_text' | 'reply_to'>,
  testEmail: string
) {
  const html = wrapNewsletterHtml({
    previewText: campaign.preview_text,
    bodyHtml: campaign.html_body,
    unsubscribeUrl: null,
  })
  const text = campaign.plain_text || buildPlainText(campaign.html_body)

  return sendNewsletterEmail({
    to: testEmail,
    subject: `[Test] ${campaign.subject}`,
    html,
    text,
    replyTo: campaign.reply_to || undefined,
    previewText: campaign.preview_text || undefined,
  })
}

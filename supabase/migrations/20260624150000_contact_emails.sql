-- Transaktionale E-Mails an Kontakte (Lead/Kunde): Verlauf ausgehend + vorbereitet für eingehend (Phase 2)

CREATE TABLE IF NOT EXISTS contact_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  direction text NOT NULL DEFAULT 'outbound'
    CHECK (direction IN ('outbound', 'inbound')),
  to_email text NOT NULL,
  from_email text NOT NULL,
  subject text NOT NULL DEFAULT '',
  body_text text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'sent'
    CHECK (status IN ('sent', 'failed', 'received')),
  error_message text,
  message_id text,
  in_reply_to text,
  sent_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_emails_contact_id_created_at
  ON contact_emails(contact_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_emails_message_id
  ON contact_emails(message_id)
  WHERE message_id IS NOT NULL;

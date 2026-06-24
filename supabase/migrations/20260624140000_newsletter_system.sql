-- Newsletter-System: Kampagnen, Templates, Topics, Send-Logs

ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS newsletter_unsubscribed_at timestamptz;

CREATE TABLE IF NOT EXISTS newsletter_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS newsletter_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject_template text NOT NULL DEFAULT '',
  preview_text text,
  html_body text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL DEFAULT '',
  preview_text text,
  html_body text NOT NULL DEFAULT '',
  plain_text text,
  from_address text,
  reply_to text,
  topic_id uuid REFERENCES newsletter_topics(id) ON DELETE SET NULL,
  recipient_config jsonb NOT NULL DEFAULT '{"groups":[],"contactIds":[]}'::jsonb,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  stats jsonb NOT NULL DEFAULT '{"sent":0,"failed":0,"skipped":0}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS newsletter_send_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  email text NOT NULL,
  status text NOT NULL CHECK (status IN ('sent', 'failed', 'skipped_unsubscribed')),
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_status ON newsletter_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_scheduled_at ON newsletter_campaigns(scheduled_at)
  WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_newsletter_send_logs_campaign_id ON newsletter_send_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_contacts_newsletter_unsubscribed ON contacts(newsletter_unsubscribed_at)
  WHERE newsletter_unsubscribed_at IS NULL;

INSERT INTO newsletter_topics (name, description, is_active)
SELECT 'Allgemein', 'Allgemeine Neuigkeiten von tierisch gut betreut', true
WHERE NOT EXISTS (SELECT 1 FROM newsletter_topics WHERE name = 'Allgemein');

INSERT INTO newsletter_templates (name, subject_template, preview_text, html_body)
SELECT 'Willkommen', 'Neuigkeiten von tierisch gut betreut', 'Aktuelle Updates zu unserer Tierbetreuung',
'<p>Hallo,</p><p>wir haben spannende Neuigkeiten für Dich und Dein Tier.</p><p>Herzliche Grüße<br>Tamara und Gabriel</p>'
WHERE NOT EXISTS (SELECT 1 FROM newsletter_templates WHERE name = 'Willkommen');

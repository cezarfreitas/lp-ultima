export interface WebhookSettings {
  id: number;
  lead_webhook_url: string;
  consumer_webhook_url: string;
  webhook_secret?: string;
  lead_webhook_enabled: boolean;
  consumer_webhook_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface WebhookUpdateRequest {
  lead_webhook_url?: string;
  consumer_webhook_url?: string;
  webhook_secret?: string;
  lead_webhook_enabled?: boolean;
  consumer_webhook_enabled?: boolean;
}

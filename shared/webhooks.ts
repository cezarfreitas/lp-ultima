export interface WebhookSettings {
  id: number;
  webhook_url: string;
  webhook_secret?: string;
  webhook_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface WebhookUpdateRequest {
  webhook_url?: string;
  webhook_secret?: string;
  webhook_enabled?: boolean;
}

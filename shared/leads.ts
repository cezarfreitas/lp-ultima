export interface Lead {
  id: number;
  name: string;
  email: string;
  whatsapp?: string;
  has_cnpj: 'sim' | 'nao';
  store_type?: 'fisica' | 'online' | 'fisica_online' | 'midias_sociais';
  cep?: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  webhook_sent: boolean;
  webhook_attempts: number;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
}

export interface LeadCreateRequest {
  name: string;
  whatsapp: string;
  has_cnpj: 'sim' | 'nao';
  store_type?: 'fisica' | 'online' | 'fisica_online' | 'midias_sociais';
  cep?: string;
}

export interface LeadUpdateRequest {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  message?: string;
  status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
}

export interface WebhookConfig {
  url: string;
  secret?: string;
  enabled: boolean;
}

export const LEAD_STATUSES = [
  { value: 'new', label: 'Novo', color: 'blue' },
  { value: 'contacted', label: 'Contatado', color: 'yellow' },
  { value: 'qualified', label: 'Qualificado', color: 'green' },
  { value: 'converted', label: 'Convertido', color: 'purple' },
  { value: 'lost', label: 'Perdido', color: 'red' },
] as const;

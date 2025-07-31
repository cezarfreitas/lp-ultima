export interface HeroSectionData {
  id: number;
  logo_text: string;
  impact_title: string;
  impact_subtitle: string;
  description: string;
  button_text: string;
  background_image: string;
  created_at: string;
  updated_at: string;
}

export interface HeroUpdateRequest {
  logo_text?: string;
  impact_title?: string;
  impact_subtitle?: string;
  description?: string;
  button_text?: string;
  background_image?: string;
}

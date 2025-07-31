export interface FormContent {
  id: number;
  main_title: string;
  main_subtitle: string;
  form_title: string;
  form_subtitle: string;
  benefit1_title: string;
  benefit1_description: string;
  benefit2_title: string;
  benefit2_description: string;
  benefit3_title: string;
  benefit3_description: string;
  benefit4_title: string;
  benefit4_description: string;
  created_at: string;
  updated_at: string;
}

export interface FormContentUpdateRequest {
  main_title?: string;
  main_subtitle?: string;
  form_title?: string;
  form_subtitle?: string;
  benefit1_title?: string;
  benefit1_description?: string;
  benefit2_title?: string;
  benefit2_description?: string;
  benefit3_title?: string;
  benefit3_description?: string;
  benefit4_title?: string;
  benefit4_description?: string;
}

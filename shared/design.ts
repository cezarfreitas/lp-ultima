export interface DesignSettings {
  id: number;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  font_family: string;
  font_size_base: string;
  font_weight_normal: string;
  font_weight_bold: string;
  border_radius: string;
  created_at: string;
  updated_at: string;
}

export interface DesignUpdateRequest {
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  background_color?: string;
  text_color?: string;
  font_family?: string;
  font_size_base?: string;
  font_weight_normal?: string;
  font_weight_bold?: string;
  border_radius?: string;
}

export const AVAILABLE_FONTS = [
  "Inter",
  "Roboto",
  "Poppins",
  "Montserrat",
  "Lato",
  "Open Sans",
  "Nunito",
  "Source Sans Pro",
  "Raleway",
  "Playfair Display",
];

export const FONT_SIZES = ["14px", "16px", "18px", "20px", "22px"];

export const FONT_WEIGHTS = ["300", "400", "500", "600", "700", "800", "900"];

export const BORDER_RADIUS_OPTIONS = [
  "0px",
  "4px",
  "8px",
  "12px",
  "16px",
  "24px",
];

export type BrandingConfig = {
  productName: string;
  logoPath: string;
  favicon: string;
  companyName: string;
  contactEmail: string;
  websiteUrl: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  social: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
};

// Default configuration that buyers will replace
export const defaultBranding: BrandingConfig = {
  productName: "Formix",
  logoPath: "/logo.png",
  favicon: "/favicon.ico",
  companyName: "Your Company",
  contactEmail: "support@example.com",
  websiteUrl: "https://example.com",
  colors: {
    primary: "#16a34a",
    secondary: "#15803d",
    accent: "#86efac",
  },
  social: {
    twitter: "https://twitter.com/yourcompany",
    linkedin: "https://linkedin.com/company/yourcompany",
  },
};
export type Property = {
  property: string;
  certificateType: string;
  expiryDate: string;
  linkToCertificate: string;
};

export type PropertyExpiration = {
  expiringInDays: number;
  hasExpired: boolean;
};

export type PropertyWithExpiration = Property & PropertyExpiration;

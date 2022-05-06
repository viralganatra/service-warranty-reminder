export type Service = {
  property: string;
  certificateType: string;
  expiryDate: string;
  linkToCertificate: string;
};

export type ServiceExpiration = {
  expiringInDays: number;
  hasExpired: boolean;
};

export type ServiceWithExpiration = Service & ServiceExpiration;

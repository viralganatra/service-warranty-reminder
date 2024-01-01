import { z } from 'zod';

export const serviceSchema = z.object({
  property: z.string(),
  certificateType: z.string(),
  expiryDate: z.coerce.date(),
  linkToCertificate: z.string(),
});

export const serviceExpirationSchema = z.object({
  expiringInDays: z.number(),
  hasExpired: z.boolean(),
});

export const serviceWithExpirationSchema = serviceSchema.merge(serviceExpirationSchema);

export type Service = z.infer<typeof serviceSchema>;
export type ServiceExpiration = z.infer<typeof serviceExpirationSchema>;
export type ServiceWithExpiration = z.infer<typeof serviceWithExpirationSchema>;

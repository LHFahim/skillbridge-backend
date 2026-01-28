import { CurrencyEnum } from "../../prisma/generated/prisma/client";

export interface ICreateTutorProfile {
  userId: string;
  categories: string[];
  yearsExperience: number;
  hourlyRate: number;
}

export interface IUpdateTutorProfile {
  hourlyRate?: number;
  currency?: CurrencyEnum;
  yearsExperience?: number;
  isActive?: boolean;

  categoryIds?: string[];
}

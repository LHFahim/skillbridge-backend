import { CurrencyEnum, Prisma } from "../../../prisma/generated/prisma/client";
import { prisma } from "../../lib/prisma";

const getAllTutors = async ({
  search,
  categoryIds,
  minRate,
  maxRate,
  currency,
  page,
  limit,
  skip,
  sortBy,
  sortOrder,
}: {
  search: string | undefined;
  categoryIds: string[];
  minRate: number | undefined;
  maxRate: number | undefined;
  currency: string | undefined;
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
}) => {
  const queries: Prisma.TutorProfileEntityWhereInput[] = [];

  if (
    currency &&
    Object.values(CurrencyEnum).includes(currency as CurrencyEnum)
  ) {
    queries.push({ currency: currency as CurrencyEnum });
  }

  if (minRate !== undefined && !Number.isNaN(minRate)) {
    queries.push({
      hourlyRate: {
        gte: minRate,
      },
    });
  }

  if (maxRate !== undefined && !Number.isNaN(maxRate)) {
    queries.push({
      hourlyRate: {
        lte: maxRate,
      },
    });
  }

  if (categoryIds.length > 0) {
    queries.push({
      categories: {
        some: {
          id: { in: categoryIds },
        },
      },
    });
  }

  if (search) {
    queries.push({
      OR: [
        {
          user: {
            name: { contains: search, mode: "insensitive" },
          },
        },
        {
          user: {
            email: { contains: search, mode: "insensitive" },
          },
        },
        {
          categories: {
            some: {
              name: { contains: search, mode: "insensitive" },
            },
          },
        },
      ],
    });
  }

  const tutors = await prisma.tutorProfileEntity.findMany({
    take: limit,
    skip,
    where: { AND: queries },
    orderBy: { [sortBy]: sortOrder },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      categories: true,
      // availabilitySlots: true,
      // bookings: true,
    },
  });

  const total = await prisma.tutorProfileEntity.count({
    where: { AND: queries },
  });

  return {
    data: tutors,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const tutorService = {
  getAllTutors,
};

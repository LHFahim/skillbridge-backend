import { Prisma } from "../../../prisma/generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createReview = async ({
  studentId,
  bookingId,
  rating,
  comment,
}: {
  studentId: string;
  bookingId: string;
  rating: number;
  comment?: string;
}) => {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    throw new Error("Rating must be an integer between 1 and 5");

  return await prisma.$transaction(async (tx) => {
    const booking = await tx.bookingEntity.findFirst({
      where: { id: bookingId, studentId },
      select: {
        id: true,
        status: true,
        tutorProfileId: true,
      },
    });
    if (!booking) throw new Error("Booking not found");

    // if (booking.status !== BookingStatusEnum.COMPLETED)
    //   throw new Error("Only completed bookings can be reviewed");

    const existing = await tx.reviewEntity.findUnique({
      where: { bookingId },
      select: { id: true },
    });

    if (existing) throw new Error("This booking has already been reviewed");

    const review = await tx.reviewEntity.create({
      data: {
        bookingId,
        studentId,
        tutorProfileId: booking.tutorProfileId,
        rating,
        comment: comment ?? null,
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        tutorProfile: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        booking: {
          include: { slot: true },
        },
      },
    });

    return review;
  });
};

const getTutorReviews = async ({
  tutorProfileId,
  minRating,
  page,
  limit,
  skip,
  sortBy,
  sortOrder,
}: {
  tutorProfileId: string;
  minRating: number | undefined;
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
}) => {
  const queries: Prisma.ReviewEntityWhereInput[] = [{ tutorProfileId }];

  if (minRating !== undefined && !Number.isNaN(minRating)) {
    queries.push({ rating: { gte: minRating } });
  }

  const where: Prisma.ReviewEntityWhereInput = { AND: queries };

  const data = await prisma.reviewEntity.findMany({
    take: limit,
    skip,
    where,
    orderBy: { [sortBy]: sortOrder },
    include: {
      student: { select: { id: true, name: true } },
    },
  });

  const total = await prisma.reviewEntity.count({ where });

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getTutorRatingSummary = async (tutorProfileId: string) => {
  const aggregatedResult = await prisma.reviewEntity.aggregate({
    where: { tutorProfileId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return {
    averageRating: aggregatedResult._avg.rating
      ? Number(aggregatedResult._avg.rating.toFixed(2))
      : 0,
    totalReviews: aggregatedResult._count.rating ?? 0,
  };
};

export const reviewService = {
  createReview,
  getTutorReviews,
  getTutorRatingSummary,
};

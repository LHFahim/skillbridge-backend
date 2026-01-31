import { Prisma } from "../../../prisma/generated/prisma/client";
import {
  AvailabilityStatusEnum,
  BookingStatusEnum,
  CancelledByEnum,
} from "../../../prisma/generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const createBooking = async ({
  studentId,
  slotId,
}: {
  studentId: string;
  slotId: string;
  cancelReason?: string;
}) => {
  return prisma.$transaction(async (tx) => {
    const slot = await tx.availabilitySlotEntity.findUnique({
      where: { id: slotId },
      select: {
        id: true,
        status: true,
        tutorProfileId: true,
        startAt: true,
        endAt: true,
      },
    });

    if (!slot) throw new Error("Slot not found");

    if (slot.status !== AvailabilityStatusEnum.OPEN)
      throw new Error("Slot is not available for booking");

    const updated = await tx.availabilitySlotEntity.updateMany({
      where: {
        id: slotId,
        status: AvailabilityStatusEnum.OPEN,
      },
      data: {
        status: AvailabilityStatusEnum.BOOKED,
      },
    });

    if (updated.count !== 1)
      throw new Error(
        "Failed to book the slot, it might have been booked already",
      );

    const booking = await tx.bookingEntity.create({
      data: {
        studentId,
        tutorProfileId: slot.tutorProfileId,
        slotId: slot.id,
        status: BookingStatusEnum.CONFIRMED,
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        tutorProfile: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            categories: true,
          },
        },
        slot: true,
      },
    });

    return booking;
  });
};

const getMyBookings = async ({
  studentId,
  status,
  page,
  limit,
  skip,
  sortBy,
  sortOrder,
}: {
  studentId: string;
  status: string | undefined;
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
}) => {
  const queries: Prisma.BookingEntityWhereInput[] = [{ studentId }];

  if (
    status &&
    Object.values(BookingStatusEnum).includes(status as BookingStatusEnum)
  ) {
    queries.push({ status: status as BookingStatusEnum });
  }

  const where: Prisma.BookingEntityWhereInput = { AND: queries };

  const data = await prisma.bookingEntity.findMany({
    take: limit,
    skip,
    where,
    orderBy: { [sortBy]: sortOrder },
    include: {
      tutorProfile: {
        include: {
          user: { select: { id: true, name: true, email: true } },
          categories: true,
        },
      },
      slot: true,
      reviewEntity: true,
    },
  });

  const total = await prisma.bookingEntity.count({ where });

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

const getMySingleBooking = async ({
  studentId,
  bookingId,
}: {
  studentId: string;
  bookingId: string;
}) => {
  const booking = await prisma.bookingEntity.findFirst({
    where: { id: bookingId, studentId },
    include: {
      tutorProfile: {
        include: {
          user: { select: { id: true, name: true, email: true } },
          categories: true,
        },
      },
      slot: true,
      reviewEntity: true,
    },
  });

  if (!booking) throw new Error("Booking not found");

  return booking;
};

const cancelBookingByStudent = async ({
  studentId,
  bookingId,
  reason,
}: {
  studentId: string;
  bookingId: string;
  reason?: string;
}) => {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.bookingEntity.findFirst({
      where: { id: bookingId, studentId },
      include: { slot: true },
    });

    if (!booking) throw new Error("Booking not found");

    if (booking.status === BookingStatusEnum.CANCELLED) return booking;

    if (booking.status === BookingStatusEnum.COMPLETED)
      throw new Error("Completed bookings cannot be cancelled");

    const updatedBooking = await tx.bookingEntity.update({
      where: { id: booking.id },
      data: {
        status: BookingStatusEnum.CANCELLED,
        cancelledBy: CancelledByEnum.STUDENT,
        ...(reason !== undefined && { cancelReason: reason }),
      },
      include: {
        tutorProfile: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        slot: true,
      },
    });

    await tx.availabilitySlotEntity.update({
      where: { id: booking.slotId },
      data: { status: AvailabilityStatusEnum.OPEN },
    });

    return updatedBooking;
  });
};

const getTutorBookings = async ({
  tutorUserId,
  status,
  page,
  limit,
  skip,
  sortBy,
  sortOrder,
}: {
  tutorUserId: string;
  status: string | undefined;
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
}) => {
  const tutor = await prisma.tutorProfileEntity.findUnique({
    where: { userId: tutorUserId },
    select: { id: true },
  });

  if (!tutor) throw new Error("Tutor profile not found");

  const queries: Prisma.BookingEntityWhereInput[] = [
    { tutorProfileId: tutor.id },
  ];

  if (
    status &&
    Object.values(BookingStatusEnum).includes(status as BookingStatusEnum)
  ) {
    queries.push({ status: status as BookingStatusEnum });
  }

  const where: Prisma.BookingEntityWhereInput = { AND: queries };

  const data = await prisma.bookingEntity.findMany({
    take: limit,
    skip,
    where,
    orderBy: { [sortBy]: sortOrder },
    include: {
      student: { select: { id: true, name: true, email: true } },
      slot: true,
      reviewEntity: true,
    },
  });

  const total = await prisma.bookingEntity.count({ where });

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

const completeBookingByTutor = async ({
  tutorUserId,
  bookingId,
}: {
  tutorUserId: string;
  bookingId: string;
}) => {
  const tutor = await prisma.tutorProfileEntity.findUnique({
    where: { userId: tutorUserId },
    select: { id: true },
  });

  if (!tutor) throw new Error("Tutor profile not found");

  const booking = await prisma.bookingEntity.findFirst({
    where: { id: bookingId, tutorProfileId: tutor.id },
  });

  if (!booking) throw new Error("Booking not found");

  if (booking.status === BookingStatusEnum.CANCELLED)
    throw new Error("Cancelled bookings cannot be completed");

  if (booking.status === BookingStatusEnum.COMPLETED) return booking;

  return prisma.bookingEntity.update({
    where: { id: booking.id },
    data: { status: BookingStatusEnum.COMPLETED },
  });
};

export const bookingService = {
  createBooking,
  getMyBookings,
  getMySingleBooking,
  cancelBookingByStudent,
  getTutorBookings,
  completeBookingByTutor,
};

import { Prisma } from "../../../prisma/generated/prisma/client";
import { AvailabilityStatusEnum } from "../../../prisma/generated/prisma/enums";
import { ICreateAvailabilitySlot } from "../../interfaces/availability.interface";
import { prisma } from "../../lib/prisma";

const getAllAvailabilitySlots = async ({
  search,
  tutorId,
  status,
  from,
  to,
  page,
  limit,
  skip,
  sortBy,
  sortOrder,
}: {
  search: string | undefined;
  tutorId: string | undefined;
  status: string | undefined;
  from: Date | undefined;
  to: Date | undefined;
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
}) => {
  const queries: Prisma.AvailabilitySlotEntityWhereInput[] = [];

  if (tutorId) queries.push({ tutorProfileId: tutorId });

  if (status && Object.values(AvailabilityStatusEnum).includes(status as any)) {
    queries.push({ status: status as any });
  }

  if (from || to) {
    queries.push({
      AND: [
        ...(to ? [{ startAt: { lt: to } }] : []),
        ...(from ? [{ endAt: { gt: from } }] : []),
      ],
    });
  }

  if (search) {
    queries.push({
      tutorProfile: {
        user: {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        },
      },
    });
  }

  const where: Prisma.AvailabilitySlotEntityWhereInput =
    queries.length > 0 ? { AND: queries } : {};

  const slots = await prisma.availabilitySlotEntity.findMany({
    take: limit,
    skip,
    where,
    orderBy: { [sortBy]: sortOrder },
    include: {
      tutorProfile: {
        select: {
          id: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  const total = await prisma.availabilitySlotEntity.count({ where });

  return {
    data: slots,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const createAvailabilitySlot = async (
  userId: string,
  slot: ICreateAvailabilitySlot,
) => {
  const tutor = await prisma.tutorProfileEntity.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!tutor) {
    throw new Error("Tutor profile not found");
  }

  const startTime = new Date(slot.startAt);
  const endTime = new Date(slot.endAt);

  if (startTime >= endTime) {
    throw new Error("End time must be greater than start time");
  }

  return prisma.availabilitySlotEntity.create({
    data: {
      tutorProfileId: tutor.id,
      startAt: startTime,
      endAt: endTime,
      status: AvailabilityStatusEnum.OPEN,
    },
  });
};

const updateAvailabilitySlot = async (
  userId: string,
  slotId: string,
  payload: Partial<{
    startAt: Date;
    endAt: Date;
    status: AvailabilityStatusEnum;
  }>,
) => {
  const tutor = await prisma.tutorProfileEntity.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!tutor) {
    throw new Error("Tutor profile not found");
  }

  const existingSlot = await prisma.availabilitySlotEntity.findFirst({
    where: { id: slotId, tutorProfileId: tutor.id },
  });

  if (!existingSlot) {
    throw new Error("Existing slot not found");
  }

  if (existingSlot.status === AvailabilityStatusEnum.BOOKED) {
    throw new Error("Booked slots cannot be modified");
  }

  const nextStart = payload.startAt
    ? new Date(payload.startAt)
    : existingSlot.startAt;
  const nextEnd = payload.endAt ? new Date(payload.endAt) : existingSlot.endAt;

  if (nextStart >= nextEnd) {
    throw new Error("End time must be greater than start time");
  }

  return prisma.availabilitySlotEntity.update({
    where: { id: slotId },
    data: {
      ...(payload.startAt ? { startAt: nextStart } : {}),
      ...(payload.endAt ? { endAt: nextEnd } : {}),
      ...(payload.status ? { status: payload.status } : {}),
    },
  });
};

export const getSingleAvailabilitySlot = async (
  userId: string,
  slotId: string,
) => {
  const tutor = await prisma.tutorProfileEntity.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!tutor) throw new Error("Tutor profile not found");

  const slot = await prisma.availabilitySlotEntity.findFirst({
    where: { id: slotId, tutorProfileId: tutor.id },
  });

  if (!slot) throw new Error("Availability slot not found");

  return slot;
};

const deleteAvailabilitySlot = async (userId: string, slotId: string) => {
  const tutor = await prisma.tutorProfileEntity.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!tutor) throw new Error("Tutor profile not found");

  const slot = await prisma.availabilitySlotEntity.findFirst({
    where: { id: slotId, tutorProfileId: tutor.id },
    select: { id: true, status: true },
  });

  if (!slot) {
    throw new Error("Availability slot not found");
  }

  if (slot.status === AvailabilityStatusEnum.BOOKED) {
    throw new Error("Booked slots cannot be deleted");
  }

  await prisma.availabilitySlotEntity.delete({
    where: { id: slotId },
  });

  return { deleted: true };
};

export const availabilitySlotService = {
  getAllAvailabilitySlots,
  createAvailabilitySlot,
  updateAvailabilitySlot,
  deleteAvailabilitySlot,
  getSingleAvailabilitySlot,
};

import { Prisma, UserRolesEnum } from "../../../prisma/generated/prisma/client";
import { prisma } from "../../lib/prisma";

const getMyProfile = async (id: string) => {
  return await prisma.user.findUnique({
    where: {
      id,
    },
  });
};

const getAllUsers = async ({
  search,
  role,
  status,
  page,
  limit,
  skip,
  sortBy,
  sortOrder,
}: {
  search: string | undefined;
  role: string | undefined;
  status: string | undefined;
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
}) => {
  const queries: Prisma.UserWhereInput[] = [];

  if (search) {
    queries.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (role) {
    queries.push({ role: role as UserRolesEnum });
  }

  if (status) {
    queries.push({ status: status as any });
  }

  const where: Prisma.UserWhereInput =
    queries.length > 0 ? { AND: queries } : {};

  const users = await prisma.user.findMany({
    take: limit,
    skip,
    where,
    orderBy: { [sortBy]: sortOrder as any },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      role: true,
      status: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const total = await prisma.user.count({ where });

  return {
    data: users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const updateUserStatus = async (userId: string, status: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, status: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { status: status as any },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      role: true,
      status: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

export const UserService = {
  getMyProfile,
  getAllUsers,
  updateUserStatus,
};

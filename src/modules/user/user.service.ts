import { prisma } from "../../lib/prisma";

const getMyProfile = async (id: string) => {
  return await prisma.user.findUnique({
    where: {
      id,
    },
  });
};

export const UserService = {
  getMyProfile,
};

import { CategoryEntity } from "../../../prisma/generated/prisma/client";
import { prisma } from "../../lib/prisma";

const getAllCategories = async () => {
  return prisma.categoryEntity.findMany({
    orderBy: { name: "asc" },
  });
};

const getSingleCategory = async (id: string) => {
  return prisma.categoryEntity.findUnique({
    where: { id },
  });
};

const createCategory = async (
  data: Omit<
    CategoryEntity,
    "id" | "createdAt" | "updatedAt" | "slug" | "isActive" | "isDeleted"
  >,
) => {
  return prisma.categoryEntity.create({
    data: {
      name: data.name,
      slug: data.name.toLowerCase().replace(/\s+/g, "_"),
      isActive: true,
      isDeleted: false,
    },
  });
};

const updateCategory = async (id: string, name: string) => {
  const slug = name.toLowerCase().replace(/\s+/g, "_");

  const res = await prisma.categoryEntity.update({
    where: { id },
    data: { name, slug },
  });

  return res;
};

export const deleteCategory = async (id: string) => {
  return prisma.categoryEntity.update({
    where: { id },
    data: { isDeleted: true },
  });
};

export const categoryService = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};

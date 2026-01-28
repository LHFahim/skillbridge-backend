import { Request, Response } from "express";
import { categoryService } from "./category.service";

const getAllCategories = async (req: Request, res: Response) => {
  const categories = await categoryService.getAllCategories();
  res.status(200).json({
    success: true,
    data: categories,
  });
};

const getSingleCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Category ID is required",
    });
  }

  const category = await categoryService.getSingleCategory(id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: "Category not found",
    });
  }

  res.status(200).json({
    success: true,
    data: category,
  });
};

const createCategory = async (req: Request, res: Response) => {
  const body = await req.body;
  const category = await categoryService.createCategory(body);

  res.status(201).json({
    success: true,
    data: category,
  });
};

export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Category ID is required",
    });
  }

  const category = await categoryService.updateCategory(id, name);

  res.status(200).json({
    success: true,
    data: category,
  });
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Category ID is required",
    });
  }

  await categoryService.deleteCategory(id);

  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
};

export const categoryController = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};

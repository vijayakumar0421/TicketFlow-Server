const prisma = require("../config/prisma");

const getCategories = async () => {
  return await prisma.category.findMany({
    include: {
      organization: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};

const createCategory = async (data) => {
  const organization =
    await prisma.organization.findUnique({
      where: {
        id: data.organizationId,
      },
    });

  if (!organization) {
    throw new Error("Organization not found.");
  }

  const exists = await prisma.category.findFirst({
    where: {
      organizationId: data.organizationId,
      name: data.name,
    },
  });

  if (exists) {
    throw new Error("Category already exists.");
  }

  return await prisma.category.create({
    data: {
      organizationId: data.organizationId,
      name: data.name,
      description: data.description,
      isActive:
        data.isActive !== undefined
          ? data.isActive
          : true,
    },
  });
};

// Get Category By ID
const getCategoryById = async (id) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      organization: true,
    },
  });

  if (!category) {
    throw new Error("Category not found.");
  }

  return category;
};

// Update Category
const updateCategory = async (id, data) => {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new Error("Category not found.");
  }

  return await prisma.category.update({
    where: { id },
    data: {
      organizationId: Number(data.organizationId),
      name: data.name,
      description: data.description,
      isActive: data.isActive,
    },
  });
};

// Delete Category
const deleteCategory = async (id) => {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new Error("Category not found.");
  }

  await prisma.category.delete({
    where: { id },
  });

  return true;
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
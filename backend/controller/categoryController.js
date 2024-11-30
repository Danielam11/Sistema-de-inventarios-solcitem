// controllers/categoryController.js

const categoryModel = require("../model/categoryModel");

// Function to create a category
async function createCategory(req, res) {
  const { name } = req.body;

  try {
    const newCategory = await categoryModel.createCategory(name);
    res.status(201).json({
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Error creating category" });
  }
}

// Function to get all categories
async function getAllCategories(req, res) {
  try {
    const categories = await categoryModel.getAllCategories();
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error retrieving categories:", error);
    res.status(500).json({ error: "Error retrieving categories" });
  }
}

// Function to get a category by ID
async function getCategoryById(req, res) {
  const { id } = req.params;

  try {
    const category = await categoryModel.getCategoryById(id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error("Error retrieving category:", error);
    res.status(500).json({ error: "Error retrieving category" });
  }
}

// Function to update a category
async function updateCategory(req, res) {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const updatedCategory = await categoryModel.updateCategory(id, name);
    if (!updatedCategory) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.status(200).json({
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Error updating category" });
  }
}

// Function to delete a category
async function deleteCategory(req, res) {
  const { id } = req.params;

  try {
    await categoryModel.deleteCategory(id);
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Error deleting category" });
  }
}

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};

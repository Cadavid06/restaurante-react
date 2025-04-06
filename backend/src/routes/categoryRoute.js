import express from "express"
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js"

const router = express.Router()

router.get("/categorias", getAllCategories)
router.get("/categoria/:id", getCategoryById)
router.post("/categoria", createCategory)
router.put("/categoria/:id", updateCategory)
router.delete("/categoria/:id", deleteCategory)

export default router


import express from "express"
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productsController.js"

const router = express.Router()

router.get("/productos", getAllProducts)
router.get("/producto/:id", getProductById)
router.post("/producto", createProduct)
router.put("/producto/:id", updateProduct)
router.delete("/producto/:id", deleteProduct)

export default router


import express from "express"
import { generateInvoice, getInvoice, generateInvoicePDF } from "../controllers/invoiceController.js"

const router = express.Router()

router.post("/generar-factura/:idPedido", generateInvoice)
router.get("/factura/:idPedido", getInvoice)
router.get("/generar-factura-pdf/:idFactura", generateInvoicePDF)

export default router


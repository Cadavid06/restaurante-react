import express from "express"
import { getInvoiceReport, getEmployeeReport, getTopProductsReport } from "../controllers/reportController.js"

const router = express.Router()

router.get("/consulta-facturas", getInvoiceReport)
router.get("/consulta-empleados-facturaron", getEmployeeReport)
router.get("/consulta-productos-mas-vendidos", getTopProductsReport)

export default router


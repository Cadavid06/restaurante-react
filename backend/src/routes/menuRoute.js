import express from "express";
const router = express.Router();
import { addCategory, getCategories } from "../controllers/menuController.js";

router.post('/categoria', addCategory);
router.get('/categorias', getCategories);

export default router; 

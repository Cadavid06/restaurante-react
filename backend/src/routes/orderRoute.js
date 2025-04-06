import express from 'express';
import { createOrder, getOrders } from '../controllers/orderController.js';

const router = express.Router();

router.post('/pedido', createOrder);
router.get('/pedidos', getOrders);

export default router;

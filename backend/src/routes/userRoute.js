import express from "express"
import { getAllUsers, getUserById, updateUser, deleteUser } from "../controllers/userController.js"

const router = express.Router()

router.get("/usuarios", getAllUsers)
router.get("/usuario/:id", getUserById)
router.put("/usuario/:id", updateUser)
router.delete("/usuario/:id", deleteUser)

export default router


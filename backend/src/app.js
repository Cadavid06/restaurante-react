import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import morgan from "morgan"
import dotenv from "dotenv"

// Importar rutas
import loginRoute from "./routes/loginRoute.js"
import registerRoute from "./routes/registerRoute.js"
import categoryRoutes from "./routes/categoryRoute.js"
import productRoutes from "./routes/productsRoute.js"
import orderRoutes from "./routes/orderRoute.js"
import userRoutes from "./routes/userRoute.js"
import reportRoutes from "./routes/reportRoute.js"
import invoiceRoutes from "./routes/invoiceRoute.js"

dotenv.config()

const app = express()

// Middlewares
app.use(morgan("dev"))
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Rutas
app.use("/api", loginRoute)
app.use("/api", registerRoute)
app.use("/api", categoryRoutes)
app.use("/api", productRoutes)
app.use("/api", orderRoutes)
app.use("/api", userRoutes)
app.use("/api", reportRoutes)
app.use("/api", invoiceRoutes)

export default app


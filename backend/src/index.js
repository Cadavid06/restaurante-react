import app from "./app.js";
import dotenv from 'dotenv'; // Añadido la importación de dotenv`dotenv.config();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
import promisePool from "../db/db.js"

// Obtener todas las categorías
export const getAllCategories = async (req, res) => {
  try {
    const [results] = await promisePool.query("SELECT idCategoria as id, nombre_categoria as nombre FROM categoria")
    console.log("Categorías encontradas:", results)
    res.status(200).json(results)
  } catch (err) {
    console.error("Error al obtener categorías:", err)
    res.status(500).json({ error: err.message })
  }
}

// Obtener una categoría específica
export const getCategoryById = async (req, res) => {
  const { id } = req.params
  try {
    const [results] = await promisePool.query(
      "SELECT idCategoria as id, nombre_categoria as nombre FROM categoria WHERE idCategoria = ?",
      [id],
    )
    if (results.length === 0) {
      return res.status(404).json({ message: "Categoría no encontrada" })
    }
    res.status(200).json(results[0])
  } catch (err) {
    console.error("Error al obtener categoría:", err)
    res.status(500).json({ error: err.message })
  }
}

// Crear una nueva categoría
export const createCategory = async (req, res) => {
  const { nombre_categoria } = req.body

  if (!nombre_categoria) {
    return res.status(400).json({ error: "El nombre de la categoría es requerido" })
  }

  try {
    const [result] = await promisePool.query("INSERT INTO categoria (nombre_categoria) VALUES (?)", [nombre_categoria])
    res.status(201).json({
      message: "Categoría creada exitosamente",
      id: result.insertId,
      nombre: nombre_categoria,
    })
  } catch (err) {
    console.error("Error al crear categoría:", err)
    res.status(500).json({ error: err.message })
  }
}

// Actualizar una categoría
export const updateCategory = async (req, res) => {
  const { id } = req.params
  const { nombre_categoria } = req.body

  if (!nombre_categoria) {
    return res.status(400).json({ error: "El nombre de la categoría es requerido" })
  }

  try {
    const [result] = await promisePool.query("UPDATE categoria SET nombre_categoria = ? WHERE idCategoria = ?", [
      nombre_categoria,
      id,
    ])
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Categoría no encontrada" })
    }
    res.status(200).json({ message: "Categoría actualizada exitosamente" })
  } catch (err) {
    console.error("Error al actualizar categoría:", err)
    res.status(500).json({ error: err.message })
  }
}

// Eliminar una categoría
export const deleteCategory = async (req, res) => {
  const { id } = req.params

  try {
    // Primero verificar si hay productos asociados a esta categoría
    const [productsCheck] = await promisePool.query("SELECT COUNT(*) as count FROM producto WHERE idCategoria = ?", [
      id,
    ])

    if (productsCheck[0].count > 0) {
      return res.status(400).json({
        error: "No se puede eliminar la categoría porque tiene productos asociados",
      })
    }

    const [result] = await promisePool.query("DELETE FROM categoria WHERE idCategoria = ?", [id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Categoría no encontrada" })
    }
    res.status(200).json({ message: "Categoría eliminada exitosamente" })
  } catch (err) {
    console.error("Error al eliminar categoría:", err)
    res.status(500).json({ error: err.message })
  }
}


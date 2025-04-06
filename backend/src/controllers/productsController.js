import promisePool from "../db/db.js"

// Obtener todos los productos
export const getAllProducts = async (req, res) => {
  try {
    const query = `
      SELECT p.idProducto as id, p.descripcion, p.precio, p.idCategoria, c.nombre_categoria
      FROM producto p
      LEFT JOIN categoria c ON p.idCategoria = c.idCategoria
    `
    const [results] = await promisePool.query(query)
    console.log("Productos encontrados:", results)
    res.status(200).json(results)
  } catch (err) {
    console.error("Error al obtener productos:", err)
    res.status(500).json({ error: err.message })
  }
}

// Obtener un producto específico
export const getProductById = async (req, res) => {
  const { id } = req.params
  try {
    const query = `
      SELECT p.idProducto as id, p.descripcion, p.precio, p.idCategoria, c.nombre_categoria
      FROM producto p
      LEFT JOIN categoria c ON p.idCategoria = c.idCategoria
      WHERE p.idProducto = ?
    `
    const [results] = await promisePool.query(query, [id])
    if (results.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" })
    }
    res.status(200).json(results[0])
  } catch (err) {
    console.error("Error al obtener producto:", err)
    res.status(500).json({ error: err.message })
  }
}

// Crear un nuevo producto
export const createProduct = async (req, res) => {
  const { descripcion, precio, idCategoria } = req.body

  if (!descripcion || !precio || !idCategoria) {
    return res.status(400).json({ error: "Todos los campos son requeridos" })
  }

  try {
    // Verificar si la categoría existe
    const [categoryCheck] = await promisePool.query("SELECT idCategoria FROM categoria WHERE idCategoria = ?", [
      idCategoria,
    ])

    if (categoryCheck.length === 0) {
      return res.status(400).json({ error: "La categoría seleccionada no existe" })
    }

    const [result] = await promisePool.query(
      "INSERT INTO producto (descripcion, precio, idCategoria) VALUES (?, ?, ?)",
      [descripcion, precio, idCategoria],
    )

    res.status(201).json({
      message: "Producto creado exitosamente",
      id: result.insertId,
      descripcion,
      precio,
      idCategoria,
    })
  } catch (err) {
    console.error("Error al crear producto:", err)
    res.status(500).json({ error: err.message })
  }
}

// Actualizar un producto
export const updateProduct = async (req, res) => {
  const { id } = req.params
  const { descripcion, precio, idCategoria } = req.body

  if (!descripcion || !precio || !idCategoria) {
    return res.status(400).json({ error: "Todos los campos son requeridos" })
  }

  try {
    // Verificar si la categoría existe
    const [categoryCheck] = await promisePool.query("SELECT idCategoria FROM categoria WHERE idCategoria = ?", [
      idCategoria,
    ])

    if (categoryCheck.length === 0) {
      return res.status(400).json({ error: "La categoría seleccionada no existe" })
    }

    const [result] = await promisePool.query(
      "UPDATE producto SET descripcion = ?, precio = ?, idCategoria = ? WHERE idProducto = ?",
      [descripcion, precio, idCategoria, id],
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Producto no encontrado" })
    }

    res.status(200).json({ message: "Producto actualizado exitosamente" })
  } catch (err) {
    console.error("Error al actualizar producto:", err)
    res.status(500).json({ error: err.message })
  }
}

// Eliminar un producto
export const deleteProduct = async (req, res) => {
  const { id } = req.params

  try {
    // Verificar si el producto está en algún pedido
    const [orderCheck] = await promisePool.query("SELECT COUNT(*) as count FROM detallepedido WHERE idProducto = ?", [
      id,
    ])

    if (orderCheck[0].count > 0) {
      return res.status(400).json({
        error: "No se puede eliminar el producto porque está asociado a uno o más pedidos",
      })
    }

    const [result] = await promisePool.query("DELETE FROM producto WHERE idProducto = ?", [id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Producto no encontrado" })
    }

    res.status(200).json({ message: "Producto eliminado exitosamente" })
  } catch (err) {
    console.error("Error al eliminar producto:", err)
    res.status(500).json({ error: err.message })
  }
}


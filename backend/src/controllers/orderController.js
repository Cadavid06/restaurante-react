import promisePool from "../db/db.js"

// Obtener todos los pedidos
export const getOrders = async (req, res) => {
  try {
    // Consulta corregida sin el campo metodoPago que no existe en la tabla pedido
    const query = `
      SELECT p.idPedido, p.fechaPedido, p.idEmpleado, p.num_mesa
      FROM pedido p
      ORDER BY p.fechaPedido DESC
    `

    const [results] = await promisePool.query(query)
    res.status(200).json(results)
  } catch (error) {
    console.error("Error al obtener pedidos:", error)
    res.status(500).json({ error: error.message })
  }
}

// Obtener un pedido específico con sus productos
export const getOrderById = async (req, res) => {
  const idPedido = req.params.id
  const query = `
    SELECT p.*, dp.idProducto, dp.cantidad, pr.descripcion
    FROM pedido p
    JOIN detallepedido dp ON p.idPedido = dp.idPedido
    JOIN producto pr ON dp.idProducto = pr.idProducto
    WHERE p.idPedido = ?
  `

  try {
    const [results] = await promisePool.query(query, [idPedido])

    if (results.length === 0) {
      return res.status(404).json({ message: "Pedido no encontrado" })
    }

    const pedido = {
      idPedido: results[0].idPedido,
      fechaPedido: results[0].fechaPedido,
      idEmpleado: results[0].idEmpleado,
      num_mesa: results[0].num_mesa,
      productos: results.map((row) => ({
        idProducto: row.idProducto,
        descripcion: row.descripcion,
        cantidad: row.cantidad,
      })),
    }

    res.status(200).json(pedido)
  } catch (error) {
    console.error("Error al obtener pedido:", error)
    res.status(500).json({ error: error.message })
  }
}

// Actualizar un pedido
export const updateOrder = async (req, res) => {
  const idPedido = req.params.id
  const { num_mesa, productos } = req.body

  const connection = await promisePool.getConnection()
  try {
    await connection.beginTransaction()

    // Actualizar solo num_mesa
    await connection.query("UPDATE pedido SET num_mesa = ? WHERE idPedido = ?", [num_mesa, idPedido])

    // Eliminar detalles antiguos
    await connection.query("DELETE FROM detallepedido WHERE idPedido = ?", [idPedido])

    // Insertar nuevos detalles
    if (productos && productos.length > 0) {
      const insertDetalleQuery = "INSERT INTO detallepedido (idPedido, idProducto, cantidad) VALUES ?"
      const detalles = productos.map((p) => [idPedido, p.idProducto, p.cantidad])
      await connection.query(insertDetalleQuery, [detalles])
    }

    // Calcular nuevo total
    const [totalResults] = await connection.query(
      `
      SELECT SUM(dp.cantidad * p.precio) as total
      FROM detallepedido dp
      JOIN producto p ON dp.idProducto = p.idProducto
      WHERE dp.idPedido = ?
    `,
      [idPedido],
    )

    const nuevoTotal = totalResults[0].total || 0

    // Actualizar factura con nuevo total si existe
    await connection.query("UPDATE factura SET totalPago = ? WHERE idPedido = ?", [nuevoTotal, idPedido])

    await connection.commit()
    res.status(200).json({
      message: "Pedido actualizado con éxito",
      nuevoTotal: nuevoTotal,
    })
  } catch (error) {
    await connection.rollback()
    console.error("Error al actualizar pedido:", error)
    res.status(500).json({ error: "Error al actualizar el pedido" })
  } finally {
    connection.release()
  }
}

// Eliminar un pedido
export const deleteOrder = async (req, res) => {
  const idPedido = req.params.id

  const connection = await promisePool.getConnection()
  try {
    await connection.beginTransaction()

    // Primero verificar si existe una factura asociada
    const [facturaCheck] = await connection.query("SELECT idFactura FROM factura WHERE idPedido = ?", [idPedido])

    // Si existe una factura, eliminarla primero
    if (facturaCheck.length > 0) {
      await connection.query("DELETE FROM factura WHERE idPedido = ?", [idPedido])
    }

    // Luego eliminar los detalles del pedido
    await connection.query("DELETE FROM detallepedido WHERE idPedido = ?", [idPedido])

    // Finalmente eliminar el pedido
    await connection.query("DELETE FROM pedido WHERE idPedido = ?", [idPedido])

    await connection.commit()
    res.status(200).json({ message: "Pedido eliminado con éxito" })
  } catch (error) {
    await connection.rollback()
    console.error("Error al eliminar pedido:", error)
    res.status(500).json({ error: "Error al eliminar el pedido" })
  } finally {
    connection.release()
  }
}

// Crear un nuevo pedido
export const createOrder = async (req, res) => {
  const { idEmpleado, num_mesa, productos } = req.body

  if (!idEmpleado || !num_mesa || !productos || !productos.length) {
    return res.status(400).json({ error: "Datos incompletos para crear el pedido" })
  }

  const connection = await promisePool.getConnection()
  try {
    await connection.beginTransaction()

    // Insertar el pedido
    const [orderResult] = await connection.query(
      "INSERT INTO pedido (fechaPedido, idEmpleado, num_mesa) VALUES (NOW(), ?, ?)",
      [idEmpleado, num_mesa],
    )

    const idPedido = orderResult.insertId

    // Insertar los detalles del pedido
    const detallesValues = productos.map((p) => [idPedido, p.idProducto, p.cantidad])
    await connection.query("INSERT INTO detallepedido (idPedido, idProducto, cantidad) VALUES ?", [detallesValues])

    await connection.commit()
    res.status(201).json({
      message: "Pedido creado con éxito",
      idPedido: idPedido,
    })
  } catch (error) {
    await connection.rollback()
    console.error("Error al crear pedido:", error)
    res.status(500).json({ error: "Error al crear el pedido" })
  } finally {
    connection.release()
  }
}


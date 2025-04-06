import promisePool from "../db/db.js"
import PDFDocument from "pdfkit"

export const generateInvoice = async (req, res) => {
  const idPedido = req.params.idPedido
  const { metodoPago } = req.body

  try {
    // Primero, verificar si ya existe una factura para este pedido
    const [checkResults] = await promisePool.query("SELECT idFactura FROM factura WHERE idPedido = ?", [idPedido])

    if (checkResults.length > 0) {
      // Ya existe una factura para este pedido
      return res.status(400).json({
        error: "Ya existe una factura para este pedido",
        idFactura: checkResults[0].idFactura,
      })
    }

    // Si no existe factura, procedemos a crearla
    const [pedidoResults] = await promisePool.query(
      `
      SELECT p.idPedido, p.fechaPedido, p.idEmpleado, dp.idProducto, dp.cantidad, pr.precio
      FROM pedido p
      JOIN detallepedido dp ON p.idPedido = dp.idPedido
      JOIN producto pr ON dp.idProducto = pr.idProducto
      WHERE p.idPedido = ?
    `,
      [idPedido],
    )

    if (pedidoResults.length === 0) {
      return res.status(404).json({ error: "Pedido no encontrado" })
    }

    const totalPago = pedidoResults.reduce((sum, item) => sum + item.cantidad * item.precio, 0)

    const [insertResult] = await promisePool.query(
      "INSERT INTO factura (idPedido, fechaFactura, metodoPago, totalPago) VALUES (?, NOW(), ?, ?)",
      [idPedido, metodoPago, totalPago],
    )

    res.status(201).json({
      message: "Factura generada con éxito",
      idFactura: insertResult.insertId,
      totalPago,
    })
  } catch (error) {
    console.error("Error generating factura:", error)
    res.status(500).json({ error: "Error al generar la factura" })
  }
}

export const getInvoice = async (req, res) => {
  const idPedido = req.params.idPedido
  const query = `
    SELECT f.*, p.fechaPedido, p.idEmpleado, p.num_mesa,
           dp.idProducto, dp.cantidad,
           pr.descripcion, pr.precio,
           (dp.cantidad * pr.precio) as subtotal
    FROM factura f
    JOIN pedido p ON f.idPedido = p.idPedido
    JOIN detallepedido dp ON p.idPedido = dp.idPedido
    JOIN producto pr ON dp.idProducto = pr.idProducto
    WHERE f.idPedido = ?
  `

  try {
    const [results] = await promisePool.query(query, [idPedido])

    if (results.length === 0) {
      return res.status(404).json({ message: "Factura no encontrada" })
    }

    // Calcular el total real basado en los productos actuales
    const total = results.reduce((sum, row) => sum + row.cantidad * row.precio, 0)

    // Estructurar la respuesta
    const factura = {
      idFactura: results[0].idFactura,
      idPedido: results[0].idPedido,
      fechaFactura: results[0].fechaFactura,
      metodoPago: results[0].metodoPago,
      totalPago: total,
      fechaPedido: results[0].fechaPedido,
      idEmpleado: results[0].idEmpleado,
      num_mesa: results[0].num_mesa,
      productos: results.map((row) => ({
        idProducto: row.idProducto,
        descripcion: row.descripcion,
        cantidad: row.cantidad,
        precio: row.precio,
        subtotal: row.subtotal,
      })),
    }

    // Actualizar el total en la base de datos si es diferente
    if (total !== results[0].totalPago) {
      await promisePool.query("UPDATE factura SET totalPago = ? WHERE idPedido = ?", [total, idPedido])
    }

    res.status(200).json(factura)
  } catch (error) {
    console.error("Error fetching factura:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

export const generateInvoicePDF = async (req, res) => {
  const idFactura = req.params.idFactura
  const query = `
    SELECT f.*, p.fechaPedido, e.nombre as nombreEmpleado, pr.descripcion, dp.cantidad, pr.precio
    FROM factura f
    JOIN pedido p ON f.idPedido = p.idPedido
    JOIN empleado e ON p.idEmpleado = e.idEmpleado
    JOIN detallepedido dp ON p.idPedido = dp.idPedido
    JOIN producto pr ON dp.idProducto = pr.idProducto
    WHERE f.idFactura = ?
  `

  try {
    const [results] = await promisePool.query(query, [idFactura])

    if (results.length === 0) {
      return res.status(404).json({ error: "Factura no encontrada" })
    }

    const factura = results[0]
    const doc = new PDFDocument({ size: "A4", margin: 50 })
    const filename = `factura_${idFactura}.pdf`

    res.setHeader("Content-disposition", 'attachment; filename="' + filename + '"')
    res.setHeader("Content-type", "application/pdf")

    doc.pipe(res)

    doc.fontSize(20).text("Factura", { align: "center" })
    doc.moveDown()
    doc.fontSize(12).text(`Número de Factura: ${factura.idFactura}`)
    doc.text(`Fecha: ${new Date(factura.fechaFactura).toLocaleDateString()}`)
    doc.text(`Empleado: ${factura.nombreEmpleado}`)
    doc.text(`Método de Pago: ${factura.metodoPago}`)
    doc.moveDown()

    doc.text("Detalles del Pedido:")
    results.forEach((item) => {
      doc.text(
        `${item.descripcion} - Cantidad: ${item.cantidad} - Precio: $${item.precio} - Subtotal: $${item.cantidad * item.precio}`,
      )
    })

    doc.moveDown()
    doc.fontSize(16).text(`Total: $${factura.totalPago}`, { align: "right" })

    doc.end()
  } catch (error) {
    console.error("Error al generar factura PDF:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}


import promisePool from "../db/db.js"

export const getInvoiceReport = async (req, res) => {
  const { fechaInicio, fechaFin, tipo } = req.query

  if (!fechaInicio || !fechaFin || !tipo) {
    return res.status(400).json({ error: "Faltan parámetros necesarios" })
  }

  let groupBy, dateFormat
  switch (tipo) {
    case "diaria":
      groupBy = "DATE(f.fechaFactura)"
      dateFormat = "%d/%m/%Y"
      break
    case "semanal":
      groupBy = "YEARWEEK(f.fechaFactura, 1)"
      dateFormat = "%d/%m/%Y"
      break
    case "mensual":
      groupBy = "YEAR(f.fechaFactura), MONTH(f.fechaFactura)"
      dateFormat = "%m/%Y"
      break
    default:
      return res.status(400).json({ error: "Tipo de consulta inválido" })
  }

  const query = `
    SELECT 
      DATE_FORMAT(MIN(f.fechaFactura), '${dateFormat}') as fecha,
      COUNT(*) as cantidad,
      SUM(f.totalPago) as monto
    FROM 
      factura f
    WHERE 
      f.fechaFactura BETWEEN ? AND ?
    GROUP BY 
      ${groupBy}
    ORDER BY 
      MIN(f.fechaFactura)
  `

  try {
    const [detalles] = await promisePool.query(query, [fechaInicio, fechaFin])

    // Calcular totales
    const totalFacturas = detalles.reduce((sum, row) => sum + row.cantidad, 0)
    const montoTotal = detalles.reduce((sum, row) => sum + Number.parseFloat(row.monto), 0)

    res.status(200).json({
      totalFacturas,
      montoTotal,
      detalles: detalles.map((row) => ({
        fecha: row.fecha,
        cantidad: row.cantidad,
        monto: Number.parseFloat(row.monto),
      })),
    })
  } catch (error) {
    console.error("Error en la consulta de facturas:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

export const getEmployeeReport = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query

  if (!fechaInicio || !fechaFin) {
    return res.status(400).json({ error: "Faltan parámetros necesarios" })
  }

  const query = `
    SELECT 
      e.idEmpleado,
      e.nombre,
      COUNT(f.idFactura) as totalFacturas,
      COALESCE(SUM(f.totalPago), 0) as montoTotal
    FROM empleado e
    LEFT JOIN pedido p ON e.idEmpleado = p.idEmpleado
    LEFT JOIN factura f ON p.idPedido = f.idPedido AND f.fechaFactura BETWEEN ? AND ?
    GROUP BY e.idEmpleado, e.nombre
    HAVING totalFacturas > 0
    ORDER BY montoTotal DESC
  `

  try {
    const [results] = await promisePool.query(query, [fechaInicio, fechaFin])

    // Ensure numeric values
    const formattedResults = results.map((row) => ({
      ...row,
      totalFacturas: Number.parseInt(row.totalFacturas) || 0,
      montoTotal: Number.parseFloat(row.montoTotal) || 0,
    }))

    res.status(200).json(formattedResults)
  } catch (error) {
    console.error("Error en la consulta de empleados:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

export const getTopProductsReport = async (req, res) => {
  const { fechaInicio, fechaFin, limite } = req.query

  if (!fechaInicio || !fechaFin || !limite) {
    return res.status(400).json({ error: "Faltan parámetros necesarios" })
  }

  const query = `
    SELECT 
      p.idProducto,
      p.descripcion,
      SUM(dp.cantidad) as cantidadVendida,
      SUM(dp.cantidad * p.precio) as montoTotal
    FROM 
      producto p
      JOIN detallepedido dp ON p.idProducto = dp.idProducto
      JOIN pedido ped ON dp.idPedido = ped.idPedido
      JOIN factura f ON ped.idPedido = f.idPedido
    WHERE 
      f.fechaFactura BETWEEN ? AND ?
    GROUP BY 
      p.idProducto, p.descripcion
    ORDER BY 
      cantidadVendida DESC
    LIMIT ?
  `

  try {
    const [results] = await promisePool.query(query, [fechaInicio, fechaFin, Number.parseInt(limite)])

    // Ensure numeric values
    const formattedResults = results.map((row) => ({
      ...row,
      cantidadVendida: Number.parseInt(row.cantidadVendida) || 0,
      montoTotal: Number.parseFloat(row.montoTotal) || 0,
    }))

    res.status(200).json(formattedResults)
  } catch (error) {
    console.error("Error en la consulta de productos más vendidos:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}


import promisePool from "../db/db.js"
import bcrypt from "bcrypt"

export const getAllUsers = async (req, res) => {
  const query = `
    SELECT idEmpleado as id, nombre, 'empleado' as role FROM empleado
    UNION ALL
    SELECT idAdmin as id, nombre, 'administrador' as role FROM administrador
  `

  try {
    const [results] = await promisePool.query(query)
    res.status(200).json(results)
  } catch (err) {
    console.error("Error al obtener usuarios:", err)
    res.status(500).json({ error: err.message })
  }
}

export const getUserById = async (req, res) => {
  const { id } = req.params
  const query = `
    SELECT idEmpleado as id, nombre, 'empleado' as role FROM empleado WHERE idEmpleado = ?
    UNION ALL
    SELECT idAdmin as id, nombre, 'administrador' as role FROM administrador WHERE idAdmin = ?
  `

  try {
    const [results] = await promisePool.query(query, [id, id])
    if (results.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" })
    }
    res.status(200).json(results[0])
  } catch (err) {
    console.error("Error al obtener usuario:", err)
    res.status(500).json({ error: err.message })
  }
}

export const updateUser = async (req, res) => {
  const { id } = req.params
  const { nombre, password, role } = req.body
  const oldTable = role === "administrador" ? "empleado" : "administrador"
  const newTable = role === "administrador" ? "administrador" : "empleado"
  const idField = role === "administrador" ? "idAdmin" : "idEmpleado"

  const connection = await promisePool.getConnection()

  try {
    await connection.beginTransaction()

    let query = `UPDATE ${newTable} SET nombre = ?`
    const params = [nombre]

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10)
      query += ", contraseña = ?"
      params.push(hashedPassword)
    }

    query += ` WHERE ${idField} = ?`
    params.push(id)

    const [result] = await connection.query(query, params)

    if (result.affectedRows === 0) {
      // El usuario no existe en la tabla destino, hay que moverlo
      const [checkOldTable] = await connection.query(
        `SELECT * FROM ${oldTable} WHERE ${oldTable === "empleado" ? "idEmpleado" : "idAdmin"} = ?`,
        [id],
      )

      if (checkOldTable.length === 0) {
        await connection.rollback()
        return res.status(404).json({ message: "Usuario no encontrado" })
      }

      // Obtener datos del usuario de la tabla antigua
      const oldUser = checkOldTable[0]

      // Insertar en la nueva tabla
      let insertQuery = `INSERT INTO ${newTable} (nombre`
      let insertValues = `VALUES (?)`
      const insertParams = [oldUser.nombre]

      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10)
        insertQuery += ", contraseña"
        insertValues += ", ?"
        insertParams.push(hashedPassword)
      } else {
        insertQuery += ", contraseña"
        insertValues += ", ?"
        insertParams.push(oldUser.contraseña)
      }

      insertQuery += `) ${insertValues}`

      const [insertResult] = await connection.query(insertQuery, insertParams)

      // Eliminar de la tabla antigua
      await connection.query(
        `DELETE FROM ${oldTable} WHERE ${oldTable === "empleado" ? "idEmpleado" : "idAdmin"} = ?`,
        [id],
      )

      await connection.commit()
      res.status(200).json({
        message: "Usuario actualizado y movido exitosamente",
        newId: insertResult.insertId,
      })
    } else {
      await connection.commit()
      res.status(200).json({ message: "Usuario actualizado exitosamente" })
    }
  } catch (err) {
    await connection.rollback()
    console.error("Error al actualizar usuario:", err)
    res.status(500).json({ error: err.message })
  } finally {
    connection.release()
  }
}

export const deleteUser = async (req, res) => {
  const { id } = req.params
  const { role } = req.body

  if (!role) {
    return res.status(400).json({ error: "Se requiere el rol del usuario" })
  }

  try {
    let result

    if (role === "empleado") {
      ;[result] = await promisePool.query("DELETE FROM empleado WHERE idEmpleado = ?", [id])
    } else if (role === "administrador") {
      ;[result] = await promisePool.query("DELETE FROM administrador WHERE idAdmin = ?", [id])
    } else {
      return res.status(400).json({ error: "Rol no válido" })
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" })
    }

    res.status(200).json({ message: "Usuario eliminado exitosamente" })
  } catch (err) {
    console.error("Error al eliminar usuario:", err)
    res.status(500).json({ error: "Error al eliminar usuario" })
  }
}


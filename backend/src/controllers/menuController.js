import promisePool from '../db/db.js'; 

// Agregar categoría
const addCategory = async (req, res) => {
    const { nombre_cat } = req.body;
    const query = 'INSERT INTO categoria (nombre_categoria) VALUES (?)';
    try {
        const [result] = await promisePool.query(query, [nombre_cat]);
        res.status(201).json({ id: result.insertId, nombre_categoria: nombre_cat });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener categorías
const getCategories = async (req, res) => {
    try {
        const [results] = await promisePool.query('SELECT * FROM categoria');
        res.status(200).json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export { addCategory, getCategories };

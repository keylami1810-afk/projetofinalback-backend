const express = require('express'); const mysql = require('mysql2/promise'); const 
cors = require('cors'); require('dotenv').config();
const app = express(); app.use(cors()); app.use(express.json());
const PORT = process.env.PORT || 4000;
let pool;
async function initDb() { pool = await mysql.createPool({ host: 
process.env.DB_HOST, user: process.env.DB_USER, password: 
process.env.DB_PASS, database: process.env.DB_NAME, waitForConnections: 
true, connectionLimit: 10, queueLimit: 0 }); }
// Listar todos os produtos app.get('/api/products', async (req, res) => { try { const 
[rows] = await pool.query('SELECT * FROM products ORDER BY id DESC'); 
res.json(rows); } catch (err) { console.error(err); res.status(500).json({ error: 'Erro ao 
listar produtos' }); } });
// Inserir produto (body: { name, description, price }) app.post('/api/products', async 
(req, res) => { const { name, description, price } = req.body; if (!name || price === 
undefined) { return res.status(400).json({ error: 'name e price são obrigatórios' }); } 
try { const [result] = await pool.query( 'INSERT INTO products (name, description, 
price) VALUES (?, ?, ?)', [name, description || null, price] ); const insertedId = 
result.insertId; const [rows] = await pool.query('SELECT * FROM products WHERE 
id = ?', [insertedId]); res.status(201).json(rows[0]); } catch (err) { console.error(err); 
res.status(500).json({ error: 'Erro ao inserir produto' }); } });
// Consultar produto por id app.get('/api/products/:id', async (req, res) => { const id 
= req.params.id; try { const [rows] = await pool.query('SELECT * FROM products 
WHERE id = ?', [id]); if (rows.length === 0) return res.status(404).json({ error: 'Produto 
não encontrado' }); res.json(rows[0]); } catch (err) { console.error(err); 
res.status(500).json({ error: 'Erro ao consultar produto' }); } });
initDb()
 .then(() => {
 app.listen(PORT, () => {
 console.log(`API rodando na porta ${PORT}`);
 });
 })
 .catch((err) => {
 console.error('Erro ao conectar ao banco:', err);
 process.exit(1);
 });
// Handlers para logar erros não tratados (útil para debugging) 
process.on('unhandledRejection', (reason, promise) => { console.error('Unhandled 
Rejection at:', promise, 'reason:', reason); }); process.on('uncaughtException', err => 
{ console.error('Uncaught Exception thrown:', err); });

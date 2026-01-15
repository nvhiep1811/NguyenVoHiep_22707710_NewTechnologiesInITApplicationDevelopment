const db = require("../db/mysql");

exports.list = async () => {
  const [rows] = await db.query("SELECT * FROM products ORDER BY id DESC");
  return rows;
};

exports.getById = async (id) => {
  const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [id]);
  return rows[0] || null;
};

exports.create = async ({ name, price, quantity }) => {
  await db.query("INSERT INTO products(name, price, quantity) VALUES (?,?,?)", [
    name,
    price,
    quantity,
  ]);
};

exports.update = async (id, { name, price, quantity }) => {
  await db.query("UPDATE products SET name=?, price=?, quantity=? WHERE id=?", [
    name,
    price,
    quantity,
    id,
  ]);
};

exports.remove = async (id) => {
  await db.query("DELETE FROM products WHERE id=?", [id]);
};

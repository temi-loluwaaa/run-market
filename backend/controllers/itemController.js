const pool = require('../config/db');

// Get all items
exports.getAllItems = async (req, res) => {
  try {
    const [items] = await pool.query(
      'SELECT items.*, users.name as seller_name, users.phone as seller_phone FROM items JOIN users ON items.user_id = users.id ORDER BY created_at DESC'
    );
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new item (Protected)
exports.createItem = async (req, res) => {
  const { title, description, price, image_url } = req.body;
  const user_id = req.user.id;

  if (!title || !price) {
    return res.status(400).json({ message: 'Title and price are required.' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO items (user_id, title, description, price, image_url) VALUES (?, ?, ?, ?, ?)',
      [user_id, title, description || '', price, image_url || '']
    );
    res.status(201).json({ message: 'Item posted successfully', itemId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete item (Protected - Owner only)
exports.deleteItem = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const [items] = await pool.query('SELECT * FROM items WHERE id = ?', [id]);
    if (items.length === 0) return res.status(404).json({ message: 'Item not found' });
    if (items[0].user_id !== user_id) return res.status(403).json({ message: 'Unauthorized' });

    await pool.query('DELETE FROM items WHERE id = ?', [id]);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
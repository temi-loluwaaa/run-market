const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', itemController.getAllItems);
router.post('/', authMiddleware, itemController.createItem);
router.delete('/:id', authMiddleware, itemController.deleteItem);

module.exports = router;
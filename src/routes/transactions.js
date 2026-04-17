const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getAll, getById, create } = require('../controllers/transactionController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.use(authenticate);

router.get('/', getAll);
router.get('/:id', getById);

router.post(
  '/',
  [
    body('productId').isInt({ min: 1 }).withMessage('Valid product is required'),
    body('transactionType').isIn(['IN', 'OUT', 'ADJUST']).withMessage('Type must be IN, OUT, or ADJUST'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  validate,
  create
);

module.exports = router;

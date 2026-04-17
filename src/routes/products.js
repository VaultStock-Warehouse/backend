const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getAll, getById, create, update, remove } = require('../controllers/productController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const upload = require('../middleware/upload');

router.use(authenticate);

router.get('/', getAll);
router.get('/:id', getById);

router.post(
  '/',
  authorize('admin'),
  upload.single('image'),
  [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('sku').trim().notEmpty().withMessage('SKU is required'),
    body('categoryId').isInt({ min: 1 }).withMessage('Valid category is required'),
    body('unitPrice').isFloat({ min: 0 }).withMessage('Valid unit price is required'),
    body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  ],
  validate,
  create
);

router.put(
  '/:id',
  authorize('admin'),
  upload.single('image'),
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('categoryId').optional().isInt({ min: 1 }).withMessage('Valid category required'),
    body('unitPrice').optional().isFloat({ min: 0 }).withMessage('Valid unit price required'),
    body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be non-negative'),
  ],
  validate,
  update
);

router.delete('/:id', authorize('admin'), remove);

module.exports = router;

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getAll, getById, create, update, remove } = require('../controllers/categoryController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validate } = require('../middleware/validate');

router.use(authenticate);

router.get('/', getAll);
router.get('/:id', getById);

router.post(
  '/',
  authorize('admin'),
  [body('name').trim().notEmpty().withMessage('Category name is required')],
  validate,
  create
);

router.put(
  '/:id',
  authorize('admin'),
  [body('name').optional().trim().notEmpty().withMessage('Name cannot be empty')],
  validate,
  update
);

router.delete('/:id', authorize('admin'), remove);

module.exports = router;

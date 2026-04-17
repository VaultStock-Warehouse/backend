const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getAll, getById, update, remove } = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validate } = require('../middleware/validate');

router.use(authenticate);

router.get('/', authorize('admin'), getAll);
router.get('/:id', authorize('admin'), getById);

router.put(
  '/:id',
  authorize('admin'),
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email required'),
    body('role').optional().isIn(['admin', 'staff']).withMessage('Invalid role'),
  ],
  validate,
  update
);

router.delete('/:id', authorize('admin'), remove);

module.exports = router;

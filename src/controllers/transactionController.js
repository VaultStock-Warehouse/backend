const transactionService = require('../services/transactionService');

const getAll = async (req, res, next) => {
  try {
    const result = await transactionService.getAll(req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const tx = await transactionService.getById(parseInt(req.params.id));
    res.json({ success: true, data: tx });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { productId, transactionType, quantity, note } = req.body;
    const tx = await transactionService.create({
      productId: parseInt(productId),
      transactionType,
      quantity: parseInt(quantity),
      note,
      createdBy: req.user.id,
    });
    res.status(201).json({ success: true, data: tx });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create };

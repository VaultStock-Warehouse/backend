const productService = require('../services/productService');

const getAll = async (req, res, next) => {
  try {
    const result = await productService.getAll(req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const product = await productService.getById(parseInt(req.params.id));
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.imagePath = `/uploads/${req.file.filename}`;
    }
    if (data.categoryId) data.categoryId = parseInt(data.categoryId);
    if (data.quantity) data.quantity = parseInt(data.quantity);
    if (data.unitPrice) data.unitPrice = parseFloat(data.unitPrice);

    const product = await productService.create(data);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.imagePath = `/uploads/${req.file.filename}`;
    }
    if (data.categoryId) data.categoryId = parseInt(data.categoryId);
    if (data.quantity !== undefined) data.quantity = parseInt(data.quantity);
    if (data.unitPrice !== undefined) data.unitPrice = parseFloat(data.unitPrice);

    const product = await productService.update(parseInt(req.params.id), data);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await productService.remove(parseInt(req.params.id));
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, remove };

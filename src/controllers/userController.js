const userService = require('../services/userService');

const getAll = async (req, res, next) => {
  try {
    const users = await userService.getAll();
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const user = await userService.getById(parseInt(req.params.id));
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const user = await userService.update(parseInt(req.params.id), req.body);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await userService.remove(parseInt(req.params.id));
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, update, remove };

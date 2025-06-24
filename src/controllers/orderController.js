const { findOrders, getOrderWithItems } = require('../services/orderService');

const getUserOrders = async (req, res) => {
  const userId = req.user?.id;
  const filters = req.query;

  if (req.user?.role !== 'user') {
    return res.status(403).json({ error: '僅限會員操作' });
  }

  if (!userId) {
    return res.status(401).json({ error: '尚未登入或 token 無效' });
  }

  try {
    const cleanFilters = {};
    if (filters.search && typeof filters.search === 'string' && filters.search.trim() !== '') {
      cleanFilters.search = filters.search;
    }

    if (
      filters.orderNumber &&
      typeof filters.orderNumber === 'string' &&
      filters.orderNumber.trim() !== ''
    ) {
      cleanFilters.orderNumber = filters.orderNumber;
    }

    if (
      typeof filters.startDate === 'string' &&
      filters.startDate.trim() !== '' &&
      !isNaN(new Date(filters.startDate))
    ) {
      cleanFilters.startDate = filters.startDate;
    }

    if (
      typeof filters.endDate === 'string' &&
      filters.endDate.trim() !== '' &&
      !isNaN(new Date(filters.endDate))
    ) {
      cleanFilters.endDate = filters.endDate;
    }

    const orders = await findOrders({ userId, filters: cleanFilters });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getOrderById = async (req, res) => {
  const userId = req.user?.id;
  const isAdmin = req.user?.role === 'admin';
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: '訂單 ID 無效' });
  }

  try {
    const order = await getOrderWithItems(id);
    if (!order) {
      return res.status(404).json({ message: '找不到該訂單' });
    }

    if (!isAdmin && order.userId !== userId) {
      return res.status(403).json({ error: '無權查看此訂單' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getUserOrders,
  getOrderById,
};

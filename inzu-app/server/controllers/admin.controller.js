const User     = require('../models/User');
const Property = require('../models/Property');
const Booking  = require('../models/Booking');

// GET /api/admin/analytics
exports.getAnalytics = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProperties,
      totalBookings,
      availableProperties,
      pendingProperties,
      confirmedBookings,
      cancelledBookings,
      recentBookings,
      recentProperties,
      userRoles,
      bookingsByMonth,
    ] = await Promise.all([
      User.countDocuments(),
      Property.countDocuments({ isApproved: true }),
      Booking.countDocuments(),
      Property.countDocuments({ status: 'available',   isApproved: true }),
      Property.countDocuments({ isApproved: false }),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.countDocuments({ status: 'cancelled' }),

      // Last 5 bookings
      Booking.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('property', 'title location')
        .populate('user',     'name email'),

      // Last 5 submitted properties
      Property.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('owner', 'name email'),

      // Count by role
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),

      // Bookings per month for the last 6 months
      Booking.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
            },
          },
        },
        {
          $group: {
            _id: {
              year:  { $year:  '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    // Total revenue from confirmed bookings
    const revenueAgg = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    res.json({
      stats: {
        totalUsers,
        totalProperties,
        totalBookings,
        availableProperties,
        pendingProperties,
        confirmedBookings,
        cancelledBookings,
        totalRevenue,
      },
      charts: {
        bookingsByMonth,
        userRoles,
      },
      recent: {
        bookings:   recentBookings,
        properties: recentProperties,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role)   filter.role  = role;
    if (search) filter.$or   = [
      { name:  { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ total, page: Number(page), users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/admin/users/:id/role
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'owner', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Role updated', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/properties  (all — including unapproved)
exports.getAllProperties = async (req, res) => {
  try {
    const { isApproved, status, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (isApproved !== undefined) filter.isApproved = isApproved === 'true';
    if (status)                   filter.status     = status;
    if (search) filter.$or = [
      { title:    { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
    ];

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Property.countDocuments(filter);
    const properties = await Property.find(filter)
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ total, page: Number(page), properties });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/admin/properties/:id/approve
exports.approveProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).populate('owner', 'name email');

    if (!property) return res.status(404).json({ message: 'Property not found' });

    // Notify all clients that a new property is available
    req.io.emit('new_property', {
      propertyId: property._id,
      title:      property.title,
    });

    res.json({ message: 'Property approved', property });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/admin/properties/:id/reject  (sets isApproved false)
exports.rejectProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { isApproved: false },
      { new: true }
    );
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json({ message: 'Property rejected', property });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/admin/properties/:id
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json({ message: 'Property deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/bookings
exports.getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .populate('property', 'title location price images')
      .populate('user',     'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ total, page: Number(page), bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

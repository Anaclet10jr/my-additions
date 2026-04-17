const Booking  = require('../models/Booking');
const Property = require('../models/Property');

// POST /api/bookings/:propertyId — create a booking
exports.createBooking = async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    if (property.status === 'unavailable') {
      return res.status(400).json({ message: 'Property is already booked' });
    }

    const { startDate, endDate, message } = req.body;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start and end dates are required' });
    }

    const start = new Date(startDate);
    const end   = new Date(endDate);
    if (end <= start) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Calculate number of months and total price
    const months     = Math.ceil((end - start) / (1000 * 60 * 60 * 24 * 30));
    const totalPrice = property.price * (months || 1);

    const booking = await Booking.create({
      property:   property._id,
      user:       req.user._id,
      startDate:  start,
      endDate:    end,
      totalPrice,
      status:     'confirmed',
      message:    message || '',
    });

    // Mark property as unavailable
    property.status = 'unavailable';
    await property.save();

    // === REAL-TIME: broadcast to ALL connected clients ===
    req.io.emit('property_booked', {
      propertyId: property._id.toString(),
      status:     'unavailable',
    });

    const populatedBooking = await booking.populate([
      { path: 'property', select: 'title location price images' },
      { path: 'user',     select: 'name email phone' },
    ]);

    res.status(201).json({ message: 'Booking confirmed', booking: populatedBooking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/my — get logged-in user's bookings
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('property', 'title location price images status district')
      .sort({ createdAt: -1 });

    res.json({ count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/property/:propertyId — bookings for a specific property (owner/admin)
exports.getPropertyBookings = async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    const isOwner = property.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const bookings = await Booking.find({ property: req.params.propertyId })
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings — all bookings (admin only)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('property', 'title location price')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/bookings/:id/cancel — cancel a booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const isOwner = booking.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Free up the property
    await Property.findByIdAndUpdate(booking.property, { status: 'available' });

    // Real-time update — property is available again
    req.io.emit('property_available', {
      propertyId: booking.property.toString(),
      status:     'available',
    });

    res.json({ message: 'Booking cancelled', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

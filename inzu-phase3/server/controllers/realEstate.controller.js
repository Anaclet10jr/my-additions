const RealEstate = require('../models/RealEstate');
const Inquiry    = require('../models/Inquiry');

// ── GET all listings (with filters) ──────────────────────────────────────────
exports.getListings = async (req, res) => {
  try {
    const {
      listingType, propertyType, district, minPrice, maxPrice,
      bedrooms, status = 'available', page = 1, limit = 12, sort = 'newest'
    } = req.query;

    const filter = { isApproved: true };
    if (listingType)   filter.listingType = listingType;
    if (propertyType)  filter.propertyType = propertyType;
    if (district)      filter['location.district'] = district;
    if (status)        filter.status = status;
    if (bedrooms)      filter['features.bedrooms'] = { $gte: Number(bedrooms) };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const sortMap = {
      newest:       { createdAt: -1 },
      oldest:       { createdAt:  1 },
      price_asc:    { price:      1 },
      price_desc:   { price:     -1 },
      featured:     { isFeatured: -1, createdAt: -1 },
    };

    const skip = (Number(page) - 1) * Number(limit);
    const [listings, total] = await Promise.all([
      RealEstate.find(filter)
        .sort(sortMap[sort] || sortMap.newest)
        .skip(skip).limit(Number(limit))
        .populate('owner', 'name phone email avatar'),
      RealEstate.countDocuments(filter),
    ]);

    res.json({ listings, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET single listing ────────────────────────────────────────────────────────
exports.getListing = async (req, res) => {
  try {
    const listing = await RealEstate.findById(req.params.id)
      .populate('owner', 'name phone email avatar createdAt')
      .populate('agent', 'name phone email avatar');
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    // increment views
    listing.views += 1;
    await listing.save();

    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST create listing ───────────────────────────────────────────────────────
exports.createListing = async (req, res) => {
  try {
    const images = req.files ? req.files.map(f => f.path) : [];
    const listing = await RealEstate.create({
      ...req.body,
      images,
      owner: req.user.id,
    });
    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT update listing ────────────────────────────────────────────────────────
exports.updateListing = async (req, res) => {
  try {
    const listing = await RealEstate.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Not found' });
    if (listing.owner.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });

    const newImages = req.files ? req.files.map(f => f.path) : [];
    const updated = await RealEstate.findByIdAndUpdate(
      req.params.id,
      { ...req.body, ...(newImages.length && { images: newImages }) },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE listing ────────────────────────────────────────────────────────────
exports.deleteListing = async (req, res) => {
  try {
    const listing = await RealEstate.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Not found' });
    if (listing.owner.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    await listing.deleteOne();
    res.json({ message: 'Listing removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST send inquiry ─────────────────────────────────────────────────────────
exports.sendInquiry = async (req, res) => {
  try {
    const listing = await RealEstate.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    const inquiry = await Inquiry.create({
      property: listing._id,
      sender:   req.user.id,
      owner:    listing.owner,
      message:  req.body.message,
      phone:    req.body.phone,
    });

    listing.inquiries.push(inquiry._id);
    await listing.save();

    // real-time notification to owner
    req.io.to(`user_${listing.owner}`).emit('new_inquiry', {
      propertyId:    listing._id,
      propertyTitle: listing.title,
      inquiryId:     inquiry._id,
    });

    res.status(201).json(inquiry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET my listings (owner) ───────────────────────────────────────────────────
exports.getMyListings = async (req, res) => {
  try {
    const listings = await RealEstate.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const Property = require('../models/Property');

// GET /api/properties — list all approved properties with filters
exports.getProperties = async (req, res) => {
  try {
    const { district, type, status, minPrice, maxPrice, search } = req.query;

    const filter = { isApproved: true };

    if (district)  filter.district = district;
    if (type)      filter.type     = type;
    if (status)    filter.status   = status;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { location:    { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const properties = await Property.find(filter)
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ count: properties.length, properties });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/properties/:id — single property
exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'name email phone avatar');

    if (!property) return res.status(404).json({ message: 'Property not found' });

    res.json({ property });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/properties — create (owner/admin only)
exports.createProperty = async (req, res) => {
  try {
    const { title, description, price, location, district, type, bedrooms, bathrooms, amenities } = req.body;

    // Images uploaded via Cloudinary middleware — req.files has the URLs
    const images = req.files ? req.files.map((f) => f.path) : [];

    const property = await Property.create({
      title,
      description,
      price: Number(price),
      location,
      district,
      type,
      bedrooms: Number(bedrooms) || 1,
      bathrooms: Number(bathrooms) || 1,
      amenities: amenities ? amenities.split(',').map((a) => a.trim()) : [],
      images,
      owner: req.user._id,
      isApproved: req.user.role === 'admin', // admins auto-approve their own listings
    });

    res.status(201).json({ message: 'Property created, pending approval', property });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/properties/:id — update (owner of property or admin)
exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    const isOwner = property.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this property' });
    }

    const updated = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ property: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/properties/:id — delete (owner or admin)
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    const isOwner = property.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this property' });
    }

    await property.deleteOne();
    res.json({ message: 'Property deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/properties/:id/approve — admin only
exports.approveProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json({ message: 'Property approved', property });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

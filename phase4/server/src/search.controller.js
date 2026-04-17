/**
 * Advanced Search Controller
 * Handles: full-text, geo, filters, pagination, sorting
 * Route: GET /api/search
 */
const Property = require('../../../backend/src/models/Property.model');
const { asyncHandler } = require('../../../backend/src/middleware/error.middleware');

// ─── Rwanda districts with coordinates ────────────────────
const DISTRICT_COORDS = {
  Gasabo:     { lat: -1.9441, lng: 30.0619 },
  Kicukiro:   { lat: -1.9993, lng: 30.0935 },
  Nyarugenge: { lat: -1.9536, lng: 30.0605 },
  Musanze:    { lat: -1.4990, lng: 29.6346 },
  Rubavu:     { lat: -1.6775, lng: 29.2567 },
  Huye:       { lat: -2.5967, lng: 29.7394 },
  Muhanga:    { lat: -2.0832, lng: 29.7572 },
  Rwamagana:  { lat: -1.9489, lng: 30.4357 },
};

// ─── @GET /api/search ──────────────────────────────────────
exports.search = asyncHandler(async (req, res) => {
  const {
    q,                    // Full-text query
    type,                 // rent | sale | short_stay
    category,             // apartment | house | villa | ...
    district,
    sector,
    minPrice, maxPrice,
    bedrooms, bathrooms,
    furnished,
    amenities,
    isAvailable,
    isVerified,
    sortBy = '-createdAt',
    page = 1,
    limit = 12,
  } = req.query;

  // ─── Build filter ────────────────────────────────────
  const filter = { status: 'approved' };

  if (type)     filter.type = type;
  if (category) filter.category = category;
  if (district) filter['location.district'] = district;
  if (sector)   filter['location.sector'] = { $regex: sector, $options: 'i' };
  if (bedrooms) filter['features.bedrooms'] = { $gte: Number(bedrooms) };
  if (bathrooms) filter['features.bathrooms'] = { $gte: Number(bathrooms) };
  if (furnished) filter['features.furnished'] = furnished;
  if (isAvailable === 'true') filter.isAvailable = true;
  if (isVerified === 'true')  filter.isVerified = true;

  if (minPrice || maxPrice) {
    filter['price.amount'] = {};
    if (minPrice) filter['price.amount'].$gte = Number(minPrice);
    if (maxPrice) filter['price.amount'].$lte = Number(maxPrice);
  }

  if (amenities) {
    const list = amenities.split(',').map((a) => a.trim()).filter(Boolean);
    if (list.length > 0) filter.amenities = { $all: list };
  }

  // ─── Full-text search ────────────────────────────────
  let scoreSort = false;
  if (q) {
    filter.$text = { $search: q };
    scoreSort = true;
  }

  // ─── Sort ────────────────────────────────────────────
  let sort = {};
  if (scoreSort && q) {
    sort = { score: { $meta: 'textScore' }, ...buildSort(sortBy) };
  } else {
    sort = buildSort(sortBy);
  }

  // ─── Pagination ──────────────────────────────────────
  const skip = (Number(page) - 1) * Number(limit);
  const limitNum = Math.min(Number(limit), 50); // Cap at 50

  // ─── Execute ─────────────────────────────────────────
  const projection = scoreSort ? { score: { $meta: 'textScore' } } : {};

  const [properties, total] = await Promise.all([
    Property.find(filter, projection)
      .populate('owner', 'firstName lastName avatar verificationBadge isKYCVerified phone')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Property.countDocuments(filter),
  ]);

  // ─── Aggregations for filter sidebar ─────────────────
  const [priceStats, districtCounts] = await Promise.all([
    Property.aggregate([
      { $match: { ...filter, $text: undefined } },
      { $group: { _id: null, min: { $min: '$price.amount' }, max: { $max: '$price.amount' }, avg: { $avg: '$price.amount' } } },
    ]),
    Property.aggregate([
      { $match: { status: 'approved', ...(type && { type }) } },
      { $group: { _id: '$location.district', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / limitNum),
    count: properties.length,
    data: properties,
    meta: {
      query: q || null,
      filters: { type, category, district, minPrice, maxPrice, bedrooms, amenities },
      priceRange: priceStats[0] || { min: 0, max: 5000000, avg: 500000 },
      districtCounts: Object.fromEntries(districtCounts.map((d) => [d._id, d.count])),
    },
  });
});

// ─── @GET /api/search/suggestions ─────────────────────────
exports.suggestions = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.json({ success: true, data: [] });

  const regex = new RegExp(q, 'i');

  const [titleMatches, sectorMatches] = await Promise.all([
    Property.find({ status: 'approved', title: regex }).select('title slug type').limit(5).lean(),
    Property.distinct('location.sector', { status: 'approved', 'location.sector': regex }),
  ]);

  const suggestions = [
    ...titleMatches.map((p) => ({ type: 'property', label: p.title, href: `/properties/${p.slug}`, tag: p.type })),
    ...sectorMatches.slice(0, 5).map((s) => ({ type: 'location', label: s, href: `/search?sector=${s}`, tag: 'Sector' })),
  ];

  res.status(200).json({ success: true, data: suggestions });
});

// ─── Helper: build sort object ────────────────────────────
function buildSort(sortBy) {
  const map = {
    '-createdAt': { createdAt: -1 },
    'createdAt': { createdAt: 1 },
    'price.amount': { 'price.amount': 1 },
    '-price.amount': { 'price.amount': -1 },
    '-views': { views: -1 },
    '-saves': { saves: -1 },
    '-bookingsCount': { bookingsCount: -1 },
  };
  return map[sortBy] || { createdAt: -1 };
}

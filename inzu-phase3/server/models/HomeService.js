const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: [
      'plumbing', 'electrical', 'painting', 'roofing', 'tiling',
      'carpentry', 'masonry', 'cleaning', 'landscaping', 'renovation',
      'hvac', 'solar', 'security', 'pest_control', 'interior_fit_out'
    ],
    required: true,
  },
  provider:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  priceModel:  { type: String, enum: ['fixed', 'hourly', 'quote'], default: 'quote' },
  basePrice:   { type: Number },         // if fixed or hourly
  images:      [String],
  coverImage:  { type: String },
  portfolio:   [String],                 // before/after photos
  rating: {
    average: { type: Number, default: 0 },
    count:   { type: Number, default: 0 },
  },
  availability: {
    days:      [{ type: String, enum: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] }],
    startTime: { type: String, default: '08:00' },
    endTime:   { type: String, default: '18:00' },
  },
  serviceArea:  [String],                // districts covered
  isVerified:   { type: Boolean, default: false },
  isApproved:   { type: Boolean, default: false },
  isActive:     { type: Boolean, default: true },
  totalJobs:    { type: Number, default: 0 },
}, { timestamps: true });

// ── Service Request (job booking) ────────────────────────────────────────────
const serviceRequestSchema = new mongoose.Schema({
  service:     { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  client:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  address:     { type: String, required: true },
  district:    { type: String, required: true },
  images:      [String],                 // photos of the problem
  preferredDate:  { type: Date },
  preferredTime:  { type: String },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'disputed'],
    default: 'pending',
  },
  quotedPrice: { type: Number },
  finalPrice:  { type: Number },
  review: {
    rating:  { type: Number, min: 1, max: 5 },
    comment: { type: String },
    date:    { type: Date },
  },
}, { timestamps: true });

module.exports = {
  Service:        mongoose.model('Service', serviceSchema),
  ServiceRequest: mongoose.model('ServiceRequest', serviceRequestSchema),
};

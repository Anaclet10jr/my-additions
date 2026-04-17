const mongoose = require('mongoose');

const interiorProjectSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  designer:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  style: {
    type: String,
    enum: [
      'modern', 'contemporary', 'traditional', 'minimalist',
      'rustic', 'industrial', 'scandinavian', 'bohemian',
      'african_fusion', 'luxury', 'transitional'
    ],
  },
  roomType: [{
    type: String,
    enum: ['living_room','bedroom','kitchen','bathroom','office',
           'dining_room','outdoor','full_home','commercial'],
  }],
  before:       [String],               // before photos
  after:        [String],               // after photos
  moodBoard:    [String],               // inspiration board
  budget: {
    min: { type: Number },
    max: { type: Number },
  },
  duration:     { type: String },       // e.g. "2–4 weeks"
  rating: {
    average: { type: Number, default: 0 },
    count:   { type: Number, default: 0 },
  },
  isApproved:   { type: Boolean, default: false },
  isFeatured:   { type: Boolean, default: false },
}, { timestamps: true });

// ── Interior Design Request ───────────────────────────────────────────────────
const designRequestSchema = new mongoose.Schema({
  designer:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  client:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectType: {
    type: String,
    enum: ['consultation','full_design','3d_render','furniture_sourcing','supervision'],
    required: true,
  },
  roomType:    [{ type: String }],
  style:       { type: String },
  description: { type: String, required: true },
  budget: {
    min: { type: Number },
    max: { type: Number },
    currency: { type: String, default: 'RWF' },
  },
  referenceImages: [String],
  address:     { type: String },
  district:    { type: String },
  status: {
    type: String,
    enum: ['pending', 'quoted', 'accepted', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  quotedPrice: { type: Number },
  timeline:    { type: String },
  messages:    [{
    sender:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text:      { type: String },
    date:      { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = {
  InteriorProject: mongoose.model('InteriorProject', interiorProjectSchema),
  DesignRequest:   mongoose.model('DesignRequest', designRequestSchema),
};

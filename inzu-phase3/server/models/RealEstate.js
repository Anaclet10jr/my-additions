const mongoose = require('mongoose');

const realEstateSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  description:  { type: String, required: true },
  price:        { type: Number, required: true },
  listingType:  { type: String, enum: ['buy', 'sell'], required: true },
  propertyType: { type: String, enum: ['house', 'apartment', 'land', 'commercial', 'villa'], default: 'house' },
  status:       { type: String, enum: ['available', 'under_offer', 'sold'], default: 'available' },
  location: {
    address:  { type: String, required: true },
    district: { type: String, required: true }, // Gasabo, Kicukiro, Nyarugenge, etc.
    sector:   { type: String },
    lat:      { type: Number },
    lng:      { type: Number },
  },
  features: {
    bedrooms:   { type: Number, default: 0 },
    bathrooms:  { type: Number, default: 0 },
    area:       { type: Number },       // in m²
    floors:     { type: Number, default: 1 },
    parking:    { type: Boolean, default: false },
    garden:     { type: Boolean, default: false },
    furnished:  { type: Boolean, default: false },
    yearBuilt:  { type: Number },
  },
  images:       [String],               // Cloudinary URLs
  owner:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  agent:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional assigned agent
  isApproved:   { type: Boolean, default: false },
  isFeatured:   { type: Boolean, default: false },
  views:        { type: Number, default: 0 },
  inquiries:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Inquiry' }],
}, { timestamps: true });

realEstateSchema.index({ 'location.district': 1, listingType: 1, status: 1 });
realEstateSchema.index({ price: 1 });

module.exports = mongoose.model('RealEstate', realEstateSchema);

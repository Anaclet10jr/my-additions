const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price:       { type: Number, required: true, min: 0 },
    location:    { type: String, required: true, trim: true },
    district:    {
      type: String,
      enum: ['Gasabo', 'Kicukiro', 'Nyarugenge', 'Bugesera', 'Other'],
      default: 'Other',
    },
    images:      [{ type: String }],          // Cloudinary URLs
    status:      {
      type: String,
      enum: ['available', 'unavailable'],
      default: 'available',
    },
    type:        {
      type: String,
      enum: ['apartment', 'house', 'room', 'office'],
      default: 'apartment',
    },
    bedrooms:    { type: Number, default: 1 },
    bathrooms:   { type: Number, default: 1 },
    amenities:   [{ type: String }],          // e.g. ['wifi', 'parking', 'security']
    owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isApproved:  { type: Boolean, default: false }, // admin must approve before listing shows
  },
  { timestamps: true }
);

// Index for fast search by location and status
propertySchema.index({ district: 1, status: 1, type: 1 });

module.exports = mongoose.model('Property', propertySchema);

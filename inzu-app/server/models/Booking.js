const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    property:   { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startDate:  { type: Date, required: true },
    endDate:    { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    status:     {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
    message:    { type: String, trim: true }, // optional note from the renter
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);

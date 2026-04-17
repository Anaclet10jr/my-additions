const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  property:    { type: mongoose.Schema.Types.ObjectId, ref: 'RealEstate', required: true },
  sender:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message:     { type: String, required: true },
  phone:       { type: String },
  status:      { type: String, enum: ['new', 'read', 'replied'], default: 'new' },
  replies: [{
    sender:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String },
    date:    { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', inquirySchema);

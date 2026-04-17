const { Service, ServiceRequest } = require('../models/HomeService');

// ── GET all services ──────────────────────────────────────────────────────────
exports.getServices = async (req, res) => {
  try {
    const { category, district, page = 1, limit = 12, sort = 'rating' } = req.query;
    const filter = { isApproved: true, isActive: true };
    if (category) filter.category = category;
    if (district) filter.serviceArea = district;

    const sortMap = {
      rating:   { 'rating.average': -1 },
      jobs:     { totalJobs: -1 },
      newest:   { createdAt: -1 },
    };

    const skip = (Number(page) - 1) * Number(limit);
    const [services, total] = await Promise.all([
      Service.find(filter)
        .sort(sortMap[sort] || sortMap.rating)
        .skip(skip).limit(Number(limit))
        .populate('provider', 'name avatar phone'),
      Service.countDocuments(filter),
    ]);
    res.json({ services, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET single service ────────────────────────────────────────────────────────
exports.getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('provider', 'name avatar phone email createdAt');
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST create service listing (provider) ────────────────────────────────────
exports.createService = async (req, res) => {
  try {
    const images    = req.files ? req.files.map(f => f.path) : [];
    const service = await Service.create({
      ...req.body,
      images,
      provider: req.user.id,
    });
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST request a service (client books a job) ───────────────────────────────
exports.createRequest = async (req, res) => {
  try {
    const service = await Service.findById(req.params.serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    const images = req.files ? req.files.map(f => f.path) : [];
    const request = await ServiceRequest.create({
      ...req.body,
      images,
      service:  service._id,
      client:   req.user.id,
      provider: service.provider,
    });

    // notify provider in real time
    req.io.to(`user_${service.provider}`).emit('new_service_request', {
      requestId:   request._id,
      serviceName: service.name,
      clientId:    req.user.id,
    });

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PATCH update request status (provider) ────────────────────────────────────
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status, quotedPrice, finalPrice } = req.body;
    const request = await ServiceRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.provider.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });

    request.status = status || request.status;
    if (quotedPrice) request.quotedPrice = quotedPrice;
    if (finalPrice)  request.finalPrice  = finalPrice;
    if (status === 'completed') {
      await Service.findByIdAndUpdate(request.service, { $inc: { totalJobs: 1 } });
    }
    await request.save();

    // notify client in real time
    req.io.to(`user_${request.client}`).emit('request_status_updated', {
      requestId: request._id,
      status:    request.status,
    });

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST leave a review ───────────────────────────────────────────────────────
exports.leaveReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const request = await ServiceRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.client.toString() !== req.user.id)
      return res.status(403).json({ message: 'Only the client can leave a review' });
    if (request.status !== 'completed')
      return res.status(400).json({ message: 'Job must be completed first' });

    request.review = { rating, comment, date: new Date() };
    await request.save();

    // update service average rating
    const service  = await Service.findById(request.service);
    const newCount = service.rating.count + 1;
    const newAvg   = ((service.rating.average * service.rating.count) + rating) / newCount;
    service.rating = { average: Math.round(newAvg * 10) / 10, count: newCount };
    await service.save();

    res.json({ message: 'Review submitted', rating: service.rating });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET my requests (client) ──────────────────────────────────────────────────
exports.getMyRequests = async (req, res) => {
  try {
    const role = req.query.role || 'client';
    const filter = role === 'provider'
      ? { provider: req.user.id }
      : { client:   req.user.id };
    const requests = await ServiceRequest.find(filter)
      .sort({ createdAt: -1 })
      .populate('service', 'name category coverImage')
      .populate('client provider', 'name phone avatar');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

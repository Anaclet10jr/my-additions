const { InteriorProject, DesignRequest } = require('../models/InteriorDesign');

// ── GET portfolio / showcase ───────────────────────────────────────────────────
exports.getProjects = async (req, res) => {
  try {
    const { style, roomType, page = 1, limit = 12 } = req.query;
    const filter = { isApproved: true };
    if (style)    filter.style    = style;
    if (roomType) filter.roomType = roomType;

    const skip = (Number(page) - 1) * Number(limit);
    const [projects, total] = await Promise.all([
      InteriorProject.find(filter)
        .sort({ isFeatured: -1, createdAt: -1 })
        .skip(skip).limit(Number(limit))
        .populate('designer', 'name avatar'),
      InteriorProject.countDocuments(filter),
    ]);
    res.json({ projects, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET single project ────────────────────────────────────────────────────────
exports.getProject = async (req, res) => {
  try {
    const project = await InteriorProject.findById(req.params.id)
      .populate('designer', 'name avatar email phone createdAt');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST create portfolio project (designer) ───────────────────────────────────
exports.createProject = async (req, res) => {
  try {
    const after = req.files?.after?.map(f => f.path) || [];
    const before = req.files?.before?.map(f => f.path) || [];
    const moodBoard = req.files?.moodBoard?.map(f => f.path) || [];

    const project = await InteriorProject.create({
      ...req.body,
      before, after, moodBoard,
      designer: req.user.id,
    });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST request design work (client → designer) ──────────────────────────────
exports.createRequest = async (req, res) => {
  try {
    const { designerId } = req.params;
    const refImages = req.files ? req.files.map(f => f.path) : [];

    const request = await DesignRequest.create({
      ...req.body,
      referenceImages: refImages,
      designer: designerId,
      client:   req.user.id,
    });

    // real-time notification
    req.io.to(`user_${designerId}`).emit('new_design_request', {
      requestId: request._id,
      clientId:  req.user.id,
    });

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PATCH update request (designer responds, updates status/quote) ─────────────
exports.updateRequest = async (req, res) => {
  try {
    const request = await DesignRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    const isDesigner = request.designer.toString() === req.user.id;
    const isClient   = request.client.toString()   === req.user.id;
    if (!isDesigner && !isClient && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });

    const { status, quotedPrice, timeline, message } = req.body;
    if (status)      request.status      = status;
    if (quotedPrice) request.quotedPrice = quotedPrice;
    if (timeline)    request.timeline    = timeline;
    if (message) {
      request.messages.push({ sender: req.user.id, text: message });
    }
    await request.save();

    // notify the other party
    const notifyUser = isDesigner ? request.client : request.designer;
    req.io.to(`user_${notifyUser}`).emit('design_request_updated', {
      requestId: request._id,
      status:    request.status,
    });

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET my requests ───────────────────────────────────────────────────────────
exports.getMyRequests = async (req, res) => {
  try {
    const role = req.query.role || 'client';
    const filter = role === 'designer'
      ? { designer: req.user.id }
      : { client:   req.user.id };
    const requests = await DesignRequest.find(filter)
      .sort({ createdAt: -1 })
      .populate('designer client', 'name avatar phone');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET all designers (public) ────────────────────────────────────────────────
exports.getDesigners = async (req, res) => {
  try {
    // return distinct designers who have approved projects
    const designerIds = await InteriorProject.distinct('designer', { isApproved: true });
    const User = require('../models/User');
    const designers = await User.find({ _id: { $in: designerIds } })
      .select('name avatar bio rating createdAt');
    res.json(designers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add these routes to your existing admin.routes.js
// and add these controller methods to admin.controller.js

// ──────────────────────────────────────────────────────────────────────────────
// PASTE INTO server/controllers/admin.controller.js  (append at bottom)
// ──────────────────────────────────────────────────────────────────────────────

const RealEstate         = require('../models/RealEstate');
const { Service }        = require('../models/HomeService');
const { InteriorProject }= require('../models/InteriorDesign');

// GET /api/admin/real-estate  — all real estate listings
exports.getAllRealEstate = async (req, res) => {
  try {
    const listings = await RealEstate.find().sort({ createdAt: -1 }).populate('owner', 'name email');
    res.json(listings);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PATCH /api/admin/real-estate/:id/approve
exports.approveRealEstate = async (req, res) => {
  try {
    const listing = await RealEstate.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    res.json(listing);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/admin/services
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 }).populate('provider', 'name email');
    res.json(services);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PATCH /api/admin/services/:id/approve
exports.approveService = async (req, res) => {
  try {
    const svc = await Service.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    res.json(svc);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/admin/interior
exports.getAllInteriorProjects = async (req, res) => {
  try {
    const projects = await InteriorProject.find().sort({ createdAt: -1 }).populate('designer', 'name email');
    res.json(projects);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PATCH /api/admin/interior/:id/approve
exports.approveInteriorProject = async (req, res) => {
  try {
    const proj = await InteriorProject.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    res.json(proj);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ──────────────────────────────────────────────────────────────────────────────
// PASTE INTO server/routes/admin.routes.js  (append before module.exports)
// ──────────────────────────────────────────────────────────────────────────────
//
// const {
//   getAllRealEstate, approveRealEstate,
//   getAllServices, approveService,
//   getAllInteriorProjects, approveInteriorProject,
// } = require('../controllers/admin.controller');
//
// router.get   ('/real-estate',          getAllRealEstate);
// router.patch ('/real-estate/:id/approve', approveRealEstate);
// router.get   ('/services',             getAllServices);
// router.patch ('/services/:id/approve', approveService);
// router.get   ('/interior',             getAllInteriorProjects);
// router.patch ('/interior/:id/approve', approveInteriorProject);

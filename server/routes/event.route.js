const express = require("express");
const router = express.Router();
const eventController = require("../controllers/event.controller");
const { isGuestAuthenticated, isAuthenticated } = require("../middlewares/auth.middleware");

router.post('/create', isAuthenticated, eventController.createEvent);
router.get('/allevents', isAuthenticated, eventController.getAllEvents);
router.get('/eventdetails/:id', isAuthenticated, eventController.getEvent);
router.get("/dashboard/:id", isAuthenticated, eventController.dashboard);
router.get("/guestdashboard", isGuestAuthenticated, eventController.guestDashboard);

module.exports = router;
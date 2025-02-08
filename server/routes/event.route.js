const express = require("express");
const router = express.Router();
const eventController = require("../controllers/event.controller");
const { isAuthenticated } = require("../middlewares/auth.middleware"); // Move middleware to a separate file for modularity

router.post('/create', isAuthenticated, eventController.createEvent);
router.get('/:id', isAuthenticated, eventController.getAllEvents);
router.get('/eventdetails/:id', isAuthenticated, eventController.getEvent);

module.exports = router;
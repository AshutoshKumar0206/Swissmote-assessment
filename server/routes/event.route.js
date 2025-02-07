const express = require("express");
const router = express.Router();
const eventController = require("../controllers/event.controller");
const { isAuthenticated } = require("../middlewares/auth.middleware"); // Move middleware to a separate file for modularity

router.post('/create', isAuthenticated, eventController.createEvent);
router.get('/:id', isAuthenticated, eventController.getEvents);
module.exports = router;
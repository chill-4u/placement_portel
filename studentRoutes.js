const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { verifyToken } = require('../middleware/verifyToken');
const { checkRole } = require('../middleware/roleMiddleware');

router.use(verifyToken);
router.use(checkRole('student'));

router.get('/dashboard', studentController.getDashboard);
router.get('/assignments', studentController.getAssignments);
router.post('/submissions', studentController.submitAssignment);
router.get('/submissions', studentController.getSubmissions);

module.exports = router;

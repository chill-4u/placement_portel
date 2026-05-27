const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');
const { verifyToken } = require('../middleware/verifyToken');
const { checkRole } = require('../middleware/roleMiddleware');

router.use(verifyToken);
router.use(checkRole('faculty'));

router.get('/dashboard', facultyController.getDashboard);
router.post('/upload', facultyController.uploadResource);

router.get('/assignments', facultyController.getAssignments);
router.post('/assignments', facultyController.createAssignment);
router.get('/submissions', facultyController.getSubmissions);

module.exports = router;

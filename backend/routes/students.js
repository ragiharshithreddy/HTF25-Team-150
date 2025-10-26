const express = require('express');
const router = express.Router();
const routes = ['students', 'admin', 'projects', 'applications', 'resumes', 'tests', 'certificates', 'notifications'];

routes.forEach(route => {
  router.get('/', (req, res) => {
    res.status(200).json({ success: true, message: `${route} route placeholder` });
  });
});

module.exports = router;

const express = require('express');
const router = express.Router()
const wikiController = require("../controllers/wiki.controller");
const { verifyToken } = require('../auth/jwt/jwt.auth');
const adminController = require('../controllers/admin.controller');

router.get("/search/:searchTerm", wikiController.search);
router.get('/read/:slug', wikiController.slug);

router.get('/history/:order', verifyToken, adminController.getHistory)
router.get("/visited/pages", adminController.getVisitedPages);
router.post("/admin/login", adminController.admin_login);
router.get("/refresh/token/:token", adminController.refreshToken);
router.post('/logout', verifyToken, adminController.adminLogout)
module.exports = router;

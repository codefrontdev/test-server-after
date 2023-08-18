const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { createInventoryController, getInventoryController, getDonarsController, getHospitalsController, getOrganisationController } = require('../controllers/inventoryController');

const router = express.Router();


// routers
// ADD INVENTORY || POST
router.post('/create-inventory', authMiddleware, createInventoryController);

// GET ALL BLOOD RECORDS
router.get('/get-inventory', authMiddleware, getInventoryController);

// GET DONAR RECORDS
router.get('/get-donars', authMiddleware, getDonarsController);

// GET HOSPITAL RECORDS
router.get('/get-hospitals', authMiddleware, getHospitalsController);

// GET ORGANISATION RECORDS
router.get('/get-organisations', authMiddleware, getOrganisationController);




module.exports = router;
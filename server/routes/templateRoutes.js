// templateRoutes.js
import express from 'express';
import { renderHome, renderAdyen, renderStripe } from '../controllers/templateController.js';

const router = express.Router();

router.get('/', renderHome);
router.get('/adyen', renderAdyen);
router.get('/stripe', renderStripe);

export default router;

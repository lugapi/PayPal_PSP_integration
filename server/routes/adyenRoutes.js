import express from "express";
const router = express.Router();
import {session, getba, transactionOnBa} from '../controllers/adyenController.js';

// Define routes
router.post('/session', async (req, res) => {
    try {
        const result = await session(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/getba', async (req, res) => {
    try {
        const result = await getba(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/transactionOnBa', async (req, res) => {
    try {
        const result = await transactionOnBa(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;

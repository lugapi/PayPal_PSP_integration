import express from "express";
const routerStripe = express.Router();
import {paymentIntent, tunnel} from '../controllers/stripeController.js';

// Define routes
routerStripe.post('/paymentIntent', async (req, res) => {
    try {
        const result = await paymentIntent(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

routerStripe.post('/tunnel', async (req, res) => {
    try {
        const result = await tunnel(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default routerStripe;

import stripePackage from 'stripe';

const {
    STRIPESECRETKEY
} = process.env;

// Set your secret key. Remember to switch to your live secret key in production.
// See your keys here: https://dashboard.stripe.com/apikeys
const stripe = stripePackage(STRIPESECRETKEY);

const paymentIntent = async (params) => {

    const paymentIntent = await stripe.paymentIntents.create({
        amount: params.amount,
        currency: params.currency,
        description: 'A sample description',
        automatic_payment_methods: {
            enabled: true,
          },
    });

    const output = {
        clientSecret: paymentIntent.client_secret,
    };

    console.log(output);

    return output;
};


function calculateOrderAmount(items) {
    // Replace this constant with a calculation of the order's amount
    // Calculate the order total on the server to prevent
    // people from directly manipulating the amount on the client
    return 1400;
}

const tunnel = async (req, res) => {
    try {
        // Retrieve JSON from request body
        const jsonObj = req;

        // Create a PaymentIntent with amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: calculateOrderAmount(jsonObj.items),
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
        });

        const output = {
            clientSecret: paymentIntent.client_secret,
        };

        return output;
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export {
    paymentIntent,
    tunnel
};
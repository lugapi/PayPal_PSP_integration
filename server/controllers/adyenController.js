// import fetch from "node-fetch";
import axios from 'axios';

const {
    XAPIKEY,
    ADYEN_MERCHANT_ID,
} = process.env;

const session = async (requestData) => {
    const apiUrl = 'https://checkout-test.adyen.com/v70/sessions';
    const apiKey = XAPIKEY;

    const headers = {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
    };

    try {
        const response = await axios.post(apiUrl, requestData, { headers });
        console.log(response.data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

const getba = async (request) => {
    const url = 'https://pal-test.adyen.com/pal/servlet/Recurring/v68/listRecurringDetails';
    const headers = {
        'content-type': 'application/json',
        'x-API-key': XAPIKEY,
        'Cookie': 'JSESSIONID=8463CCD75033423B9BAFE415153A63F0.test104e'
    };

    try {
        const response = await axios.post(url, {
            recurring: {
                contract: "RECURRING"
            },
            shopperReference: request.shopperReference,
            merchantAccount: request.merchantAccount
        }, {
            headers
        });

        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const transactionOnBa = async (request) => {
    const timestamp = Math.floor(Date.now() / 1000);
    const url = 'https://checkout-test.adyen.com/v68/payments';
    const headers = {
        'content-type': 'application/json',
        'x-API-key': XAPIKEY
    };

    try {
        const response = await axios.post(url, {
            amount: {
                currency: "USD",
                value: 1000
            },
            reference: `YOUR_ORDER_REFERENCE_RECCURING_${timestamp}`,
            paymentMethod: {
                storedPaymentMethodId: request.recurringDetailReference
            },
            shopperReference: request.shopperReference,
            shopperInteraction: "ContAuth",
            recurringProcessingModel: "CardOnFile",
            merchantAccount: ADYEN_MERCHANT_ID
        }, {
            headers
        });

        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export {
    session,
    getba,
    transactionOnBa
};
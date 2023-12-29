// templateController.js
import dotenv from 'dotenv';

dotenv.config();

const { ADYEN_MERCHANT_ID, PAYPAL_MERCHANT_ID, CLIENT_KEY, STRIPEPUBLISHABLEKEY } = process.env;

export const renderHome = (req, res) => {
  res.render('template', {
    body: 'home',
  });
};

export const renderAdyen = (req, res) => {
  res.render('template', {
    adyenMerchantID: ADYEN_MERCHANT_ID,
    paypalMerchantID: PAYPAL_MERCHANT_ID,
    clientKey: CLIENT_KEY,
    body: 'adyen',
  });
};

export const renderStripe = (req, res) => {
  res.render('template', {
    pkey: STRIPEPUBLISHABLEKEY,
    body: 'stripe',
  });
};
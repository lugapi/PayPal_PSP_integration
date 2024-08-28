// EDITOR JSON
const container = document.getElementById('jsoneditor');
const options = {
    modes: ['text', 'code', 'tree', 'form', 'view'],
    mode: 'tree',
    "search": true
};
const editor = new JSONEditor(container, options);

const json = {
    "amount": {
        "currency": "EUR",
        "value": 10000
    },
    "storePaymentMethod": false,
    "shopperReference": "shopperRef" + Math.floor(Math.random() * 1000000000),
    "countryCode": "FR",
    "merchantAccount": adyenMerchantID,
    "reference": "YOUR_PAYMENT_REFERENCE_" + Math.floor(Math.random() * 1000000000),
    "returnUrl": "https://test.com",
    "recurringProcessingModel": "CardOnFile",
    "additionalData": {
        "paypalRisk": "{\"additional_data\":[{\"key\":\"sender_first_name\",\"value\":\"John\"},{\"key\":\"sender_last_name\",\"value\":\"Smith\"},{\"key\":\"receiver_account_id\",\"value\":\"AH00000000000000000000001\"}]}"
    },
    "lineItems": [
        { "quantity": 1, "amountIncludingTax": 5000, "description": "Sunglasses" },
        { "quantity": 1, "amountIncludingTax": 5000, "description": "Headphones" }
    ]
}

const jsonS2S = {
    "amount": {
        "currency": "EUR",
        "value": 10000
    },
    "storePaymentMethod": false,
    "shopperReference": "shopperRef" + Math.floor(Math.random() * 1000000000),
    "countryCode": "FR",
    "merchantAccount": adyenMerchantID,
    "reference": "YOUR_PAYMENT_REFERENCE_" + Math.floor(Math.random() * 1000000000),
    "returnUrl": "https://test.com",
    "recurringProcessingModel": "CardOnFile",
    "deliveryAddress": {
        "city": "Paris",
        "country": "FR",
        "houseNumberOrName": "21",
        "postalCode": "75002",
        "street": "Rue de la Banque"
    },
    "shopperName": {
        "firstName": "S2S",
        "lastName": "MERCHANT STORE NAME"
    },
    "additionalData": {
        "paypalRisk": "{\"additional_data\":[{\"key\":\"sender_first_name\",\"value\":\"John\"},{\"key\":\"sender_last_name\",\"value\":\"Smith\"},{\"key\":\"receiver_account_id\",\"value\":\"AH00000000000000000000001\"}]}"
    }
}

editor.set(json);
editor.expandAll();

const resultDecoded = {};

document.getElementById('getJSON').addEventListener('click', function () {
    console.log('getJSON');
    const requestData = editor.get();

    fetch('/adyen/session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
    }).then((response) => {
        return response.json();
    }).then((data) => {
        console.log(data);
        resultDecoded.id = data.id;
        resultDecoded.sessionData = data.sessionData;
        resetAndStartCheckout();
    }).catch((error) => {
        console.error(error);
    });

    // DISPLAY GET BA BUTTON IF STORE PAYMENT = TRUE
    if (editor.get().storePaymentMethod) {
        document.getElementById('getBA').classList.remove('hidden');
        console.log("recurring");
        document.getElementById('getBA').addEventListener('click', function () {
            console.log('getBA');
            const requestData = {
                "shopperReference": editor.get().shopperReference,
                "merchantAccount": editor.get().merchantAccount
            };

            fetch('/adyen/getba', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            }).then((response) => {
                return response.json();
            }).then((data) => {
                console.log(data);
                document.getElementById('recurringInfo').innerHTML = prettyPrintObject(data);
                document.querySelector('.recurringInfoDiv').classList.remove('hidden');
                document.querySelector('.trxOnBAResults').classList.remove('hidden');

                // DISPLAY TRX ON BA BUTTON IF STORE PAYMENT = TRUE
                document.getElementById('trxOnBA').addEventListener('click', function () {
                    console.log('trxOnBA');
                    const requestData = {
                        "recurringDetailReference": data.details[0].RecurringDetail.recurringDetailReference,
                        "shopperReference": data.shopperReference
                    };

                    fetch('/adyen/transactionOnBa', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(requestData)
                    }).then((response) => {
                        return response.json();
                    }).then((data) => {
                        console.log(data);
                        document.getElementById('recurringTransactionResult').innerHTML = prettyPrintObject(data);
                        document.querySelector('.recurringTransactionDiv').classList.remove('hidden');
                    }).catch((error) => {
                        console.error(error);
                    });
                });
            }).catch((error) => {
                console.error(error);
            });
        });
    } else {
        console.log("not recurring");
        document.getElementById('getBA').classList.add('hidden');
    }
});

let dropinComponent, cardComponent, paypalComponent;


async function startCheckout() {
    console.log('StartCheckout');

    document.querySelector('.componentsContainers').classList.remove('hidden');

    let paypalConfiguration = {
        configuration: {
            merchantId: paypalMerchantID,
            //Your Google Merchant ID as described in https://developers.google.com/pay/api/web/guides/test-and-deploy/deploy-production-environment#obtain-your-merchantID
            intent: "capture",
            style: { // Optional configuration for PayPal payment buttons.
                layout: "vertical",
                color: "blue"
            },
            cspNonce: "MY_CSP_NONCE",
            onShippingChange: function (data, actions) {
                // Listen to shipping changes.
            },
            onInit: (data, actions) => {
                // onInit is called when the button first renders.
            },
            onClick: () => {
                // onClick is called when the button is clicked.
            },
            blockPayPalCreditButton: true,
            blockPayPalPayLaterButton: true,
        }
    };

        // Add ECS configutation to paypalConfiguration
    // doc => https://docs.adyen.com/payment-methods/paypal/web-component/express-checkout/?tab=1#step-3-add-additional-paypal-configuration


    const ecsFlow = document.querySelector('#ecsFlow');

    if (ecsFlow.checked) {
        paypalConfiguration.issExpress = true;
        paypalConfiguration.onShopperDetails = (shopperDetails, rawData, actions) => {
            console.log("onShopperDetails");
            console.log(shopperDetails);
            console.log(rawData);
            actions.resolve();

            document.getElementById('shopperDetailsResponse').innerHTML = prettyPrintObject(shopperDetails);
            document.getElementById('rawData').innerHTML = prettyPrintObject(rawData);

        };
    }

    const configuration = {
        environment: 'test', // Change to 'live' for the live environment.
        clientKey: clientKey, // Public key used for client-side authentication: https://docs.adyen.com/development-resources/client-side-authentication
        showPayButton: true,
        session: {
            id: resultDecoded.id,
            sessionData: resultDecoded.sessionData
        },
        onPaymentCompleted: (result, component) => {
            console.info(result, component);
            document.querySelector('.responses').classList.remove('hidden');
            document.getElementById('sessionData').innerHTML = prettyPrintObject(resultDecoded);
            document.getElementById('responseContent').innerHTML = prettyPrintObject(result);
            document.querySelector('.baResults').classList.remove('hidden');
            console.log('test ok');
        },
        onError: (error, component) => {
            console.error(error.name, error.message, error.stack, component);
            console.log('KO');
        },
        // Any payment method specific configuration. Find the configuration specific to each payment method:  https://docs.adyen.com/payment-methods
        // For example, this is 3D Secure configuration for cards:
        paymentMethodsConfiguration: {
            card: {
                hasHolderName: true,
                holderNameRequired: false,
                billingAddressRequired: false
            }
        },
        paymentMethodsConfiguration: {
            paypal: paypalConfiguration
        }
    };

    const checkout = await AdyenCheckout(configuration);


    const showOnlyPayPal = document.querySelector('#showOnlyPayPal');

    dropinComponent = checkout.create('dropin').mount('#dropin-container');
    if (!showOnlyPayPal.checked) {
        cardComponent = checkout.create('card').mount('#card-container');
    }
    paypalComponent = checkout.create('paypal').mount('#paypal-container');
}


function resetAndStartCheckout() {
    console.log('resetAndStartCheckout');

    // Check if components are defined before attempting to unmount
    if (dropinComponent) {
        dropinComponent.unmount();
    }
    if (cardComponent) {
        cardComponent.unmount();
    }
    if (paypalComponent) {
        paypalComponent.unmount();
    }

    document.querySelector('.componentsContainers').classList.add('hidden');
    document.querySelector('.responses').classList.add('hidden');

    document.querySelector('.baResults').classList.add('hidden');
    document.querySelector('.recurringInfoDiv').classList.add('hidden');

    document.querySelector('.trxOnBAResults').classList.add('hidden');
    document.querySelector('.recurringTransactionDiv').classList.add('hidden');

    // Vider les conteneurs des composants
    const dropinContainer = document.getElementById('dropin-container');
    const cardContainer = document.getElementById('card-container');
    const paypalContainer = document.getElementById('paypal-container');

    dropinContainer.innerHTML = '';
    cardContainer.innerHTML = '';
    paypalContainer.innerHTML = '';

    startCheckout();
}


function toggleS2S() {
    console.log("toggleS2S");
    if (document.querySelector('#S2S').checked === true) {
        editor.set(jsonS2S);
        editor.expandAll();
    } else if (document.querySelector('#S2S').checked === false) {
        editor.set(json);
        editor.expandAll();
    }
}

function requestBA() {
    console.log("toggle request BA");
    if (document.querySelector('#requestBA').checked === true) {
        var temp = editor.get();
        temp.storePaymentMethod = true
        editor.set(temp);
        editor.expandAll();
    } else if (document.querySelector('#requestBA').checked === false) {
        var temp = editor.get();
        temp.storePaymentMethod = false
        editor.set(temp);
        editor.expandAll();
    }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////JSON EDITOR ELEMENT/////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const container = document.getElementById('jsoneditor');
const optionsEditor = {
    modes: ['text', 'tree', 'form', 'view'],
    mode: 'tree',
    "search": false
};
const editor = new JSONEditor(container, optionsEditor);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////Express Checkout Element////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Set your publishable key: remember to change this to your live publishable key in production
// See your keys here: https://dashboard.stripe.com/apikeys
const stripe = Stripe(pkey);

const options = {
    mode: 'payment',
    amount: 10000,
    currency: 'usd',
    // Customizable with appearance API.
    appearance: {
        /*...*/
    },
};

editor.set(options);

document.getElementById('getJSON').addEventListener('click', function () {

    // Set up Stripe.js and Elements to use in checkout form
    const elementsEC = stripe.elements(editor.get());

    const ECElementOptions = {
        layout: {
            type: 'accordion',
            defaultCollapsed: false,
            radios: true,
            spacedAccordionItems: false
        },
        paymentMethodOrder: ['card', 'paypal'],
    };

    // Create and mount the Express Checkout Element
    const expressCheckoutElement = elementsEC.create('expressCheckout', ECElementOptions);
    expressCheckoutElement.mount('#express-checkout-element');


    const handleError = (error) => {
        const messageContainer = document.querySelector('#error-message');
        messageContainer.textContent = error.message;
    }

    expressCheckoutElement.on('confirm', async (event) => {
        const {
            error: submitError
        } = await elementsEC.submit();
        if (submitError) {
            handleError(submitError);
            return;
        }

        console.log("options", options)

        // Submit the form and obtain the clientSecret
        const res = await fetch('/stripe/paymentIntent', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(editor.get())
        });

        const data = await res.json();
        const clientSecret = data.clientSecret;

        const {
            error
        } = await stripe.confirmPayment({
            // `elements` instance used to create the Express Checkout Element
            elements: elementsEC,
            // `clientSecret` from the created PaymentIntent
            clientSecret,
            confirmParams: {
                // return_url: 'https://integration.lugapi.fr/display-request-details'
                return_url: window.location.protocol + '//' + window.location.host + window.location.pathname
            }
        });

        if (error) {
            // Handle the error
            handleError(error);
        } else {
            // Payment succeeded, handle success
        }
    });
});

    (function () {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const clientSecret = urlParams.get('payment_intent_client_secret');

        if (clientSecret) {
            const checkPaymentStatusButton = document.querySelector('#checkPaymentStatus');
            const stripeResponseElement = document.getElementById('stripeResponse');
            const resultElement = document.querySelector('.result');

            checkPaymentStatusButton.classList.remove('hidden');
            checkPaymentStatusButton.addEventListener('click', async () => {
                const {
                    paymentIntent,
                    error
                } = await stripe.retrievePaymentIntent(clientSecret);

                if (error) {
                    // Gérer l'erreur
                    // } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                } else if (paymentIntent) {
                    // Traiter le paiement réussi
                    console.log(paymentIntent);
                    stripeResponseElement.innerHTML = prettyPrintObject(paymentIntent);
                    resultElement.classList.remove('hidden');
                }
            });
        }
    })();



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////TUNNEL////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// This is a public sample test API key.
// Don’t submit any personally identifiable information in requests made with this key.
// Sign in to see your own test API key embedded in code samples.


// The items the customer wants to buy
const items = [{
    id: "xl-tshirt"
}];

let elements;

initialize();
checkStatus();

document
    .querySelector("#payment-form")
    .addEventListener("submit", handleSubmit);

let emailAddress = '';
// Fetches a payment intent and captures the client secret
async function initialize() {
    const {
        clientSecret
    } = await fetch("/stripe/tunnel", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            items
        }),
    }).then((r) => r.json());

    elements = stripe.elements({
        clientSecret
    });

    const linkAuthenticationElement = elements.create("linkAuthentication");
    linkAuthenticationElement.mount("#link-authentication-element");

    const paymentElementOptions = {
        //layout: "tabs",
        layout: {
            type: 'accordion',
            defaultCollapsed: false,
            radios: true,
            spacedAccordionItems: false
        },
        paymentMethodOrder: ['card', 'paypal'],
    };

    const paymentElement = elements.create("payment", paymentElementOptions);
    paymentElement.mount("#payment-element");
}

async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const {
        error
    } = await stripe.confirmPayment({
        elements,
        confirmParams: {
            // Make sure to change this to your payment completion page
            // return_url: "{{route('requestDetails')}}",
            // return_url: "{{route('psp.stripe')}}",
            return_url: "https://integration.lugapi.fr/display-request-details",
            receipt_email: emailAddress,
        },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === "card_error" || error.type === "validation_error") {
        showMessage(error.message);
    } else {
        showMessage("An unexpected error occurred.");
    }

    setLoading(false);
}

// Fetches the payment intent status after payment submission
async function checkStatus() {
    const clientSecret = new URLSearchParams(window.location.search).get(
        "payment_intent_client_secret"
    );

    if (!clientSecret) {
        return;
    }

    const {
        paymentIntent
    } = await stripe.retrievePaymentIntent(clientSecret);

    switch (paymentIntent.status) {
        case "succeeded":
            showMessage("Payment succeeded!");
            break;
        case "processing":
            showMessage("Your payment is processing.");
            break;
        case "requires_payment_method":
            showMessage("Your payment was not successful, please try again.");
            break;
        default:
            showMessage("Something went wrong.");
            break;
    }
}

// ------- UI helpers -------

function showMessage(messageText) {
    const messageContainer = document.querySelector("#payment-message");

    messageContainer.classList.remove("hidden");
    messageContainer.textContent = messageText;

    setTimeout(function () {
        messageContainer.classList.add("hidden");
        messageContainer.textContent = "";
    }, 4000);
}

// Show a spinner on payment submission
function setLoading(isLoading) {
    if (isLoading) {
        // Disable the button and show a spinner
        document.querySelector("#submit").disabled = true;
        document.querySelector("#spinner").classList.remove("hidden");
        document.querySelector("#button-text").classList.add("hidden");
    } else {
        document.querySelector("#submit").disabled = false;
        document.querySelector("#spinner").classList.add("hidden");
        document.querySelector("#button-text").classList.remove("hidden");
    }
}
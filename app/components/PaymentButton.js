import { usePaymentSheet, StripeProvider } from '@stripe/stripe-react-native';
import { useContext, useEffect, useState } from 'react';
import { TouchableOpacity, ActivityIndicator } from 'react-native';
import { StateContext } from "../state_context";

export default function PaymentButton({ style, onPressEvent, text, paymentParams }) {
    const { initPaymentSheet, presentPaymentSheet, loading } = usePaymentSheet();
    const { credentials, setError } = useContext(StateContext);

    const [ready, setReady] = useState(false)

    useEffect(() => {
        initializePayment();
    }, [paymentParams]);

    const initializePayment = async () => {
        if (paymentParams !== null && paymentParams !== undefined) {
            const { error } = await initPaymentSheet({
                merchantDisplayName: "Continuity Browser",
                customerId: paymentParams?.customer,
                customerEphemeralKeySecret: paymentParams?.ephemeralKey,
                paymentIntentClientSecret: paymentParams?.paymentIntent,
                // Set `allowsDelayedPaymentMethods` to true if your business can handle payment
                //methods that complete payment after a delay, like SEPA Debit and Sofort.
                allowsDelayedPaymentMethods: true,
                defaultBillingDetails: {
                    name: credentials?.user_id,
                }
            });

            if (error) {
                setError({ message: `Error Code: ${error?.code}\n\n${error?.message}`, type: "error", displayPages: new Set(["Ultra Search"]) });
            }
            else {
                setReady(true);
            }
        }
    }

    // useEffect(() => {
    //     const {
    //         paymentIntent,
    //         ephemeralKey,
    //         customer,
    //         publishableKey,
    //     } = data?.message;

    //     const { error } = await initPaymentSheet({
    //         merchantDisplayName: "Continuity Browser",
    //         customerId: customer,
    //         customerEphemeralKeySecret: ephemeralKey,
    //         paymentIntentClientSecret: paymentIntent,
    //         // Set `allowsDelayedPaymentMethods` to true if your business can handle payment
    //         //methods that complete payment after a delay, like SEPA Debit and Sofort.
    //         allowsDelayedPaymentMethods: true,
    //         defaultBillingDetails: {
    //             name: credentials?.user_id,
    //         }
    //     });

    //     if (!error) {
    //         await openPaymentSheet(paymentIntent);
    //     }
    // }, []);

    const onPurchase = async () => {
        const { error } = await presentPaymentSheet();

        if (error) {
            setError({ message: `Error Code: ${error?.code}\n\n${error?.message}`, type: "error", displayPages: new Set(["Ultra Search"]) });
        }
        else {
            setReady(true);
            // onPressEvent();
        }
    }

    const showLoader = loading || !ready;
    return (
        <StripeProvider
            publishableKey={paymentParams?.publishableKey}
            urlScheme="https://continuitybrowser.com/"
            merchantIdentifier="merchant.com.continuity"
        >
            <TouchableOpacity
                style={style}
                onPress={onPurchase}
                underlayColor='#fff'
                disabled={showLoader}
            >
                {showLoader && (
                    <ActivityIndicator color={'rgba(229, 229, 234, 1)'} />
                )}
                {text}
            </TouchableOpacity>
        </StripeProvider>
    )
}
import { Component } from "react";
import {
    ScrollView,
    Text,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    View,
    TouchableOpacity,
    Alert,
} from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { StateContext } from "./state_context";
import { throttle } from 'lodash';
import * as Haptics from 'expo-haptics';
import UnifiedError from "./components/UnifiedError";
import * as Localization from 'expo-localization';
import PaymentButton from "./components/PaymentButton";


const styles = StyleSheet.create({
    root: {
        flex: 1,
        justifyContent: 'center',
        display: 'flex',
    },

    scrollContainer: {
        flex: 1,
        paddingHorizontal: 10,
    },

    text_style: {
        padding: 10,
    },

    heading: {
        textAlign: "center",
        fontWeight: 'bold',
        fontSize: 30,
        padding: 10,
    },

    upgradeBtn: {
        marginRight: 40,
        marginLeft: 40,
        marginVertical: 15,
        padding: 10,
        alignItems: "center",
        borderRadius: 10,
        flexDirection: "row",
        justifyContent: "center",
    },

    upgradeText: {
        color: '#fff',
        textAlign: 'center',
        paddingHorizontal: 10,
        fontSize: 20,
        fontWeight: 'bold'
    },

    unenrollBtn: {
        marginRight: 40,
        marginLeft: 40,
        marginVertical: 15,
        paddingTop: 10,
        paddingBottom: 10,
        borderWidth: 1,
        borderRadius: 10,
    },

    unenrollText: {
        color: '#fff',
        textAlign: 'center',
        paddingLeft: 10,
        paddingRight: 10,
        fontSize: 15,
    }
});


class UltraSearch extends Component {
    static contextType = StateContext;
    constructor(props) {
        super(props);

        this.state = {
            sub_time: 'monthly',
            payment_params: null
        }
    }

    componentDidMount = () => {
        this?.context?.socket.on("enroll_feature", (data) => {
            if (data?.successful === true) {
                this.onNavPop();
                this?.context?.setCredentials(data?.message);
            }
            else {
                this?.context?.setError({ message: data?.message, type: data?.type, displayPages: new Set(["Ultra Search", "Settings"]) });
            }
        })

        this?.context?.socket.on("payment", (data) => {
            if (data?.successful === true) {
                this.setState({ payment_params: data?.message })
            }
            else {
                this?.context?.setError({ message: data?.message, type: data?.type, displayPages: new Set(["Ultra Search", "Settings"]) });
            }
        });


        this?.context?.socket.emit('payment', {
            user_id: this?.context?.credentials?.user_id,
            device_name: this?.context?.credentials?.device_name,
            device_token: this?.context?.credentials?.device_token,
            currency: Localization?.currency ?? 'USD',
            bundle: `essentials_${this.state.sub_time}`
        })
    }

    onNavPop = throttle(() => {
        const redirectScreen = this.props?.route?.params?.redirectScreen;
        if (redirectScreen === undefined || redirectScreen === null) {
            if (this.props?.navigation.canGoBack()) {
                this.props?.navigation.goBack();
            }
        }
        else {
            this.props?.navigation?.navigate(redirectScreen);
        }
    }, 500, { trailing: false });


    upgradeHelper = () => {
        this?.context?.socket.emit('enroll_feature', {
            user_id: this?.context?.credentials?.user_id,
            device_name: this?.context?.credentials?.device_name,
            device_token: this?.context?.credentials?.device_token,
            feature_name: "ultra_search",
            is_enrolled: this?.context?.credentials?.enrolled_features?.ultra_search?.enrolled
        })
    }

    upgradeUltraSearch = () => {
        if (this?.context?.credentials?.enrolled_features?.ultra_search?.enrolled === true) {
            Alert.alert(
                "Are you sure you wish to unenroll?",
                "Ultra Search ensures that you have the best search experience possible. If you unenroll, you will lose access to these benefits. If you have any feedback or concerns, please consider visiting our report page.",
                [
                    {
                        text: "Stay Enrolled",
                        onPress: () => { }
                    },
                    {
                        text: "Unenroll",
                        onPress: this.upgradeHelper
                    },
                    {
                        text: "Report",
                        onPress: () => this.props?.navigation.navigate('Report')
                    }
                ]
            )
        }
        else {
            this.upgradeHelper();
        }
    }


    render() {
        return (
            <SafeAreaView style={[styles.root, { backgroundColor: (this?.context?.colorScheme === 'dark') ? 'rgba(28, 28, 30, 1)' : 'rgba(242, 242, 247, 1)' }]}>
                <ScrollView style={styles.scrollContainer}>
                    <Text style={[styles.heading, { color: this?.context?.colorScheme === 'dark' ? '#fff' : '#000' }]}>Ultra Search</Text>
                    <View style={{ alignItems: 'center' }}>
                        <MaterialCommunityIcons name="lightning-bolt" style={{ marginRight: 15, fontSize: 25 }} color="rgba(255, 149, 0, 1)" />
                    </View>

                    {(this?.context?.credentials?.enrolled_features?.ultra_search?.enrolled === false) &&
                        (
                            <PaymentButton
                                style={[styles.upgradeBtn, { backgroundColor: this.state.payment_params ? 'rgba(255, 149, 0, 1)' : 'rgba(255, 149, 0, 0.7)' }]}
                                onPressEvent={this.upgradeUltraSearch}
                                paymentParams={this.state.payment_params}
                                text={
                                    <Text style={styles.upgradeText}>Upgrade to Essentials Bundle</Text>
                                }
                            />
                        )
                    }

                    <UnifiedError currentPage={this.props?.route?.name} />

                    <Text style={[styles.text_style, { color: this?.context?.colorScheme === 'dark' ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)', }]}>
                        Are you tired of sifting through irrelevant search results and worrying about online safety? Ultra Search is here to change the way you search the web.
                    </Text>
                    <Text style={[styles.text_style, { color: this?.context?.colorScheme === 'dark' ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)', }]}>
                        Our advanced AI technology uses OpenAI's API to provide quick and accurate suggestions to your queries, custom tailored to your specific needs. And for the first time ever, Ultra Search is seamlessly integrated into your web browser, making it a powerful tool for all of your online searches.
                    </Text>
                    <Text style={[styles.text_style, { color: this?.context?.colorScheme === 'dark' ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)', }]}>
                        But that's not all - Ultra Search also ensures that the content you see is safe and appropriate for all users, and your privacy is always protected as we never share your information with third parties or with Continuity.
                    </Text>
                    <Text style={[styles.text_style, { color: this?.context?.colorScheme === 'dark' ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)', }]}>
                        Upgrade your search game for just $4.99 per month - that's even less than the cost of a cup of coffee! Don't miss out on this opportunity to improve your online search experience with Ultra Search. Try it out today and see the difference for yourself.
                    </Text>

                    {(this?.context?.credentials?.enrolled_features?.ultra_search?.enrolled !== false) &&
                        (
                            <TouchableOpacity
                                style={[styles.unenrollBtn, { borderColor: this?.context?.colorScheme === 'dark' ? 'rgba(255, 55, 95, 1)' : 'rgba(255, 45, 85, 1)' }]}
                                onPress={this.upgradeUltraSearch}
                                underlayColor='#fff'>
                                <Text style={[styles.unenrollText, { color: this?.context?.colorScheme === 'dark' ? 'rgba(255, 55, 95, 1)' : 'rgba(255, 45, 85, 1)' }]}>Unenroll</Text>
                            </TouchableOpacity>
                        )
                    }
                    <View style={{ marginVertical: 20 }} />
                </ScrollView>
            </SafeAreaView>
        )
    }
}


export default UltraSearch;
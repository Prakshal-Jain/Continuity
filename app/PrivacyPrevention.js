import { Component } from "react";
import {
    ScrollView,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    View,
    TouchableOpacity,
    Alert,
} from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { StateContext } from "./state_context";
import { throttle } from 'lodash';
import * as Haptics from 'expo-haptics';
import UnifiedError from "./components/UnifiedError";


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
        paddingVertical: 10,
        backgroundColor: 'rgba(40, 205, 65, 1)',
        borderRadius: 10,
    },

    upgradeText: {
        color: '#000',
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


class PrivacyPrevention extends Component {
    static contextType = StateContext;
    constructor(props) {
        super(props);
    }

    componentDidMount = () => {
        this?.context?.socket.on("enroll_feature", (data) => {
            if (data?.successful === true) {
                this.onNavPop();
                this?.context?.setCredentials(data?.message);
                this?.context?.setError(null);
            }
            else {
                this?.context?.setError({ message: data?.message, type: data?.type, displayPages: new Set(["Privacy Prevention", "Settings"]) });
            }
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
            feature_name: "privacy_prevention",
            is_enrolled: this?.context?.credentials?.enrolled_features?.privacy_prevention?.enrolled
        })
    }

    upgradePrivacyPrevention = () => {
        if (this?.context?.button_haptics !== 'none') {
            Haptics.impactAsync(this?.context?.button_haptics);
        }

        if (this?.context?.credentials?.enrolled_features?.privacy_prevention?.enrolled === true) {
            Alert.alert(
                "Are you sure you wish to unenroll?",
                "Intelligent Privacy Prevention stops trackers from accessing your personal and sensitive information for a secure browsing experience.",
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
                    <Text style={[styles.heading, { color: this?.context?.colorScheme === 'dark' ? '#fff' : '#000' }]}>Intelligent Privacy Prevention</Text>
                    <View style={{ alignItems: 'center' }}>
                        <MaterialCommunityIcons name="lock-check" style={{ marginRight: 15, fontSize: 25 }} color="rgba(40, 205, 65, 1)" />
                    </View>

                    {(this?.context?.credentials?.enrolled_features?.privacy_prevention?.enrolled === false) &&
                        (
                            <TouchableOpacity
                                style={styles.upgradeBtn}
                                onPress={this.upgradePrivacyPrevention}
                                underlayColor='#fff'>
                                <Text style={styles.upgradeText}>Upgrade to Intelligent Privacy Prevention</Text>
                            </TouchableOpacity>
                        )
                    }

                    <UnifiedError currentPage={this.props?.route?.name} />

                    <Text style={[styles.text_style, { color: this?.context?.colorScheme === 'dark' ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)', }]}>
                        As technology has advanced, the ability to track user behavior across websites for advertising purposes has become increasingly prevalent. This tracking can be observed when users see ads for products they have viewed online appearing on other websites. Unfortunately, many websites contain a significant number of trackers from different companies on a single page, making it difficult for users to maintain their privacy.
                    </Text>
                    <Text style={[styles.text_style, { color: this?.context?.colorScheme === 'dark' ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)', }]}>
                        To address this issue, Continuity has been designed with user privacy as a top priority. Our commitment to privacy is rooted in the belief that it is a fundamental human right. To uphold this value, we have introduced several key privacy features such as the Intelligent Privacy Report and Intelligent Privacy Prevention.
                    </Text>
                    <Text style={[styles.text_style, { color: this?.context?.colorScheme === 'dark' ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)', }]}>
                        Our Intelligent Privacy Reports, which can be accessed on your Profile page, provide detailed information about the trackers that have attempted to access your personal and sensitive information. Additionally, our Intelligent Privacy Prevention feature allows you to prevent these trackers from accessing your information by blocking network requests from known and blacklisted trackers. This not only protects your sensitive information, but it also minimizes the amount of data passed to third parties such as search engines.
                    </Text>
                    <Text style={[styles.text_style, { color: this?.context?.colorScheme === 'dark' ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)', }]}>
                        Upgrade to Continuity now and ensure that your sensitive information, such as credit card details, passwords, and browsing history, remains private by simply clicking the button below. Browse with peace of mind knowing that your privacy is protected with Continuity.
                    </Text>

                    {(this?.context?.credentials?.enrolled_features?.privacy_prevention?.enrolled !== false) &&
                        (
                            <TouchableOpacity
                                style={[styles.unenrollBtn, { borderColor: this?.context?.colorScheme === 'dark' ? 'rgba(255, 55, 95, 1)' : 'rgba(255, 45, 85, 1)' }]}
                                onPress={this.upgradePrivacyPrevention}
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


export default PrivacyPrevention;
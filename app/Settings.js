import { useContext, useEffect } from "react";
import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    ScrollView,
    StatusBar,
    TouchableOpacity,
    Switch,
    Pressable,
    useColorScheme,
} from "react-native";
import React from "react";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { StateContext } from "./state_context";
import AlertMessage from "./components/AlertMessage";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import storage from "./utilities/storage";
import * as Haptics from 'expo-haptics';
import UnifiedError from "./components/UnifiedError";

function Settings({ navigation, route }) {
    const { colorScheme, setColorScheme, credentials, socket, setCredentials, button_haptics, setButtonHaptics, setError } = useContext(StateContext);

    const { action_message, feature_name, icon_type } = route?.params ?? { action_message: undefined, feature_name: undefined };

    const color_scheme = useColorScheme();

    useEffect(() => {
        socket.on("switch_feature", (data) => {
            if (data?.successful) {
                setCredentials(data?.message);
                setError(null);
            }
            else {
                setError({ message: data?.message, type: data?.type, displayPages: new Set(["Settings"]) });
            }
        })
    }, [])

    const Tiles = ({ icon, title, description, actionComponent, moreInfoComponent }) => {
        const tileStyle = StyleSheet.create({
            container: {
                backgroundColor: (colorScheme === 'dark') ? 'rgba(58, 58, 60, 1)' : 'rgba(209, 209, 214, 1)',
                width: '100%',
                borderRadius: 10,
                padding: 15,
                borderWidth: (feature_name === title) ? 2 : undefined,
                borderColor: (feature_name === title) ? ((colorScheme === 'dark') ? 'rgba(255, 214, 10, 1)' : 'rgba(255, 149, 0, 1)') : undefined,
                marginVertical: 15,
            },

            tileContainer: {
                flexDirection: "row",
                alignItems: "center",
            },

            title: {
                color: (colorScheme === 'dark') ? '#fff' : '#000',
                fontSize: 20,
                flex: 1,
                fontWeight: "bold",
            },

            description: {
                color: colorScheme === 'dark' ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)',
                marginTop: 5
            }
        });

        return (
            <View style={tileStyle.container}>
                <View style={tileStyle.tileContainer}>
                    {icon}
                    <View style={{ flex: 1, paddingHorizontal: 15 }}>
                        <Text style={tileStyle.title}>{title}</Text>
                        {description && (
                            <Text style={tileStyle.description}>{description}</Text>
                        )}
                    </View>
                    {actionComponent}
                </View>
                {(moreInfoComponent !== null && moreInfoComponent !== undefined) && (
                    <View>
                        <View
                            style={{
                                borderBottomColor: 'rgba(142, 142, 147, 1)',
                                borderBottomWidth: StyleSheet.hairlineWidth,
                                marginVertical: 15
                            }}
                        />
                        {moreInfoComponent}
                    </View>
                )}
            </View>
        )
    }




    const styles = StyleSheet.create({
        root: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            display: 'flex',
            backgroundColor: (colorScheme === 'dark') ? 'rgba(28, 28, 30, 1)' : 'rgba(242, 242, 247, 1)',
        },

        scrollContainer: {
            flex: 1,
            width: '100%',
            padding: 20,
        },

        upgradeBtn: {
            padding: 10,
            borderRadius: 10,
        },

        upgradeText: {
            textAlign: 'center',
            fontSize: 15,
            fontWeight: 'bold'
        },

        option_container: {
            padding: 5,
            flex: 1,
            marginVertical: 5,
            marginHorizontal: 10,
            borderWidth: 1,
            borderColor: colorScheme === 'dark' ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)',
            borderRadius: 10
        },

        link: {
            color: 'rgba(0, 122, 255, 1)',
            fontSize: 15,
        },
    })


    const UltraSearchActionComponent = () => {

        if (credentials?.enrolled_features?.ultra_search?.enrolled === false) {
            return (
                <TouchableOpacity
                    style={[styles.upgradeBtn, { backgroundColor: 'rgba(255, 149, 0, 1)' }]}
                    onPress={() => navigation.navigate('Ultra Search', { redirectScreen: 'Settings' })}
                    underlayColor='#fff'>
                    <Text style={[styles.upgradeText, { color: '#fff' }]}>Upgrade</Text>
                </TouchableOpacity>
            )
        }

        else {
            const toggleSwitch = () => {
                socket.emit('switch_feature', { user_id: credentials?.user_id, device_name: credentials?.device_name, device_token: credentials?.device_token, feature_name: "ultra_search", switch: (!credentials?.enrolled_features?.ultra_search?.switch) });
            }

            return (
                <Switch
                    onValueChange={toggleSwitch}
                    value={credentials?.enrolled_features?.ultra_search?.switch}
                    disabled={(credentials?.enrolled_features?.ultra_search?.enrolled === false)}
                />
            )
        }
    }


    const PrivacyPreventionActionComponent = () => {
        if (credentials?.enrolled_features?.privacy_prevention?.enrolled === false) {
            return (
                <TouchableOpacity
                    style={[styles.upgradeBtn, { backgroundColor: 'rgba(40, 205, 65, 1)' }]}
                    onPress={() => navigation.navigate('Privacy Prevention', { redirectScreen: 'Settings' })}
                    underlayColor='#fff'>
                    <Text style={[styles.upgradeText, { color: '#000' }]}>Upgrade</Text>
                </TouchableOpacity>
            )
        }

        else {
            const toggleSwitch = () => {
                socket.emit('switch_feature', { user_id: credentials?.user_id, device_name: credentials?.device_name, device_token: credentials?.device_token, feature_name: "privacy_prevention", switch: (!credentials?.enrolled_features?.privacy_prevention?.switch) });
            }

            return (
                <Switch
                    onValueChange={toggleSwitch}
                    value={credentials?.enrolled_features?.privacy_prevention?.switch}
                    disabled={(credentials?.enrolled_features?.privacy_prevention?.enrolled === false)}
                />
            )
        }
    }


    const SwitchColorScheme = () => (
        <View style={{ padding: 10, flexDirection: 'row', alignItems: "center", justifyContent: "center" }}>
            <FontAwesome5 name="moon" size={18} color={colorScheme === 'dark' ? '#fff' : '#000'} />
            <Switch
                onValueChange={async () => {
                    const scheme = (colorScheme === 'dark') ? 'light' : 'dark';
                    setColorScheme(scheme);
                    await storage.set('color_scheme', scheme);
                }}
                style={{ marginHorizontal: 10 }}
                value={colorScheme === 'light'}
            />
            <FontAwesome5 name="sun" size={20} color='rgba(255, 149, 0, 1)' />
        </View>
    )


    return (
        <SafeAreaView style={styles.root}>
            <ScrollView style={styles.scrollContainer}>
                {(action_message !== undefined && action_message !== null) && (
                    <View style={{ marginBottom: 15 }}>
                        <AlertMessage type={icon_type} message={action_message} />
                    </View>
                )}

                <UnifiedError currentPage={route?.name} />

                <Tiles
                    title="Ultra Search"
                    description="Ultra Search uses advanced AI to generate the most accurate and custom tailored results."
                    icon={<MaterialCommunityIcons
                        name="lightning-bolt"
                        style={{ fontSize: 25 }}
                        color="rgba(255, 149, 0, 1)" />}
                    moreInfoComponent={<Text onPress={() => navigation.navigate('Ultra Search', { redirectScreen: 'Settings' })} style={styles.link}>Learn more</Text>}
                    actionComponent={<UltraSearchActionComponent />}
                />

                <Tiles
                    title="Intelligent Privacy Prevention"
                    description="Prevents trackers from accessing your personal and sensitive information for a secure browsing experience."
                    icon={<MaterialCommunityIcons
                        name="lock-check"
                        style={{ fontSize: 25 }}
                        color='rgba(40, 205, 65, 1)' />}
                    moreInfoComponent={<Text onPress={() => navigation.navigate('Privacy Prevention', { redirectScreen: 'Settings' })} style={styles.link}>Learn more</Text>}
                    actionComponent={<PrivacyPreventionActionComponent />}
                />


                <Tiles
                    title="Appearance"
                    description="Switch to toggle between dark and light themes."
                    icon={<MaterialCommunityIcons
                        name="theme-light-dark"
                        style={{ fontSize: 25 }}
                        color="rgba(255, 149, 0, 1)" />}
                    moreInfoComponent={
                        <Text
                            onPress={async () => {
                                setColorScheme(color_scheme);
                                await storage.remove('color_scheme');
                            }}
                            style={styles.link}>
                            Set automatically
                        </Text>
                    }
                    actionComponent={<SwitchColorScheme />}
                />

                <Tiles
                    title="Haptic Feedback"
                    description="Switch to enable or disable haptic feedback."
                    icon={<MaterialCommunityIcons
                        name="vibrate"
                        style={{ fontSize: 25 }}
                        color="rgba(255, 45, 85, 1)" />}
                    actionComponent={
                        <Switch
                            onValueChange={async () => {
                                const haptics = (button_haptics === Haptics.ImpactFeedbackStyle.Medium) ? 'none' : Haptics.ImpactFeedbackStyle.Medium;
                                setButtonHaptics(haptics);
                                await storage.set('button_haptics', haptics);
                            }}

                            style={{ marginHorizontal: 10 }}
                            value={button_haptics === Haptics.ImpactFeedbackStyle.Medium}
                        />
                    }
                />

                {/* Adds spacing at the bottom */}
                <View style={{ marginVertical: 20 }} />
            </ScrollView>
        </SafeAreaView>
    )
}

export default React.memo(Settings);
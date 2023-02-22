import React, { useContext, useEffect, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Image,
    TouchableOpacity,
    Alert,
} from "react-native";
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import storage from "./utilities/storage";
import { StateContext } from "./state_context";
import PieChart from "./components/PieChart";
import randomColor from "randomcolor";
import Loader from "./components/Loader";
import userIcon from "./assets/user.png";
import * as Haptics from 'expo-haptics';
import UnifiedError from "./components/UnifiedError";

export default function ({ navigation, route, ...props }) {
    const { socket, colorScheme, credentials, setDevices, setCurrentDeviceName, setCredentials, devices, button_haptics, setError, setLoginCurrStep } = useContext(StateContext);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [trackerCounts, setTrackerCounts] = useState(null);
    const [trackers, setTrackers] = useState(null);
    const [websites, setWebsites] = useState(null);

    const deleteAllData = async () => {
        await storage.clearAll();
        setDevices([]);
        setCurrentDeviceName(null);
        setCredentials(null);
        setLoginCurrStep(1);
        await storage.set("is_show_tutorial", true);
        navigation.navigate('Login');
    }


    useEffect(() => {
        socket.on("privacy_report", (data) => {
            if (data?.successful === true) {
                setTrackerCounts(data?.message?.tracker_counts);
                setTrackers(data?.message?.trackers);
                setWebsites(data?.message?.websites);
                setError(null);
            }
            else {
                setError({ message: data?.message, type: data?.type, displayPages: new Set(["Profile"]) });
            }
        })


        socket.on("logout", (data) => {
            if (data?.successful === true) {
                deleteAllData();
                setError(null);
            }
            else {
                setError({ message: data?.message, type: data?.type, displayPages: new Set(["Profile"]) });
            }
        });

        socket.on("delete_user", (data) => {
            if (data?.successful === true) {
                deleteAllData();
                setError(null);

            }
            else {
                setError({ message: data?.message, type: data?.type, displayPages: new Set(["Profile"]) });
            }
        });



        getDevicePrivacyReport(credentials?.device_name);
    }, [])

    const getDevicePrivacyReport = (id) => {
        setTrackerCounts(null);
        setTrackers(null);
        setWebsites(null);
        setSelectedDevice(id);
        socket.emit("privacy_report", { user_id: credentials?.user_id, device_name: credentials?.device_name, device_token: credentials?.device_token });
    }

    const styles = StyleSheet.create({
        root: {
            flex: 1,
            justifyContent: 'center',
            display: 'flex',
            backgroundColor: (colorScheme === 'dark') ? 'rgba(28, 28, 30, 1)' : 'rgba(242, 242, 247, 1)',
            padding: 10,
        },

        scrollContainer: {
            flex: 1,
            padding: 10,
        },

        container: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 20,
            paddingHorizontal: 10,
        },
        picture: {
            width: 80,
            height: 80,
            borderRadius: 40,
            marginRight: 20,
            borderWidth: 1,
            borderColor: colorScheme === 'dark' ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)',
        },
        infoContainer: {
            flex: 1,
        },
        name: {
            color: colorScheme === 'dark' ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)',
            fontSize: 20,
            fontWeight: 'bold',
        },
        email: {
            color: colorScheme === 'dark' ? 'rgba(174, 174, 178, 1)' : 'rgba(99, 99, 102, 1)',
            fontSize: 16,
        },
        logoutButton: {
            marginRight: 40,
            marginLeft: 40,
            marginVertical: 10,
            paddingTop: 10,
            paddingBottom: 10,
            paddingHorizontal: 15,
            borderWidth: 1,
            borderColor: colorScheme === 'dark' ? 'rgba(255, 55, 95, 1)' : 'rgba(255, 45, 85, 1)',
            borderRadius: 10,
            alignSelf: 'center'
        },
        logoutText: {
            color: colorScheme === 'dark' ? 'rgba(255, 55, 95, 1)' : 'rgba(255, 45, 85, 1)',
            textAlign: 'center',
            paddingLeft: 10,
            paddingRight: 10,
        },

        privacyReportContainer: {
            marginVertical: 20,
            backgroundColor: colorScheme === 'dark' ? 'rgba(58, 58, 60, 1)' : 'rgba(209, 209, 214, 1)',
            borderRadius: 10,
            padding: 15,
            width: '100%'
        },

        heading: {
            fontWeight: 'bold',
            fontSize: 25,
            color: colorScheme === 'dark' ? '#fff' : '#000',
            flex: 1,
            textAlign: "center"
        },

        piechartContainer: {
            padding: 20,
        },

        websitesHeading: {
            fontSize: 20,
            textAlign: "center",
            fontWeight: "bold",
            marginTop: 25,
            marginBottom: 8,
            color: colorScheme === 'dark' ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)'
        },

        smallText: {
            color: colorScheme === 'dark' ? 'rgba(174, 174, 178, 1)' : 'rgba(99, 99, 102, 1)',
            marginBottom: 10,
            textAlign: "center"
        },

        websiteContainer: {
            borderWidth: 1,
            padding: 15,
            marginVertical: 15,
            borderRadius: 10,
            backgroundColor: (colorScheme === 'dark') ? 'rgba(28, 28, 30, 1)' : 'rgba(242, 242, 247, 1)',
            flexDirection: "row",
            alignItems: 'center',
            justifyContent: "center"
        },

        websiteName: {
            color: colorScheme === 'dark' ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)',
            marginBottom: 10
        },

        trackerCountStyle: {
            color: colorScheme === 'dark' ? 'rgba(174, 174, 178, 1)' : 'rgba(99, 99, 102, 1)',
        },

        websiteColorCode: {
            height: 20,
            width: 20,
            borderRadius: 10,
            marginRight: 15,
        },

        privacyUpgradeBtn: {
            marginRight: 40,
            marginLeft: 40,
            marginBottom: 10,
            padding: 10,
            backgroundColor: 'rgba(40, 205, 65, 1)',
            borderRadius: 10,
            alignItems: "center",
            alignSelf: 'center'
        },

        privacyUpgradeText: {
            color: '#000',
            textAlign: 'center',
            paddingHorizontal: 10,
            fontSize: 16,
            fontWeight: 'bold'
        },
    })

    const onLogout = () => {
        if (button_haptics !== 'none') {
            Haptics.impactAsync(button_haptics);
        }

        Alert.alert(
            "Are you sure you wish to Sign Out?",
            null,
            [
                {
                    text: "Stay Signed In",
                    onPress: () => { }
                },
                {
                    text: "Sign Out",
                    onPress: () => { socket.emit("logout", { user_id: credentials?.user_id, device_name: credentials?.device_name, device_token: credentials?.device_token }); }
                },
            ]
        )
    }

    const onDeleteUser = () => {
        if (button_haptics !== 'none') {
            Haptics.impactAsync(button_haptics);
        }

        Alert.alert(
            "Are you sure you wish to delete your account?",
            null,
            [
                {
                    text: "No",
                    onPress: () => { }
                },
                {
                    text: "Yes",
                    onPress: () => {
                        socket.emit("delete_user", { user_id: credentials?.user_id, device_token: credentials?.device_token, device_name: credentials?.device_name });
                    }
                },
            ]
        )
    }

    const TrackerList = () => (
        websites?.map((x, i) => (
            <TouchableOpacity style={[styles.websiteContainer, { borderColor: (colorScheme === 'dark') ? colors_dark[i] : colors_light[i] }]} key={`website_${i}`} onPress={() => navigation.navigate('Trackers Contacted', { website: x, tracker: trackers[i], count: trackerCounts[i], color: (colorScheme === 'dark') ? colors_dark[i] : colors_light[i] })}>
                <View style={[styles.websiteColorCode, { backgroundColor: (colorScheme === 'dark') ? colors_dark[i] : colors_light[i] }]}></View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.websiteName}>{x}</Text>
                    <Text style={styles.trackerCountStyle}><Text style={{ fontWeight: "bold" }}>{trackerCounts[i]}</Text> Trackers Contacted</Text>
                </View>
                <FontAwesome name="angle-right" size={25} color={(colorScheme === 'dark') ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)'} style={{ marginLeft: 10 }} />
            </TouchableOpacity>
        ))
    )

    const colors_light = ['rgb(255, 59, 48)', 'rgb(245, 59, 173)', 'rgb(255, 149, 0)', 'rgb(255, 204, 0)', 'rgb(175, 82, 222)', 'rgb(88, 86, 214)', "rgb(52, 199, 89)", "rgb(50, 173, 230)", "rgb(0, 122, 255)", "rgb(162, 132, 94)"];
    const colors_dark = ['rgb(255, 69, 58)', 'rgb(245, 73, 178)', 'rgb(255, 159, 10)', 'rgb(255, 214, 10)', 'rgb(191, 90, 242)', 'rgb(94, 92, 230)', "rgb(48, 209, 88)", "rgb(100, 210, 255)", "rgb(10, 132, 255)", "rgb(172, 142, 104)"];

    const pieData = trackerCounts
        ?.map((value, index) => ({
            value,
            svg: {
                fill: (colorScheme === 'dark') ? colors_dark[index] : colors_light[index],
                onPress: () => navigation.navigate('Trackers Contacted', { website: websites[index], tracker: trackers[index], count: value, color: (colorScheme === 'dark') ? colors_dark[index] : colors_light[index] })
            },
            key: `pie-${index}`,
        }))


    return (
        <SafeAreaView style={styles.root}>

            <ScrollView style={styles.scrollContainer}>
                <View style={styles.container}>
                    <Image
                        style={styles.picture}
                        source={{ uri: credentials?.picture }}
                        defaultSource={userIcon}
                    />
                    <View style={styles.infoContainer}>
                        <Text style={styles.name}>Email</Text>
                        <Text style={styles.email}>{credentials?.user_id}</Text>
                    </View>
                </View>

                <View
                    style={{
                        borderBottomColor: '#a9a9a9',
                        borderBottomWidth: StyleSheet.hairlineWidth,
                    }}
                />

                <View style={styles.container}>
                    <FontAwesome name={credentials?.device_type} size={50} color={(colorScheme === 'dark') ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)'} style={{ marginRight: 20 }} />
                    <View style={styles.infoContainer}>
                        <Text style={styles.name}>Device Name</Text>
                        <Text style={styles.email}>{credentials?.device_name}</Text>
                    </View>
                </View>

                <View
                    style={{
                        borderBottomColor: '#a9a9a9',
                        borderBottomWidth: StyleSheet.hairlineWidth,
                    }}
                />

                <UnifiedError currentPage={route?.name} />

                <View style={styles.privacyReportContainer}>
                    <Text style={styles.heading}>Intelligent Privacy Report</Text>
                    {(!credentials?.enrolled_features?.privacy_prevention?.enrolled) ?
                        (
                            <>
                                <Text style={[styles.smallText, { marginTop: 15 }]}>
                                    Prevent trackers from accessing your personal and sensitive information
                                </Text>

                                <TouchableOpacity
                                    style={styles.privacyUpgradeBtn}
                                    onPress={() => navigation.navigate('Privacy Prevention', { redirectScreen: 'Profile' })}
                                    underlayColor='#fff'>
                                    <MaterialCommunityIcons name="lock-check" style={{ marginBottom: 5, fontSize: 25 }} color="#000" />
                                    <Text style={styles.privacyUpgradeText}>Upgrade to Intelligent Privacy Prevention</Text>
                                </TouchableOpacity>
                            </>
                        )
                        :
                        ((!credentials?.enrolled_features?.privacy_prevention?.switch) && (
                            <>
                                <Text style={[styles.smallText, { marginTop: 15 }]}>
                                    Prevent trackers from accessing your personal and sensitive information
                                </Text>
                                <TouchableOpacity
                                    style={styles.privacyUpgradeBtn}
                                    onPress={() => navigation?.navigate('Settings', { "action_message": "To begin using Intelligent Privacy Prevention, please turn on the switch.", "feature_name": 'Intelligent Privacy Prevention', "icon_type": "warning" })}
                                    underlayColor='#fff'>
                                    <Text style={styles.privacyUpgradeText}>Turn on Intelligent Privacy Prevention</Text>
                                </TouchableOpacity>
                            </>
                        ))
                    }

                    {(trackerCounts !== null)
                        ?
                        (
                            <View style={styles.piechartContainer}>
                                {(trackerCounts.length > 0)
                                    ?
                                    (
                                        <React.Fragment>
                                            <PieChart style={{ height: 160 }} data={pieData} />
                                            <Text style={styles.websitesHeading}>
                                                Websites that contacted Trackers
                                            </Text>
                                            <Text style={styles.smallText}>
                                                Select the websites listed below to view the trackers that were contacted.
                                            </Text>
                                            <TrackerList />
                                        </React.Fragment>
                                    )
                                    :
                                    (
                                        <Text style={{ marginTop: 10, textAlign: 'center', marginVertical: 10, color: colorScheme === 'dark' ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)' }}>
                                            Intelligent Privacy Report will show up here whenever any trackers are encountered during browsing.
                                        </Text>
                                    )
                                }
                            </View>
                        )
                        :
                        (
                            <Loader message="Collecting your privacy reports for review..." />
                        )
                    }
                </View>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={onDeleteUser}
                    underlayColor='#fff'>
                    <Text style={styles.logoutText}>Delete My Account</Text>
                </TouchableOpacity>

                <View style={{ marginVertical: 20 }} />
            </ScrollView>
            <View>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={onLogout}
                    underlayColor='#fff'>
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}
import React, { Component } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions, RefreshControl, TextInput, Image, TouchableOpacity, Animated } from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ScaleXView from "./components/ScaleXView";
import { StateContext } from "./state_context";
import webIcon from "./assets/web_icon.png"
import incognitoIcon from "./assets/incognito.png"

class Tabs extends Component {
    static contextType = StateContext;
    constructor(props) {
        super(props);

        this.state = {
            refreshing: false,
            searchQuery: ""
        }
    }

    addNewTab = (isIncognito) => {
        this.props.addNewTab(isIncognito ? null : "https://www.google.com", isIncognito);
    }

    renderMetadata = () => {
        const tabs = [];
        const filtered = Array.from(this.props.metadata).filter(x => (x[1].title.toLowerCase().includes(this.state.searchQuery.toLowerCase())) || (x[1].url.toLowerCase().includes(this.state.searchQuery.toLowerCase())))

        for (const [key, tab] of filtered) {
            let img_url = { uri: `https://s2.googleusercontent.com/s2/favicons?domain_url=${tab?.url}&sz=64` };
            console.log(tab?.is_incognito);
            if (tab?.is_incognito) {
                img_url = incognitoIcon
            }

            const deleteScaleRef = new Animated.Value(1);
            const onDelete = () => {
                Animated.timing(deleteScaleRef, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }).start(() => {
                    this.props.removeTab(key)
                });
            }

            tabs.push(
                <ScaleXView key={key} style={styles.tabTitle} deleteScaleRef={deleteScaleRef}>
                    <TouchableOpacity onPress={() => this.props.switchCurrOpenWindow(key)}>
                        <Image
                            style={{ width: 40, height: 40, resizeMode: "contain", margin: 10, borderRadius: 10, }}
                            source={img_url}
                            onError={() => {
                                img_url = webIcon
                            }}
                        />
                    </TouchableOpacity>
                    <Text style={{ color: 'white', paddingVertical: 15, paddingLeft: 15, flex: 1, marginRight: 5, fontSize: 17 }} onPress={() => this.props.switchCurrOpenWindow(key)} numberOfLines={2}>{tab.title}</Text>
                    <FontAwesome name="close" size={20} color={this?.context?.colorScheme === 'dark' ? 'rgba(255, 55, 95, 1)' : 'rgba(255, 45, 85, 1)'} style={{ padding: 15 }} onPress={onDelete} />
                </ScaleXView>
            )
        }
        return tabs;
    }

    onRefresh = () => {
        this.setState({ refreshing: true });
        this.props.clearTabCache();
        this.setState({ refreshing: false });
    }

    onSearch = (text) => {
        this.setState({ searchQuery: text });
    }

    render() {
        const tabCount = this.props.metadata.size;
        return (
            <View style={styles.root}>
                <View style={styles.tab_count}>
                    <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                        <FontAwesome name={this.props.device_type} size={35} color={this?.context?.colorScheme === 'dark' ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)'} style={{ marginRight: 10 }} />
                        <View>
                            <Text style={{ color: this?.context?.colorScheme === 'dark' ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)' }}>{this.props.device_name}</Text>
                            <Text style={{ color: this?.context?.colorScheme === 'dark' ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)', fontWeight: "bold" }}>
                                {tabCount} {tabCount === 1 ? "Tab" : "Tabs"}
                            </Text>
                        </View>
                    </View>



                    <Icon name="history" size={35} color={this?.context?.colorScheme === 'dark' ? 'rgba(255, 159, 10, 1)' : 'rgba(255, 149, 0, 1)'} onPress={() => this.props?.navigation.navigate('Search History', { target_device: this.props.device_name, device_type: this.props.device_type })} />
                </View>

                <ScrollView style={styles.tabsContainer} contentContainerStyle={{ paddingVertical: 15 }} refreshControl={
                    tabCount > 0 ? (
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this.onRefresh}
                        />
                    )
                        : null
                }>
                    {tabCount > 0 && (
                        <View>
                            <Text style={{ color: (this?.context?.colorScheme === 'dark') ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)', textAlign: "center" }}>Pull to sync with other devices</Text>
                            <View style={styles.searchBar}>
                                <FontAwesome name="search" style={{ marginRight: 12, fontSize: 18 }} color="rgba(44, 44, 46, 1)" />
                                <TextInput
                                    onChangeText={this.onSearch}
                                    style={styles.searchBox}
                                    placeholder="Search Tabs"
                                    value={this.state.searchQuery}
                                    placeholderTextColor="#000"
                                />
                                {this.state.searchQuery.length > 0 && (
                                    <Icon name="close-circle-outline" style={{ marginRight: 12, fontSize: 18 }} color="#000" onPress={() => { this.setState({ searchQuery: "" }) }} />
                                )}
                            </View>
                        </View>
                    )}
                    {this.props.metadata.size > 0 ?
                        this.renderMetadata()
                        :
                        <View style={styles.centerAligned}>
                            <Text style={{ color: this?.context?.colorScheme === 'dark' ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)' }}>
                                No open tabs on <Text style={{ fontWeight: "bold" }}>{this.props.device_name}</Text> <FontAwesome name={this.props.device_type} size={18} color={this?.context?.colorScheme === 'dark' ? 'rgba(10, 132, 255, 1)' : 'rgba(0, 122, 255, 1)'} />
                            </Text>
                            <Text style={{ color: this?.context?.colorScheme === 'dark' ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)' }}>
                                Click on the <Icon name="plus-circle-outline" size={18} color={this?.context?.colorScheme === 'dark' ? 'rgba(10, 132, 255, 1)' : 'rgba(0, 122, 255, 1)'} /> icon below to open a new tab.
                            </Text>
                        </View>
                    }
                </ScrollView>
                <View style={styles.footer_options}>
                    <MaterialIcons style={{ padding: 10 }} name="devices" size={35} color={this?.context?.colorScheme === 'dark' ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)'} onPress={() => { this?.context?.setCurrentDeviceName(null); this.props?.navigation.navigate("Your Devices"); }} />
                    <Icon style={{ padding: 10 }} name="plus" size={40} color={this?.context?.colorScheme === 'dark' ? 'rgba(10, 132, 255, 1)' : 'rgba(0, 122, 255, 1)'} onPress={() => this.addNewTab(false)} />
                    <Icon style={{ padding: 10 }} name="incognito-circle" size={40} color={this?.context?.colorScheme === 'dark' ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)'} onPress={() => this.addNewTab(true)} />
                    <Icon style={{ padding: 10 }} name="delete" size={30} color={this?.context?.colorScheme === 'dark' ? 'rgba(255, 55, 95, 1)' : 'rgba(255, 45, 85, 1)'} onPress={this.props.deleteAllTabs} />
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        alignItems: "center",
    },
    tabsContainer: {
        width: Dimensions.get('window').width,
    },
    browserBar: {
        padding: 10,
        alignItems: 'center',
        flexDirection: 'column',
        paddingHorizontal: 15,
    },
    tab_count: {
        borderBottomWidth: 1,
        width: '100%',
        padding: 10,
        paddingHorizontal: 20,
        borderBottomColor: '#a9a9a9',
        marginTop: 5,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    centerAligned: {
        paddingVertical: 15,
        alignSelf: "center",
        alignItems: "center"
    },
    tabTitle: {
        alignItems: "center",
        backgroundColor: 'rgba(58, 58, 60, 1)',
        borderWidth: 1,
        borderColor: 'rgba(99, 99, 102, 1)',
        borderRadius: 10,
        marginVertical: 10,
        marginHorizontal: 20,
        flexDirection: "row",
        paddingVertical: 7,
    },
    footer_options: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: "space-between",
        width: Dimensions.get('window').width,
        paddingHorizontal: 15,
        paddingVertical: 7,
        borderTopWidth: 0.5,
        borderTopColor: '#a9a9a9'
    },
    searchBar: {
        backgroundColor: 'rgba(229, 229, 234, 1)',
        shadowColor: '#171717',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        borderRadius: 10,
        flex: 1,
        flexDirection: 'row',
        justifyContent: "space-between",
        padding: 12,
        margin: 20,
        borderWidth: 0.1,
        borderColor: 'rgba(44, 44, 46, 1)',
        alignItems: "center"
    },
    searchBox: {
        flex: 1,
        marginRight: 8,
        color: '#000'
    },
});

export default Tabs
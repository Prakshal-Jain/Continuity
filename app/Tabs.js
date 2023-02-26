import React, { Component } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, TextInput, Image, TouchableOpacity, Animated, Pressable, Alert, ImageBackground } from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ScaleXView from "./components/ScaleXView";
import { StateContext } from "./state_context";
import webIcon from "./assets/web_icon.png";
import incognitoIcon from "./assets/incognito.png";
import * as Haptics from 'expo-haptics';
import Loader from "./components/Loader";
import UnifiedError from "./components/UnifiedError";
import preview_tab from './assets/preview_tab.png';
import { LinearGradient } from 'expo-linear-gradient';

class Tabs extends Component {
    static contextType = StateContext;
    constructor(props) {
        super(props);

        this.state = {
            refreshing: false,
            searchQuery: "",
        }
    }

    scrollRef = React.createRef();

    componentDidUpdate = () => {
        const tabCount = this.tabCounter(this.props.isIncognitoView);
        this.props?.navigation.setOptions({
            headerLeft: () => (
                <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginLeft: 20 }}>
                    <FontAwesome name={this.props.device_type} size={30} color={this?.context?.colorScheme === 'dark' ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)'} style={{ marginRight: 10 }} />
                    <View>
                        <Text style={{ color: this?.context?.colorScheme === 'dark' ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)' }}>{this.props.device_name}</Text>
                        <Text style={{ color: this?.context?.colorScheme === 'dark' ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)', fontWeight: "bold" }}>
                            {tabCount} {tabCount === 1 ? "Tab" : "Tabs"}
                        </Text>
                    </View>
                </View>
            ),

            headerRight: () => (
                <View style={{ marginRight: 20 }}>
                    {(this.props.isIncognitoView)
                        ?
                        <Ionicons name="md-grid" size={30} color={this?.context?.colorScheme === 'dark' ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)'} onPress={() => this.props.setIsIncognitoView(false)} />
                        :
                        <Icon name="incognito-circle" size={35} color={this?.context?.colorScheme === 'dark' ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)'} onPress={() => this.props.setIsIncognitoView(true)} />
                    }
                </View>
            )
        })
    }

    addNewTab = (isIncognito) => {
        this.props.addNewTab(isIncognito ? null : "https://www.google.com", isIncognito);
    }

    tabCounter = (isIncognito) => {
        return Array.from(this.props.metadata).reduce((acc, curr) => acc + ((curr[1]?.is_incognito === isIncognito) ? 1 : 0), 0)
    }

    renderNoOpenTabs = () => (
        <View style={styles.centerAligned}>
            <Text style={{ color: this?.context?.colorScheme === 'dark' ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)' }}>
                No {this.props.isIncognitoView && "incognito "}tabs open on <Text style={{ fontWeight: "bold" }}>{this.props.device_name}</Text> <FontAwesome name={this.props.device_type} size={18} color={this?.context?.colorScheme === 'dark' ? 'rgba(10, 132, 255, 1)' : 'rgba(0, 122, 255, 1)'} />
            </Text>
            <Text style={{ color: this?.context?.colorScheme === 'dark' ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)' }}>
                Click on the <Icon name="plus" size={18} color={this?.context?.colorScheme === 'dark' ? 'rgba(10, 132, 255, 1)' : 'rgba(0, 122, 255, 1)'} /> icon below to open a new tab.
            </Text>
        </View>
    )

    renderSearchWithTabs = (tabs) => (
        <View>
            <Text style={{ color: (this?.context?.colorScheme === 'dark') ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)', textAlign: "center", marginBottom: 10 }}>Pull to sync tabs with other devices</Text>
            {this.props.isIncognitoView && (
                <View style={{ paddingTop: 15, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="incognito-circle" size={35} color={this?.context?.colorScheme === 'dark' ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)'} onPress={() => this.props.setIsIncognitoView(true)} />
                    <Text style={{ marginLeft: 5, fontWeight: "bold", textAlign: "center", color: this?.context?.colorScheme === 'dark' ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)', fontSize: 20 }}>Incognito Mode</Text>
                </View>
            )}

            {this.tabCounter(this.props.isIncognitoView) > 5 && (
                <View style={[styles.searchBar, { backgroundColor: (this.props.isIncognitoView || this?.context?.colorScheme === 'dark') ? 'rgba(58, 58, 60, 1)' : 'rgba(229, 229, 234, 1)' }]}>
                    <View style={{ flexDirection: 'row', justifyContent: "space-between", alignItems: "center" }}>
                        <FontAwesome name="search" style={{ fontSize: 18 }} color={(this.props.isIncognitoView || this?.context?.colorScheme === 'dark') ? "rgba(229, 229, 234, 1)" : "rgba(44, 44, 46, 1)"} />
                        <TextInput
                            onChangeText={this.onSearch}
                            style={[styles.searchBox, { color: (this.props.isIncognitoView || this?.context?.colorScheme === 'dark') ? '#fff' : '#000' }]}
                            placeholder="Search Tabs"
                            value={this.state.searchQuery}
                            placeholderTextColor={(this.props.isIncognitoView || this?.context?.colorScheme === 'dark') ? "rgba(174, 174, 178, 1)" : "rgba(72, 72, 74, 1)"}
                            selectTextOnFocus={true}
                        />
                        {this.state.searchQuery.length > 0 && (
                            <Icon name="close-circle-outline" size={18} color={(this.props.isIncognitoView || this?.context?.colorScheme === 'dark') ? "rgba(229, 229, 234, 1)" : "rgba(44, 44, 46, 1)"} onPress={() => { this.setState({ searchQuery: "" }) }} />
                        )}
                    </View>
                </View>
            )}

            <UnifiedError currentPage={this.props?.route_name} />

            <View style={{ flexDirection: 'row', flexWrap: "wrap", alignItems: "center" }}>
                {tabs}
            </View>
        </View>
    )

    renderRegularTabs = () => {
        const tabs = [];
        const filtered = Array.from(this.props.metadata ?? []).filter(([key, metadata]) => ((!metadata?.is_incognito) && ((metadata?.title?.toLowerCase()?.includes(this.state.searchQuery?.toLowerCase())) || (metadata?.url?.toLowerCase()?.includes(this.state.searchQuery?.toLowerCase())))))

        for (const [key, tab] of filtered) {
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
                <ScaleXView key={key} deleteScaleRef={deleteScaleRef} style={{ width: '50%' }}>
                    <ImageBackground source={preview_tab} resizeMode="center" style={styles.image} borderRadius={10} blurRadius={10} defaultSource={preview_tab}>
                        {/* <TouchableOpacity onPress={() => this.props.switchCurrOpenWindow(key)} style={{ flexDirection: "row", flex: 1, alignItems: "center" }}>
                            <Image
                                style={{ width: 40, height: 40, resizeMode: "contain", borderRadius: 10, }}
                                source={(tab?.is_incognito === true && tab?.url === null) ? incognitoIcon : { uri: `https://s2.googleusercontent.com/s2/favicons?domain_url=${tab?.url}&sz=64` }}
                                defaultSource={(tab?.is_incognito === true) ? incognitoIcon : webIcon}
                            />
                            <Text style={{ color: 'white', fontSize: 17, marginHorizontal: 15, flex: 1 }} numberOfLines={2}>{tab.title}</Text>
                        </TouchableOpacity>
                         */}
                        <LinearGradient
                            // Button Linear Gradient
                            style={{ borderTopLeftRadius: 8, borderTopRightRadius: 8, flexDirection: 'row', justifyContent: 'space-between', padding: 10, alignItems: "center" }}
                            colors={['rgba(58, 58, 60, 1)', 'rgba(58, 58, 60, 0.6)', 'rgba(58, 58, 60, 0)']}
                        >
                            <Image
                                style={{ width: 30, height: 30, resizeMode: "contain", borderRadius: 5 }}
                                source={(tab?.is_incognito === true && tab?.url === null) ? incognitoIcon : { uri: `https://s2.googleusercontent.com/s2/favicons?domain_url=${tab?.url}&sz=64` }}
                                defaultSource={(tab?.is_incognito === true) ? incognitoIcon : webIcon}
                            />
                            <TouchableOpacity style={{ backgroundColor: '#000', borderRadius: 30, padding: 5, width: 30, height: 30, alignItems: "center", justifyContent: "center" }} onPress={onDelete}>
                                <FontAwesome name="close" size={20} color={this?.context?.colorScheme === 'dark' ? 'rgba(255, 55, 95, 1)' : 'rgba(255, 45, 85, 1)'} />
                            </TouchableOpacity>
                        </LinearGradient>

                        <TouchableOpacity style={{ flex: 1 }} onPress={() => this.props.switchCurrOpenWindow(key)}></TouchableOpacity>

                        <LinearGradient
                            // Button Linear Gradient
                            style={{ borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}
                            colors={['rgba(58, 58, 60, 0)', 'rgba(58, 58, 60, 0.6)', 'rgba(58, 58, 60, 1)']}
                        >
                            <TouchableOpacity style={{ paddingBottom: 7, paddingTop: 10, paddingHorizontal: 10 }} onPress={() => this.props.switchCurrOpenWindow(key)}>
                                <Text style={{ color: 'white' }} numberOfLines={1}>{tab.title}</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </ImageBackground>
                </ScaleXView>
            )
        }
        return tabs;
    }

    renderIncognitoTabs = () => {
        const tabs = [];
        const filtered = Array.from(this.props.metadata ?? []).filter(([key, metadata]) => ((metadata?.is_incognito) && ((metadata?.title?.toLowerCase()?.includes(this.state.searchQuery?.toLowerCase())) || (metadata?.url?.toLowerCase()?.includes(this.state.searchQuery?.toLowerCase())))))

        for (const [key, tab] of filtered) {
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
                <ScaleXView key={key} deleteScaleRef={deleteScaleRef}>
                    <View style={[styles.tabTitle, {
                        backgroundColor: (tab?.is_incognito === true) ? '#000' : 'rgba(58, 58, 60, 1)',
                        borderColor: (tab?.is_incognito === true) ? 'rgba(58, 58, 60, 1)' : 'rgba(99, 99, 102, 1)',
                    }]}>
                        <TouchableOpacity onPress={() => this.props.switchCurrOpenWindow(key)} style={{ flexDirection: "row", flex: 1, alignItems: "center" }}>
                            <Image
                                style={{ width: 40, height: 40, resizeMode: "contain", borderRadius: 10, }}
                                source={(tab?.is_incognito === true && tab?.url === null) ? incognitoIcon : { uri: `https://s2.googleusercontent.com/s2/favicons?domain_url=${tab?.url}&sz=64` }}
                                defaultSource={(tab?.is_incognito === true) ? incognitoIcon : webIcon}
                            />
                            <Text style={{ color: 'white', fontSize: 17, marginHorizontal: 15, flex: 1 }} numberOfLines={2}>{tab.title}</Text>
                        </TouchableOpacity>
                        <FontAwesome name="close" size={25} color={this?.context?.colorScheme === 'dark' ? 'rgba(255, 55, 95, 1)' : 'rgba(255, 45, 85, 1)'} onPress={onDelete} />
                    </View>
                </ScaleXView>
            )
        }
        return tabs;
    }

    onSearch = (text) => {
        this.setState({ searchQuery: text });
    }

    render() {
        const regularTabsList = this.renderRegularTabs();
        const incognitoTabsList = this.renderIncognitoTabs();
        const tabCount = this.props.isIncognitoView ? incognitoTabsList?.length : regularTabsList?.length;

        return (
            <View style={styles.root}>
                <ScrollView style={styles.tabsContainer} contentContainerStyle={{ paddingVertical: 15 }} refreshControl={
                    <RefreshControl
                        refreshing={this.props.loading}
                        onRefresh={this.props.refreshTabs}
                    />
                }
                    ref={this.scrollRef}
                    onContentSizeChange={() => { this.scrollRef?.current?.scrollToEnd({ animated: false }); }}
                >
                    {this.props.loading === true ?
                        (
                            <Loader message="Fetching your tabs like a good doggo..." showActivityIndicator={false} />
                        )
                        :
                        (
                            <>
                                {this.renderSearchWithTabs(this.props.isIncognitoView ? incognitoTabsList : regularTabsList)}
                                {(tabCount === 0 && this.renderNoOpenTabs())}
                            </>
                        )
                    }
                </ScrollView>


                <View style={styles.footer_options}>
                    <Pressable
                        onPress={() => {
                            if (this?.context?.button_haptics !== 'none') {
                                Haptics.impactAsync(this?.context?.button_haptics);
                            }
                            this?.context?.setCurrentDeviceName(null);
                            this.props?.navigation.navigate("Your Devices");
                        }}
                        hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                    >
                        <MaterialIcons style={{ padding: 10 }} name="devices" size={35} color={this?.context?.colorScheme === 'dark' ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)'} />
                    </Pressable>

                    <Pressable
                        onPress={() => {
                            if (this?.context?.button_haptics !== 'none') {
                                Haptics.impactAsync(this?.context?.button_haptics);
                            }
                            this.props?.navigation.navigate('Search History', { target_device: this.props.device_name, device_type: this.props.device_type })
                        }}
                        hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                    >
                        <Icon style={{ padding: 10 }} name="history" size={40} color={this?.context?.colorScheme === 'dark' ? 'rgba(255, 159, 10, 1)' : 'rgba(255, 149, 0, 1)'} />
                    </Pressable>

                    <Pressable
                        onPress={() => {
                            if (this?.context?.button_haptics !== 'none') {
                                Haptics.impactAsync(this?.context?.button_haptics);
                            }
                            this.addNewTab(this.props.isIncognitoView)
                        }}
                        hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                    >
                        <Icon style={{ padding: 10 }} name="plus" size={40} color={this?.context?.colorScheme === 'dark' ? 'rgba(10, 132, 255, 1)' : 'rgba(0, 122, 255, 1)'} />
                    </Pressable>

                    <Pressable
                        disabled={tabCount <= 0}
                        onPress={() => {
                            if (tabCount > 0) {
                                if (this?.context?.button_haptics !== 'none') {
                                    Haptics.impactAsync(this?.context?.button_haptics);
                                }
                                Alert.alert(
                                    "Are you sure you want to delete all the tabs?",
                                    null,
                                    [
                                        {
                                            text: "Cancel",
                                            onPress: () => { }
                                        },
                                        {
                                            text: "Delete",
                                            onPress: this.props.deleteAllTabs
                                        },
                                    ]
                                )
                            }
                        }}
                        hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
                    >
                        <Icon style={{ padding: 10 }} name="delete" size={30} color={this?.context?.colorScheme === 'dark' ? `rgba(255, 55, 95, ${(tabCount > 0) ? 1 : 0.3})` : `rgba(255, 45, 85, ${(tabCount > 0) ? 1 : 0.3})`} />
                    </Pressable>
                </View>
            </View >
        )
    }
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        alignItems: "center",
    },
    tabsContainer: {
        width: '100%',
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
    footer_options: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: "space-between",
        width: '100%',
        paddingHorizontal: 15,
        paddingVertical: 7,
        borderTopWidth: 0.5,
        borderTopColor: '#a9a9a9'
    },
    searchBar: {
        shadowColor: '#171717',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        borderRadius: 10,
        flex: 1,
        padding: 12,
        margin: 20,
    },
    searchBox: {
        flex: 1,
        marginHorizontal: 10,
        fontSize: 15,
        borderWidth: 0,
    },

    image: {
        borderRadius: 30,
        height: 220,
        margin: 15,
    },
});

export default Tabs
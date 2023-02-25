import { useContext, useEffect, useRef, useState } from "react";
import { View, TextInput, Alert, Linking, StyleSheet, KeyboardAvoidingView, Animated, Keyboard, ActivityIndicator, Share, ScrollView, Text, PixelRatio } from "react-native";
import { WebView } from "react-native-webview";
import { StateContext } from "./state_context";
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { sanitizeUrl } from '@braintree/sanitize-url';
import { URL } from 'react-native-url-polyfill';
import extractDomain from "extract-domain";
import { captureRef } from 'react-native-view-shot';


/*
    Params: url, incognito, target_device, injectedJavaScript
*/


const isValidUrl = urlString => {
    var urlPattern = new RegExp('^(https?:\\/\\/)?' + // validate protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // validate fragment locator
    return !!urlPattern.test(urlString);
}


const defaultURL = 'https://www.google.com/';
const targetPixelCount = 360;

export default function (props) {
    const { socket, colorScheme, credentials, privacy_domain_set } = useContext(StateContext);
    const incognito = props?.incognito ?? false;
    const source = props?.url ?? (incognito ? null : defaultURL);
    const target_device = props?.target_device;

    const imageRef = useRef();

    useEffect(() => {
        if (incognito) {
            onBrowserLoad({
                nativeEvent: {
                    canGoBack: false,
                    canGoForward: false,
                    url: source,
                    title: "Incognito"
                }
            })
        }
    }, [])

    let injectedJavaScript = props?.injectedJavaScript ?? `
        window.ReactNativeWebView.postMessage('injected javascript works!');
        document.querySelectorAll('video').forEach(x => {
            x.setAttribute('playsinline', '');
            x.setAttribute('webkit-playsinline', '')
        });
        true; // note: this is required, or you'll sometimes get silent failures   
    `;

    if (incognito) {
        injectedJavaScript += `window.navigator.doNotTrack = 1;`
    }

    const [refreshing, setRefreshing] = useState(false);
    const [url, setURLHelper] = useState(source);

    const [intermediateURL, setIntermediateURL] = useState(source);
    const [canGoBack, setCanGoBack] = useState(false);
    const [canGoForward, setCanGoForward] = useState(false);
    const [ultraSearchPrompt, setUltraSearchPrompt] = useState(null);
    const [isFirstRequest, setIsFirstRequest] = useState(true);
    const [isInputFocused, setIsInputFocused] = useState(false);

    const setURL = (u) => {
        setURLHelper(u);
        setIntermediateURL(u);
    }

    const config = {
        detectorTypes: 'all',
        allowStorage: (!incognito),
        allowJavascript: true,
        allowCookies: (!incognito),
        allowLocation: (!incognito),
        allowCaching: (!incognito),
        defaultSearchEngine: 'google'
    }

    const browserRef = useRef();

    const styles = StyleSheet.create({
        root: {
            flex: 1,
            justifyContent: 'center',
            display: 'flex',
            backgroundColor: (colorScheme === 'dark') ? 'rgba(28, 28, 30, 1)' : 'rgba(242, 242, 247, 1)',
        },

        browserBar: {
            paddingVertical: 10,
            alignItems: 'center',
            flexDirection: 'column',
            paddingHorizontal: 15,
        },

        layers: {
            flexDirection: 'row',
            alignItems: "center",
            marginVertical: 8,
            justifyContent: "space-between",
            width: '100%',
        },

        browserAddressBar: {
            shadowColor: '#171717',
            shadowOffset: { width: 1, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            borderRadius: 10,
            flex: 1,
            flexDirection: 'row',
            justifyContent: "space-between",
            padding: 12,
            alignItems: "center",
            backgroundColor: (colorScheme === 'dark' || incognito) ? '#171717' : '#f8f8ff'
        },

        searchBox: {
            flex: 1,
            marginRight: 8,
            color: (colorScheme === 'dark' || incognito) ? 'rgba(242, 242, 247, 1)' : 'rgba(28, 28, 30, 1)'
        },

        incognitoContainer: {
            flex: 1,
            padding: 20,
        },

        heading: {
            fontWeight: 'bold',
            fontSize: 25,
            color: colorScheme === 'dark' ? '#fff' : '#000',
            flex: 1,
            textAlign: "center",
        },

        incognitoDescriptionContainer: {
            backgroundColor: (colorScheme === 'dark') ? 'rgba(58, 58, 60, 1)' : 'rgba(209, 209, 214, 1)',
            marginVertical: 20,
            padding: 15,
            width: '100%',
            borderRadius: 10,
        },

        smallText: {
            color: colorScheme === 'dark' ? 'rgba(174, 174, 178, 1)' : 'rgba(99, 99, 102, 1)',
            marginBottom: 10,
            textAlign: "center",
            fontStyle: "italic"
        },

        incognitoDescriptionText: {
            color: (colorScheme === 'dark') ? 'rgba(242, 242, 247, 1)' : 'rgba(28, 28, 30, 1)',
            textAlign: "center",
            marginVertical: 10
        }
    });

    const IncognitoDescription = () => (
        <ScrollView style={styles.incognitoContainer} contentContainerStyle={{ alignItems: "center" }}>
            <View style={{ marginVertical: 20 }}>
                <Icon name="incognito-circle" color={(colorScheme === 'dark') ? 'rgba(242, 242, 247, 1)' : 'rgba(44, 44, 46, 1)'} style={{ fontSize: 60 }} />
            </View>
            <Text style={styles.heading}>Incognito Mode</Text>
            <View style={styles.incognitoDescriptionContainer}>
                <Text style={styles.incognitoDescriptionText}>
                    Incognito mode in Continuity ensures that your browsing history for all tabs in this window remains private.
                </Text>
                <Text style={styles.incognitoDescriptionText}>
                    When you close this tab, Continuity will not remember the websites you visited, your search history, cookies and site data, or any AutoFill information.
                </Text>
            </View>
            <Text style={styles.smallText}>Because your internet history deserves a little mystery.</Text>
        </ScrollView>
    )

    const generateTitle = (title, web_url) => {
        if (title === null || title === undefined || title.length === 0) {
            return (new URL(web_url)).hostname;
        }
        return title;
    }


    const pixelRatio = PixelRatio.get();
    const pixels = targetPixelCount / pixelRatio;

    const takeScreenshot = async () => {
        const result = await captureRef(imageRef, {
            result: 'tmpfile',
            width: pixels,
            quality: 0.5,
            format: 'png',
        });
        console.log(result);
    }

    const onBrowserLoad = async (syntheticEvent) => {
        const { canGoForward, canGoBack, title } = syntheticEvent.nativeEvent;
        setIsFirstRequest(true);

        const curr_url = syntheticEvent?.nativeEvent?.url;

        let parsedUrl;

        try {
            parsedUrl = new URL(curr_url);
        }
        catch (err) {
            parsedUrl = null;
        }

        if (parsedUrl?.hostname === 'www.google.com' && parsedUrl?.pathname === '/search') {
            // Extract the searched string from the q query parameter
            const prompt = parsedUrl?.searchParams.get('q');
            if (prompt !== undefined && prompt !== null && ultraSearchPrompt !== prompt) {
                // A new prompt from user
                setUltraSearchPrompt(parsedUrl?.searchParams.get('q') ?? title)
            }
        }
        else {
            setUltraSearchPrompt(title);
        }

        setCanGoBack(canGoBack);
        setCanGoForward(canGoForward);

        await takeScreenshot();
    }

    const onNavigationStateChange = (navState) => {
        const { title } = navState;
        const curr_url = navState?.url;
        const updated_title = generateTitle(title, curr_url);


        const tab_metadata = { "title": updated_title, "url": url, "is_incognito": incognito };
        const metadataCopy = props.metadata;
        if (metadataCopy?.has(props?.id) && (metadataCopy?.get(props?.id)).url !== url) {
            socket?.emit("update_tab", { 'user_id': credentials?.user_id, 'device_name': credentials?.device_name, "device_token": credentials?.device_token, "target_device": props?.target_device, "tabs_data": { [props.id]: tab_metadata } })
        }
        metadataCopy?.set(props.id, tab_metadata);
        props.setMetaData(metadataCopy);


        let parsedUrl;

        try {
            parsedUrl = new URL(curr_url);
        }
        catch (err) {
            parsedUrl = null;
        }

        if (url !== curr_url) {
            if ((!incognito) && (!(parsedUrl?.hostname === 'www.google.com' && parsedUrl?.pathname !== '/search'))) {
                socket?.emit('set_history', {
                    'user_id': credentials?.user_id,
                    'device_name': credentials?.device_name,
                    "device_token": credentials?.device_token,
                    target_device,
                    'title': updated_title,
                    url,
                })
            }

            if (parsedUrl?.hostname === 'www.google.com' && parsedUrl?.pathname === '/search') {
                // Extract the searched string from the q query parameter
                const prompt = parsedUrl?.searchParams.get('q');
                if (prompt !== undefined && prompt !== null && ultraSearchPrompt !== prompt) {
                    // A new prompt from user
                    setUltraSearchPrompt(parsedUrl?.searchParams.get('q') ?? title)
                }
            }
            else {
                setUltraSearchPrompt(title);
            }
        }

        setIsFirstRequest(true);

        // TODO: Potential Bug when input in focus, and when blurred.
        if (!isInputFocused) {
            setURL(curr_url);
        }
        else {
            setURLHelper(curr_url);
        }
    }

    function verifyUrlType(url) {

        // short circuit these
        if (!url ||
            url.startsWith('http') ||
            url.startsWith("/") ||
            url.startsWith("#") ||
            url.startsWith("javascript") ||
            url.startsWith("about:blank")
        ) {
            return true;
        }

        // blocked blobs
        if (url.startsWith("blob")) {
            Alert.alert("Link cannot be opened.");
            return false;
        }

        // list of schemas we will allow the webview
        // to open natively
        if (url.startsWith("tel:") ||
            url.startsWith("mailto:") ||
            url.startsWith("maps:") ||
            url.startsWith("geo:") ||
            url.startsWith("sms:")
        ) {

            Linking.openURL(url).catch(er => {
                Alert.alert("Failed to open Link: " + er.message);
            });
            return false;
        }

        // let everything else to the webview
        return true;
    }

    const onShouldStartLoadWithRequest = (request) => {

        if (verifyUrlType(request?.url)) {
            let returnBool = true;
            if (!isFirstRequest) {
                if (!incognito) {
                    const parsedUrl = new URL(request.url);
                    if (!(parsedUrl.hostname === 'www.google.com' && parsedUrl.pathname === '/search')) {
                        const websiteHost = (new URL(url))?.hostname;
                        const tracker = parsedUrl?.hostname;
                        const trackerHost = extractDomain(tracker);

                        if (trackerHost !== null && trackerHost !== undefined && trackerHost !== '' && (!websiteHost.includes(trackerHost)) && websiteHost !== 'www.google.com' && trackerHost !== 'www.google.com') {
                            socket?.emit('report_privacy_trackers', {
                                'user_id': credentials?.user_id,
                                'device_name': credentials?.device_name,
                                "device_token": credentials?.device_token,
                                target_device,
                                "website_host": websiteHost,
                                "tracker": trackerHost
                            })
                            if (privacy_domain_set.has(trackerHost)) {
                                returnBool = false;
                            }
                        }
                    }
                }
            }
            else {
                setIsFirstRequest(false);
            }
            // can prevent requests from fulfilling, good to log requests
            // or filter ads and adult content.

            // MUST return true for the request to pass through
            if ((credentials?.enrolled_features?.privacy_prevention?.enrolled === true) && (credentials?.enrolled_features?.privacy_prevention?.switch === true)) {
                // Filter and do not allow trackers when enrolled and switch in privacy_prevention
                return returnBool;
            }
            else {
                return true;
            }
        }
        else {
            return false
        }
    }

    const onBrowserError = (syntheticEvent) => {
        const { nativeEvent } = syntheticEvent;
        console.warn('WebView error: ', nativeEvent)
    };

    const onBrowserMessage = (event) => {
    }

    function upgradeURL(uri) {
        if (isValidUrl(uri)) {
            let sanitized = (sanitizeUrl(uri)).toLowerCase();
            if (sanitized.startsWith('http') || sanitized.startsWith('https')) {
                return sanitized;
            }
            else {
                return `https://${sanitized}`;
            }
        }
        else {
            return `https://www.google.com/search?q=${uri}`;
        }
    }

    const loadURL = () => {
        if (intermediateURL === null || intermediateURL === undefined || intermediateURL.length === 0) {
            setURL(defaultURL);
            Keyboard.dismiss();
        }
        else {
            const newURL = upgradeURL(intermediateURL);
            setURL(newURL);
            Keyboard.dismiss();
        }
    }

    const reload = () => {
        try {
            if (browserRef) {
                setIsFirstRequest(true);
                browserRef.current.reload();
            }
        }
        catch (err) {
            console.log(err);
        }
    };

    const goBack = () => {
        try {
            if (browserRef?.current && canGoBack) {
                setIsFirstRequest(true);
                browserRef?.current?.goBack();
            }
        }
        catch (err) {
            console.log(err);
        }
    }

    const goForward = () => {
        try {
            if (browserRef?.current && canGoForward) {
                setIsFirstRequest(true);
                browserRef?.current?.goForward();
            }
        }
        catch (err) {
            console.log(err);
        }
    }

    const onShare = async () => {
        try {
            const result = await Share.share({
                message: intermediateURL
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error) {
            alert(error.message);
        }
    }

    const ultraSearchFunc = () => {
        if (credentials?.enrolled_features?.ultra_search?.enrolled === false) {
            // Change Homepage below to "Browser" --> when browser becomes a navigation screen
            return () => { props?.navigation?.navigate('Ultra Search', { redirectScreen: 'Tabs' }) }
        }
        else {
            // Check if switch is turned on
            if (credentials?.enrolled_features?.ultra_search?.switch === false) {
                return () => { props?.navigation?.navigate('Settings', { "action_message": "To begin using Ultra Search, please turn on the switch.", "feature_name": 'Ultra Search', "icon_type": "warning" }) }
            }
            else {
                return () => { props?.navigation?.navigate('Ultra Search Results', { "ultra_search_prompt": ultraSearchPrompt }) };
            }
        }
    }

    const barRef = useRef(0);
    const [isScrollUp, setIsScrollUp] = useState(true);
    const scrollAnim = useRef(new Animated.Value(0)).current;

    const translation = scrollAnim.interpolate({
        inputRange: [0, 100],
        outputRange: [100, 0],
        extrapolate: 'clamp',
    });

    const opacityAnim = scrollAnim.interpolate({
        inputRange: [0, 100],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    const handleScroll = (event) => {
        const currentYPosition = event.nativeEvent.contentOffset.y;
        const oldPosition = barRef.current;
        if (currentYPosition < 30) {
            if (!isScrollUp) {
                setIsScrollUp(true);
                Animated.timing(scrollAnim, {
                    toValue: 100,
                    duration: 300,
                    useNativeDriver: true
                }).start();
            }
        }
        else {
            if (oldPosition < currentYPosition) {
                if (isScrollUp) {
                    setIsScrollUp(false);
                    Animated.timing(scrollAnim, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true
                    }).start();
                }
            }
            else {
                if (!isScrollUp) {
                    setIsScrollUp(true);
                    Animated.timing(scrollAnim, {
                        toValue: 100,
                        duration: 300,
                        useNativeDriver: true
                    }).start();
                }
            }
        }
        barRef.current = currentYPosition;
    }

    return (
        <KeyboardAvoidingView
            {...(Platform.OS === 'ios' ? { behavior: 'padding' } : {})}
            style={{
                width: "100%",
                ...styles.root,
            }}
        >
            {(incognito && (url === null))
                ?
                (
                    <IncognitoDescription />
                )
                :
                (
                    <View ref={imageRef} style={{ flex: 1 }}>
                        <WebView
                            ref={browserRef}
                            originWhitelist={['*']}
                            source={{ uri: url }}
                            onLoad={onBrowserLoad}
                            onLoadStart={() => setRefreshing(true)}
                            onLoadEnd={() => setRefreshing(false)}
                            onError={onBrowserError}
                            onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
                            onNavigationStateChange={onNavigationStateChange}
                            onMessage={onBrowserMessage}
                            dataDetectorTypes={config.detectorTypes}
                            thirdPartyCookiesEnabled={config.allowCookies}
                            domStorageEnabled={config.allowStorage}     // Allow webview to use localStorage and sessionStorage APIs.
                            javaScriptEnabled={config.allowJavascript}
                            geolocationEnabled={config.allowLocation}
                            cacheEnabled={config.allowCaching}
                            injectedJavaScript={injectedJavaScript}
                            pullToRefreshEnabled={true}
                            allowsBackForwardNavigationGestures={true}
                            mediaPlaybackRequiresUserAction={false}
                            allowsLinkPreview={true}
                            // allowsFullscreenVideo={false}
                            allowsInlineMediaPlayback={true}
                            onContentProcessDidTerminate={() => setURL(defaultURL)}     // Handler when webview process terminates (change the source to default page)
                            style={{ backgroundColor: (colorScheme === 'dark' || incognito) ? 'rgba(28, 28, 30, 1)' : 'rgba(242, 242, 247, 1)', flex: 1 }}
                            onScroll={handleScroll}
                            incognito={incognito}
                        />
                    </View>
                )
            }

            <Animated.View
            // style={isInputFocused ? {} : { transform: [{ translateY: translation }], position: 'absolute', bottom: 0, left: 0, right: 0, opacity: opacityAnim }}
            >
                <LinearGradient
                    // Button Linear Gradient
                    colors={[(colorScheme === 'dark') ? 'rgba(58, 58, 60, 1)' : 'rgba(209, 209, 214, 1)', (colorScheme === 'dark') ? 'rgba(28, 28, 30, 1)' : 'rgba(242, 242, 247, 1)']}
                    style={styles.browserBar}
                >
                    <View style={styles.layers}>
                        <Animated.View style={styles.browserAddressBar}>
                            <TextInput
                                onChangeText={setIntermediateURL}
                                value={intermediateURL}
                                style={styles.searchBox}
                                returnKeyType="search"
                                autoCapitalize='none'
                                onSubmitEditing={loadURL}
                                editable={true}
                                placeholder="Search or enter a website"
                                placeholderTextColor="rgba(142, 142, 147, 1)"
                                selectTextOnFocus={true}
                                onFocus={() => setIsInputFocused(true)}
                                onBlur={() => {
                                    if (url !== intermediateURL) {
                                        setURL(url);
                                    }
                                    setIsInputFocused(false);
                                }}
                            />
                            {isInputFocused ?
                                (
                                    <Icon name="close-circle-outline" size={20} color={(colorScheme === 'dark' || incognito) ? 'rgba(242, 242, 247, 1)' : 'rgba(28, 28, 30, 1)'} onPress={() => setIntermediateURL(null)} />
                                )
                                :
                                (
                                    refreshing ? <ActivityIndicator size="small" /> : <Icon name="refresh" size={20} onPress={reload} color={(colorScheme === 'dark' || incognito) ? 'rgba(242, 242, 247, 1)' : 'rgba(28, 28, 30, 1)'} />
                                )}
                        </Animated.View>
                    </View>

                    <View style={styles.layers}>
                        <Icon name="chevron-left" size={30} onPress={goBack} style={{ color: canGoBack ? ((colorScheme === 'dark') ? 'rgba(242, 242, 247, 1)' : 'rgba(44, 44, 46, 1)') : ((colorScheme === 'dark') ? 'rgba(44, 44, 46, 1)' : 'rgba(242, 242, 247, 1)') }} disabled={!canGoBack} />
                        <Icon name="export-variant" size={25} onPress={onShare} color={(colorScheme === 'dark') ? 'rgba(242, 242, 247, 1)' : 'rgba(44, 44, 46, 1)'} />
                        {(!incognito) && (
                            <Icon name="lightning-bolt" size={30} onPress={ultraSearchFunc()} color="rgba(255, 149, 0, 1)" />
                        )}
                        <Ionicons name="ios-copy-outline" size={25} onPress={() => props?.switchCurrOpenWindow(-1)} color={(colorScheme === 'dark') ? 'rgba(242, 242, 247, 1)' : 'rgba(44, 44, 46, 1)'} />
                        <Icon name="chevron-right" size={30} onPress={goForward} style={{ color: canGoForward ? ((colorScheme === 'dark') ? 'rgba(242, 242, 247, 1)' : 'rgba(44, 44, 46, 1)') : ((colorScheme === 'dark') ? 'rgba(44, 44, 46, 1)' : 'rgba(242, 242, 247, 1)') }} disabled={!canGoForward} />
                    </View>
                </LinearGradient>
            </Animated.View>
        </KeyboardAvoidingView>
    )
}
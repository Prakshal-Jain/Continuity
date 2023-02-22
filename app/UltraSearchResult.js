import React, { Component } from "react";
import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    ScrollView,
    StatusBar,
    ActivityIndicator,
    TextInput,
    TouchableOpacity,
    Share
} from "react-native";
import { StateContext } from "./state_context";
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import * as Clipboard from 'expo-clipboard';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Loader from "./components/Loader";
import UnifiedError from "./components/UnifiedError";

class UltraSearchResult extends Component {
    static contextType = StateContext;
    constructor(props) {
        super(props);

        this.state = {
            ultra_search_prompt: this.props?.route?.params?.ultra_search_prompt,
            ultra_search_response: null,
            clipboard_icon: <Icon name="clipboard-outline" size={30} color="rgba(255, 149, 0, 1)" onPress={this.copyToClipboard} style={{ alignSelf: 'flex-end' }} />,
            loading: false
        }
    }

    copyToClipboard = async () => {
        await Clipboard.setStringAsync(this.state.ultra_search_response);
        this.setState({ clipboard_icon: <Icon name="clipboard-check-outline" size={30} color="rgba(40, 205, 65, 1)" style={{ alignSelf: 'flex-end' }} /> }, () => {
            setTimeout(() => {
                this.setState({ clipboard_icon: <Icon name="clipboard-outline" size={30} color="rgba(255, 149, 0, 1)" onPress={this.copyToClipboard} style={{ alignSelf: 'flex-end' }} /> })
            }, 1500)
        })
    };

    emitPrompt = () => {
        this.setState({ ultra_search_response: null })
        const query_creds = {
            'user_id': this?.context?.credentials?.user_id,
            'device_name': this?.context?.credentials?.device_name,
            'device_token': this?.context?.credentials?.device_token,
            'prompt': this.state.ultra_search_prompt
        }
        this?.context?.socket.emit('ultra_search_query', query_creds)
        this.setState({ loading: true });
    }

    onShare = async () => {
        try {
            const result = await Share.share({
                message: `Prompt: ${this.state.ultra_search_prompt}\n\nResponse: ${this.state.ultra_search_response}`
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
    };


    componentDidMount = () => {
        this.emitPrompt();

        this?.context?.socket.on('ultra_search_query', (data) => {
            if (data?.successful === true) {
                this.setState({ ultra_search_response: data?.message?.response, ultra_search_prompt: data?.message?.prompt })
                this?.context?.setError(null);
            }
            else {
                this?.context?.setError({ message: data?.message, type: data?.type, displayPages: new Set(["Ultra Search Results"]) });
            }
            this.setState({ loading: false });
        })
    }

    render() {
        return (
            <SafeAreaView style={[styles.root, { backgroundColor: (this?.context?.colorScheme === 'dark') ? 'rgba(28, 28, 30, 1)' : 'rgba(242, 242, 247, 1)' }]}>
                <ScrollView style={styles.scrollContainer}>
                    <View style={[styles.prompt_container, { backgroundColor: (this?.context?.colorScheme === 'dark') ? '#000' : '#fff' }]}>
                        <TextInput
                            onChangeText={(text) => { this.setState({ ultra_search_prompt: text }) }}
                            value={this.state.ultra_search_prompt}
                            style={{ flex: 1, fontWeight: "bold", color: (this?.context?.colorScheme === 'dark') ? 'rgba(242, 242, 247, 1)' : 'rgba(28, 28, 30, 1)', paddingTop: 12, paddingBottom: 12, paddingLeft: 12 }}
                            returnKeyType="return"
                            placeholder="Search here"
                            placeholderTextColor="rgba(142, 142, 147, 1)"
                            multiline={true}
                            selectTextOnFocus={true}
                            editable={!this.state.loading}
                        />
                        <TouchableOpacity style={[styles.ultraSearchBtn, { backgroundColor: this.state.loading ? 'rgba(255, 149, 0, 0.5)' : 'rgba(255, 149, 0, 1)' }]} onPress={this.emitPrompt} disabled={this.state.loading}>
                            <FontAwesome name="search" style={{ fontSize: 18 }} color="rgba(44, 44, 46, 1)" />
                        </TouchableOpacity>
                    </View>

                    <UnifiedError currentPage={this.props?.route?.name} />

                    <View>
                        {
                            (this.state.ultra_search_response !== null && this.state.ultra_search_response !== undefined)
                                ?
                                (
                                    <View style={[styles.response_container, { backgroundColor: (this?.context?.colorScheme === 'dark') ? '#rgba(44, 44, 46, 1)' : 'rgba(229, 229, 234, 1)' }]}>
                                        <View style={{
                                            borderBottomWidth: 1,
                                            paddingBottom: 10,
                                            marginBottom: 5,
                                            borderBottomColor: (this?.context?.colorScheme === 'dark') ? '#rgba(99, 99, 102, 1)' : 'rgba(174, 174, 178, 1)',
                                            flexDirection: 'row',
                                        }}>
                                            {this.state.clipboard_icon}
                                            <Icon name="export-variant" size={27} color="rgba(255, 149, 0, 1)" onPress={this.onShare} style={{ marginLeft: 15, alignSelf: 'flex-end' }} />
                                        </View>
                                        <Text style={[styles.response_style, { color: this?.context?.colorScheme === 'dark' ? '#fff' : '#000', fontSize: 15 }]} selectable={true}>
                                            {this.state.ultra_search_response}
                                        </Text>
                                    </View>
                                )
                                :
                                (
                                    (this.state.ultra_search_prompt !== null && this.state.ultra_search_prompt !== undefined && this.state.ultra_search_prompt?.length > 0)
                                    &&
                                    (
                                        (this.state.loading) &&
                                        (
                                            <Loader message="Hunting for the ultimate solutions for you..." />
                                        )
                                    )
                                )
                        }
                    </View>
                </ScrollView>
                <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center', padding: 10 }} onPress={() => this.props.navigation.navigate('Ultra Search | Terms of Use and Disclaimer')}>
                    <Text style={{ color: this?.context?.colorScheme === 'dark' ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)', fontSize: 10 }}>
                        Terms of Use and Disclaimer
                    </Text>
                </TouchableOpacity>
            </SafeAreaView>
        )
    }
}


const styles = StyleSheet.create({
    root: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex',
    },

    scrollContainer: {
        flex: 1,
        width: '100%'
    },

    prompt_container: {
        borderRadius: 10,
        flex: 1,
        flexDirection: "row",
        margin: 20,
    },

    response_container: {
        padding: 15,
        borderRadius: 10,
        margin: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },

    prompt_style: {
        marginVertical: 10,
        textAlign: "center",
        fontWeight: "bold"
    },

    response_style: {
        marginVertical: 10,
    },

    ultraSearchBtn: {
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        padding: 12,
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        marginLeft: 10,
    },
})


export default UltraSearchResult;
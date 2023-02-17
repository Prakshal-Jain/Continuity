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
            bookmarks: [],
        }
    }

    render() {
        return (
            <SafeAreaView style={[styles.root, { backgroundColor: (this?.context?.colorScheme === 'dark') ? 'rgba(28, 28, 30, 1)' : 'rgba(242, 242, 247, 1)' }]}>
                <ScrollView style={styles.scrollContainer}>
                    <UnifiedError currentPage={this.props?.route?.name} />
                </ScrollView>
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
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

const bookmarks = [
    "https://www.apartments.com/verandas-apartments-menlo-park-ca/e7kcxrp/",
    "https://mail.google.com/mail/u/0/?tab=rm&ogbl#inbox",
    "https://appstoreconnect.apple.com",
    "https://coolors.co/colors/yellow",
    "https://discord.com/"
]

class UltraSearchResult extends Component {
    static contextType = StateContext;
    constructor(props) {
        super(props);

        this.state = {
            bookmarks: [],
            searchQuery: ""
        }
    }

    render() {
        return (
            <SafeAreaView style={[styles.root, { backgroundColor: (this?.context?.colorScheme === 'dark') ? 'rgba(28, 28, 30, 1)' : 'rgba(242, 242, 247, 1)' }]}>
                <ScrollView style={styles.scrollContainer}>
                    <View style={[styles.searchBar, { backgroundColor: (this?.context?.colorScheme === 'dark') ? 'rgba(58, 58, 60, 1)' : 'rgba(229, 229, 234, 1)' }]}>
                        <View style={{ flexDirection: 'row', justifyContent: "space-between", alignItems: "center" }}>
                            <FontAwesome name="search" style={{ fontSize: 18 }} color={(this?.context?.colorScheme === 'dark') ? "rgba(229, 229, 234, 1)" : "rgba(44, 44, 46, 1)"} />
                            <TextInput
                                onChangeText={(text) => this.setState({ searchQuery: text })}
                                style={[styles.searchBox, { color: (this?.context?.colorScheme === 'dark') ? '#fff' : '#000' }]}
                                placeholder="Search Tabs"
                                value={this.state.searchQuery}
                                placeholderTextColor={(this?.context?.colorScheme === 'dark') ? "rgba(174, 174, 178, 1)" : "rgba(72, 72, 74, 1)"}
                                selectTextOnFocus={true}
                            />
                            {this.state.searchQuery.length > 0 && (
                                <Icon name="close-circle-outline" size={18} color={(this?.context?.colorScheme === 'dark') ? "rgba(229, 229, 234, 1)" : "rgba(44, 44, 46, 1)"} onPress={() => { this.setState({ searchQuery: "" }) }} />
                            )}
                        </View>
                    </View>
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
})


export default UltraSearchResult;
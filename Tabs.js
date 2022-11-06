import React, { Component } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

class Tabs extends Component {
    constructor(props) {
        super(props);
    }

    addNewTab = () => {
        this.props.addNewTab("https://www.google.com");
    }

    renderMetadata = () => {
        const tabs = [];
        for (const [key, tab] of this.props.metadata) {
            tabs.push(
                <View key={key} style={styles.tabTitle}>
                    <Text style={{ color: 'white', paddingVertical: 15, paddingLeft: 15, flex: 1, marginRight: 5 }} onPress={() => this.props.switchCurrOpenWindow(key)} >{tab.title}</Text>
                    <FontAwesome name="close" size={20} color="#e23838" style={{ padding: 15 }} onPress={() => this.props.removeTab(key)} />
                </View>
            )
        }
        return tabs;
    }

    render() {
        const tabCount = this.props.tabs.size;
        return (
            <View style={styles.root}>
                {(tabCount > 0) && (
                    <View style={styles.tab_count}>
                        <Text style={{ color: 'black', textAlign: "center" }}>{this.props.device_name} <FontAwesome name={this.props.device_type} size={18} color="#28282B" /></Text>
                        <Text style={{ color: 'black', textAlign: "center", fontWeight: "bold" }}>
                            {tabCount} {tabCount > 1 ? "Tabs" : "Tab"}
                        </Text>
                    </View>
                )}

                <ScrollView style={styles.tabsContainer}>
                    {this.props.metadata.size > 0 ?
                        this.renderMetadata()
                        :
                        <View style={styles.centerAligned}>
                            <Text>
                                No open tabs on <Text style={{ fontWeight: "bold" }}>{this.props.device_name}</Text> <FontAwesome name={this.props.device_type} size={18} color="#28282B" />
                            </Text>
                            <Text>
                                Click on the <Icon name="plus-circle-outline" size={18} color="#06c" /> icon below to open a new tab.
                            </Text>
                        </View>
                    }
                </ScrollView>
                <View style={styles.footer_options}>
                    <MaterialIcons name="devices" size={40} color="#28282B" onPress={() => this.props.setCurrentDeviceName(null)} />
                    <Icon name="plus-circle-outline" size={50} color="#06c" onPress={this.addNewTab} />
                    <Icon name="delete" size={40} color="#e23838" onPress={this.props.deleteAllTabs} />
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: "center",
    },
    tabsContainer: {
        paddingVertical: 10,
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
        padding: 5,
        borderBottomColor: '#28282B',
        marginTop: 5,
    },
    centerAligned: {
        paddingVertical: 15,
        alignSelf: "center",
        alignItems: "center"
    },
    tabTitle: {
        alignItems: "center",
        backgroundColor: '#28282B',
        borderRadius: 10,
        marginVertical: 5,
        marginHorizontal: 20,
        flexDirection: "row",
    },
    footer_options: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: "space-between",
        width: Dimensions.get('window').width,
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderTopWidth: 0.5,
        borderTopColor: '#a9a9a9'
    }
});

export default Tabs
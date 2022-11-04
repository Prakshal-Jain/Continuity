import React, { Component } from "react";
import { View, Text, StyleSheet, ScrollView, Button, TouchableOpacity } from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

class Tabs extends Component {
    constructor(props) {
        super(props);
    }

    addNewTab = () => {
        const nextIdx = this.props.tabs.length;
        this.props.addNewTab("https://www.google.com");
        this.props.switchCurrOpenWindow(nextIdx);
    }

    render() {
        const tabCount = this.props.tabs.length;
        return (
            <View style={styles.root}>
                {(tabCount > 0) && (
                    <View style={styles.tab_count}>
                        <Text style={{ color: 'black', textAlign: "center", fontWeight: "bold" }}>
                            {tabCount} {tabCount > 1 ? "Tabs" : "Tab"}
                        </Text>
                    </View>
                )}

                <ScrollView style={styles.tabContainer}>
                    {this.props.metadata.length > 0 ? (
                        this.props.metadata.map((tab, index) => (
                            <Text onPress={() => this.props.switchCurrOpenWindow(index)} key={index}>{tab.title}</Text>
                        )))
                        :
                        <View style={styles.centerAligned}>
                            <Text>
                                No open tabs
                            </Text>
                            <Text>
                                Click on the <Icon name="plus-circle-outline" size={18} color="#06c" /> icon below to open a new tab.
                            </Text>
                        </View>
                    }
                    { }
                </ScrollView>
                <View style={{ alignItems: "center" }}>
                    <Icon name="plus-circle-outline" size={50} color="#06c" onPress={this.addNewTab} />
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
    tabContainer: {
        flex: 1,
        padding: 10,
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
        marginVertical: 5,
    },
    centerAligned: {
        paddingVertical: 15,
        alignItems: "center",
    }
});

export default Tabs
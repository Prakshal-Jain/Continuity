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
                        <Text style={{ color: 'white', textAlign: "center" }}>
                            {tabCount} {tabCount > 1 ? "Tabs" : "Tab"}
                        </Text>
                    </View>
                )}

                <ScrollView style={styles.tabContainer}>
                    {this.props.metadata.map((tab, index) => (
                        <Text onPress={() => this.props.switchCurrOpenWindow(index)} key={index}>{tab.title}</Text>
                    ))}
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
    },
    tabContainer: {
        flex: 1,
    },
    browserBar: {
        padding: 10,
        alignItems: 'center',
        flexDirection: 'column',
        paddingHorizontal: 15,
    },
    tab_count: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 5,
    }
});

export default Tabs
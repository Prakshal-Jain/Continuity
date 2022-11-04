import React, { Component } from "react";
import { View, Text, StyleSheet, Button, TouchableOpacity } from "react-native";



class Tabs extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View style={styles.container}>
                <Text>
                    {Object.entries(this.props.tabs).map(([key, value], index) => (
                        <TouchableOpacity onPress={() => this.props.switchCurrOpenWindow(key)} key={key}>
                            <View style={styles.tab_container}>
                                <View style={styles.hidden_tab}>
                                    {value}
                                </View>
                                <Text>
                                    {(key in this.props.metadata) && this.props.metadata[key].title}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </Text>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
    hidden_tab: {
        display: 'none'
    },
    tab_container: {
        padding: 5,
        borderColor: 'black',
        borderWidth: 1,
    }
});

export default Tabs
import { Text, View, StyleSheet, TextInput, Image, Button, Appearance } from 'react-native';
import SelectList from 'react-native-dropdown-select-list'
import React from "react";

export default function Login(props) {
    const [deviceName, setDeviceName] = React.useState(null);
    const [username, setUsername] = React.useState(null);
    const [selected, setSelected] = React.useState(null);

    const data = [
        { key: 'mobile-phone', value: 'Mobile Phone' },
        { key: 'tablet', value: 'Tablet' },
        { key: 'laptop', value: 'Laptop' },
        { key: 'desktop', value: 'Desktop' },
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.h1}>Flow</Text>
            {/* <Image source={require('../assets/TripTok_logo.png')} style={{width: 200, height: 200}} /> */}
            <Text style={styles.h2}>Sign Up</Text>
            <View style={styles.horizontal_flex}>
                <TextInput style={styles.text_input} placeholder="Username" placeholderTextColor="rgba(27,57,107,255)" onChangeText={setUsername} />
            </View>
            <View style={styles.horizontal_flex}>
                <TextInput style={styles.text_input} placeholder="Device Name" placeholderTextColor="rgba(27,57,107,255)" onChangeText={setDeviceName} />
            </View>
            <View style={styles.horizontal_flex}>
                <SelectList setSelected={setSelected} data={data} search={false} />
            </View>
            <Button style={styles.button} title="Sign Up" color='rgba(27,57,107,255)' onPress={() => {props.postCredentials({'device_name': deviceName, 'user_id': username, 'device_type': selected})}} />
        </View>
    );
}

const styles = StyleSheet.create({
    text_styles: {
        color: Appearance.getColorScheme() === 'dark' ? '#fff' : '#000',
    },
    horizontal_flex: {
        flexDirection: 'row',
        width: '100%',
        paddingVertical: 15,
    },
    text_input: {
        borderWidth: 1,
        padding: 15,
        flex: 1,
        borderRadius: 8,
        borderColor: 'rgba(27,57,107,1)',
    },
    container: {
        alignItems: 'center',
        padding: 20,
        flex: 1,
        width: '100%'
    },
    h1: {
        fontWeight: 'bold',
        fontStyle: 'italic',
        fontSize: 80,
        marginVertical: 20,
    },
    h2: {
        fontWeight: 'bold',
        fontSize: 25
    },
    button: {
        backgroundColor: '#A66CFF',
    }
});

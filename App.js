import React from 'react';
import DeviceManager from './DeviceManager';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
} from "react-native";
import Login from './Login';


export default class App extends React.Component {
  state = {
    devices: [],
    currDeviceName: null,  // null if no devices selected
    isLoggedIn: false,
  }

  componentDidMount = () => {
    this.setState({
      devices: [
        ...this.state.devices,
        {
          "tabs": {
            0: {
              "title": "YouTube",
              "url": "https://youtube.com/"
            },
            1: {
              "title": "LinkedIn",
              "url": "https://www.linkedin.com/"
            },
          },
          "device_name": "Android Moto G 5G",
          "device_type": "mobile-phone",  // mobile-phone | tablet | laptop | desktop
          "user_id": "Prakshal"
        },

        {
          "tabs": {
            0: {
              "title": "Google Search",
              "url": "https://www.google.com/"
            },
            1: {
              "title": "LinkedIn",
              "url": "https://www.linkedin.com/"
            },
            2: {
              "title": "GitHub",
              "url": "https://github.com/"
            },
          },
          "device_name": "Samsung Tablet",
          "device_type": "tablet",  // mobile-phone | tablet | laptop | desktop
          "user_id": "Prakshal"
        },

        {
          "tabs": {
            0: {
              "title": "Google Search",
              "url": "https://www.google.com/"
            },
            1: {
              "title": "LinkedIn",
              "url": "https://www.linkedin.com/"
            },
            2: {
              "title": "GitHub",
              "url": "https://github.com/"
            },
          },
          "device_name": "Prakshal's iPad",
          "device_type": "tablet",  // mobile-phone | tablet | laptop | desktop
          "user_id": "Prakshal"
        },
        {
          "tabs": {
            0: {
              "title": "Google Search",
              "url": "https://www.google.com/"
            },
            1: {
              "title": "LinkedIn",
              "url": "https://www.linkedin.com/"
            },
            2: {
              "title": "GitHub",
              "url": "https://github.com/"
            },
          },
          "device_name": "Random Desktop",
          "device_type": "desktop",  // mobile-phone | tablet | laptop | desktop
          "user_id": "Prakshal"
        },
        {
          "tabs": {
            0: {
              "title": "Google Search",
              "url": "https://www.google.com/"
            },
            1: {
              "title": "LinkedIn",
              "url": "https://www.linkedin.com/"
            },
            2: {
              "title": "GitHub",
              "url": "https://github.com/"
            },
          },
          "device_name": "Lappyyy",
          "device_type": "laptop",  // mobile-phone | tablet | laptop | desktop
          "user_id": "Prakshal"
        },

        {
          "tabs": {},
          "device_name": "New phone",
          "device_type": "mobile-phone",  // mobile-phone | tablet | laptop | desktop
          "user_id": "Prakshal"
        },
      ]
    });
  }

  setCurrentDeviceName = (name) => {
    this.setState({ currDeviceName: name });
  }

  render() {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar animated={true} barStyle="dark-content" backgroundColor="#fff" />
        {this.state.isLoggedIn ?
          (
            this.state.currDeviceName === null ? (
              [
                <View style={{ borderBottomColor: '#a9a9a9', borderBottomWidth: 1, width: '100%', alignItems: 'center' }} key="page_label"><Text style={styles.your_devices}>Your Devices</Text></View>,
                <ScrollView key="device_list" style={{ width: '100%' }} contentContainerStyle={styles.devices_container}>
                  {
                    this.state.devices.map((x => (
                      <TouchableOpacity key={x.device_name} style={styles.device_box} onPress={() => this.setCurrentDeviceName(x.device_name)}>
                        <View style={styles.icon_style}>
                          <FontAwesome name={x.device_type} size={50} color="#28282B" />
                        </View>

                        <View>
                          <Text style={{ textAlign: 'center' }}>
                            {x.device_name}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )))
                  }
                </ScrollView>]
            )
              :
              <DeviceManager setCurrentDeviceName={this.setCurrentDeviceName} tabs_data={(this.state.devices.filter(device => device.device_name === this.state.currDeviceName))[0]} />
          )
          :
          <Login />
        }
      </SafeAreaView>
    );
  }
}


const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
    // paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },

  devices_container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    justifyContent: 'center',
    paddingBottom: 50,
  },

  device_box: {
    width: 150,
    height: 150,
    borderWidth: 1,
    borderColor: '#28282B',
    margin: 15,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },

  icon_style: {
    alignItems: 'center',
    marginBottom: 10,
  },

  your_devices: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
  }
});
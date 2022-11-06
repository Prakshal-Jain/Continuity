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
import { io } from "socket.io-client";


export default class App extends React.Component {
  state = {
    devices: [],
    currDeviceName: null,  // null if no devices selected
    isLoggedIn: false,
    credentials: null,
  }

  socket = io("http://10.84.77.41");

  componentDidMount = () => {
    this.socket.on('login', (data) => {
      if (!data.sucessful) {
        console.log("Unsuccessful Login");
        this.setState({ credentials: null });
        return;
      }
      this.setState({ isLoggedIn: true });
    });

    this.socket.on('tabs_updated', (data) => {
      this.setState({
        devices: data
      })
    });

    this.socket.on('add_device', (data) => {
      this.setState({
        devices: [
          ...this.state.devices,
          data
        ]
      })
    });


    this.socket.on('add_tab', (data) => {
      const idx = (this.state.devices.findIndex(device => device.device_name === data.device_name));
      const d = this.state.devices;

      d[idx].tabs = {
        ...d[idx].tabs,
        ...data.tabs_data
      }

      const curr = this.state.currDeviceName;
      this.setState({currDeviceName: null}, () => {
        this.setState({currDeviceName: curr});
      });

      this.setState({
          devices: d,
      })
    });
  }

  postCredentials = (credentials) => {
    this.setState({ credentials: credentials }, () => {
      this.socket.emit("login", credentials);
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
              <DeviceManager setCurrentDeviceName={this.setCurrentDeviceName} tabs_data={(this.state.devices.filter(device => device.device_name === this.state.currDeviceName))[0]} socket={this.socket} />
          )
          :
          <Login postCredentials={this.postCredentials} />
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
    marginBottom: 10,
  }
});
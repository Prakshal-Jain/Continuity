import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Profile from "./Profile";
import Help from "./Help";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  StatusBar,
  useColorScheme,
  Image,
  TouchableOpacity,
} from "react-native";
import DeviceManager from './DeviceManager';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Login from './Login';
import { io } from "socket.io-client";
import ScaleTouchableOpacity from './components/ScaleTouchableOpacity';
import PrivacyPolicy from './PrivacyPolicy';
import Settings from './Settings';
import UltraSearch from './UltraSearch';
import React, { useState, useEffect } from 'react';
import storage from "./utilities/storage";

const Stack = createNativeStackNavigator();
const socket = io("http://172.20.10.2");

export default function () {
  const colorScheme = useColorScheme();

  console.log("Setting DEVICES to []");
  const [devices, setDevices] = useState([]);
  const [currDeviceName, setCurrentDeviceName] = useState(null);
  const [credentials, setCredentials] = useState(null);

  const autoAuthenticate = async () => {
    await storage.clearAll();
    const user_id = await storage.get("user_id");
    const device_name = await storage.get("device_name");
    const device_token = await storage.get("device_token");
    // console.log({ user_id, device_name, device_token })
    socket.emit("auto_authenticate", { user_id, device_name, device_token })
  }

  useEffect(() => {
    (async () => { await autoAuthenticate(); })();
  }, []);



  socket.on('auto_authenticate', async (data) => {
    // Set the correct states and credentials
    if ((!data?.successful) || credentials !== null) {
      setCredentials(null);
      return
    }
    else {
      console.log(data?.message);
      setCredentials(data?.message);
    }
  })

  socket.on('login', async (data) => {
    if ((!data?.successful) || credentials !== null) {
      setCredentials(null);
      return;
    }
    else {
      await storage.set("user_id", data?.message?.user_id);
      await storage.set("device_name", data?.message?.device_name);
      await storage.set("device_token", data?.message?.device_token);
      setCredentials(data?.message);
    }
  });

  socket.on('all_devices', (data) => {
    if (data?.successful === true) {
      setDevices(data?.message);
    }
    else {
      console.log(data?.message);
    }
  });

  socket.on('add_device', (data) => {
    console.log(devices);
    if (data?.successful === true) {
      const all_dev = [
        ...devices,
        data?.message
      ];
      setDevices(all_dev);
    }
    else {
      console.log(data?.message)
    }
  });




  const postCredentials = (creds) => {
    creds.user_id = creds?.email;
    socket.emit("login", creds);
  }

  const deleteAllData = async () => {
    await storage.clearAll();
    setDevices([]);
    setCurrentDeviceName(null);
    setCredentials(null);
  }




  const Homepage = ({ navigation }) => {
    const styles = StyleSheet.create({
      root: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex',
        backgroundColor: (colorScheme === 'dark') ? 'rgba(28, 28, 30, 1)' : 'rgba(242, 242, 247, 1)',
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
        borderColor: colorScheme === 'dark' ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)',
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
        color: colorScheme === 'dark' ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)'
      },

      footer_options: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: "space-between",
        width: '100%',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderTopWidth: 0.5,
        borderTopColor: '#a9a9a9',
      },
    });

    return (
      <SafeAreaView style={styles.root}>
        <StatusBar animated={true}
          barStyle={colorScheme == 'dark' ? 'light-content' : 'dark-content'}
        />
        {(credentials !== null) ?
          (
            currDeviceName === null ? (
              [
                <View style={{ borderBottomColor: '#a9a9a9', borderBottomWidth: 1, width: '100%', alignItems: 'center' }} key="page_label"><Text style={styles.your_devices}>Your Devices</Text></View>,
                <ScrollView key="device_list" style={{ width: '100%' }} contentContainerStyle={styles.devices_container}>
                  {
                    devices.map(((x, i) => (
                      <ScaleTouchableOpacity key={x.device_name} style={styles.device_box} onPress={() => setCurrentDeviceName(x.device_name)} key={`device_${i}`}>
                        <View style={styles.icon_style}>
                          <FontAwesome name={x.device_type} size={50} color={colorScheme === 'dark' ? '#fff' : '#000'} />
                        </View>

                        <View>
                          <Text style={{ textAlign: 'center', color: colorScheme === 'dark' ? '#fff' : '#000' }}>
                            {x.device_name}
                          </Text>
                          {x.device_name === credentials.device_name && (
                            <Text style={{ textAlign: 'center', color: '#1B8E2D', marginTop: 5, }}>
                              <FontAwesome name={'circle'} color="#1B8E2D" /> This Device
                            </Text>
                          )}
                        </View>
                      </ScaleTouchableOpacity>
                    )))
                  }
                </ScrollView>,
                (credentials !== null && credentials !== undefined) ? (
                  <View style={styles.footer_options} key="footer">
                    <TouchableOpacity onPress={() => navigation.navigate('Help')}>
                      <MaterialIcons name="help-outline" size={32} color={colorScheme === 'dark' ? '#fff' : '#000'} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Settings', { credentials, socket })}>
                      <MaterialIcons name="settings" size={32} color={colorScheme === 'dark' ? '#fff' : '#000'} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Profile', { credentials, socket, deleteAllData })}>
                      <Image source={{ uri: credentials?.picture }} style={{ width: 32, height: 32, borderRadius: (32 / 2) }} />
                    </TouchableOpacity>
                  </View>
                )
                  :
                  null
              ]
            )
              :
              <DeviceManager setCurrentDeviceName={setCurrentDeviceName} tabs_data={(devices.filter(device => device.device_name === currDeviceName))[0]} credentials={credentials} socket={socket} colorScheme={colorScheme} />
          )
          :
          <Login postCredentials={postCredentials} colorScheme={colorScheme} navigation={navigation} />
        }
      </SafeAreaView>
    );
  }



  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Homepage"
          component={Homepage}
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen name="Profile" component={Profile}
          options={{
            headerStyle: {
              backgroundColor: (colorScheme === 'dark') ? 'rgba(28, 28, 30, 1)' : 'rgba(242, 242, 247, 1)',
            },
            headerTintColor: (colorScheme === 'dark') ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen name="Help" component={Help}
          options={{
            headerStyle: {
              backgroundColor: (colorScheme === 'dark') ? 'rgba(28, 28, 30, 1)' : 'rgba(242, 242, 247, 1)',
            },
            headerTintColor: (colorScheme === 'dark') ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen name="Privacy Policy" component={PrivacyPolicy}
          options={{
            headerStyle: {
              backgroundColor: (colorScheme === 'dark') ? 'rgba(28, 28, 30, 1)' : 'rgba(242, 242, 247, 1)',
            },
            headerTintColor: (colorScheme === 'dark') ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />

        <Stack.Screen name="Settings" component={Settings}
          options={{
            headerStyle: {
              backgroundColor: (colorScheme === 'dark') ? 'rgba(28, 28, 30, 1)' : 'rgba(242, 242, 247, 1)',
            },
            headerTintColor: (colorScheme === 'dark') ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />

        <Stack.Screen name="Ultra Search" component={UltraSearch}
          options={{
            headerStyle: {
              backgroundColor: (colorScheme === 'dark') ? 'rgba(28, 28, 30, 1)' : 'rgba(242, 242, 247, 1)',
            },
            headerTintColor: (colorScheme === 'dark') ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
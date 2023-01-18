import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Profile from "./Profile";
import Help from "./Help";
import {
  useColorScheme,
} from "react-native";
import PrivacyPolicy from './PrivacyPolicy';
import Settings from './Settings';
import UltraSearch from './UltraSearch';
import UltraSearchResult from './UltraSearchResult';
import React, { useState, useEffect } from 'react';
import YourDevices from './YourDevices';
import { StateContext } from "./state_context";
import { io } from "socket.io-client";
import TermsDisclaimerUltraSearch from "./TermsDisclaimerUltraSearch";
import TrackersContacted from "./TrackersContacted";
import DeviceBrowserHistory from "./DeviceBrowserHistory";
import BrowserWindow from "./BrowserWindow";
import Login from './Login';
import TabsManager from './TabsManager';
import storage from "./utilities/storage";
import * as Haptics from 'expo-haptics';
import Report from './Report';
import Notifications from './Notifications';

const Stack = createStackNavigator();
const socket = io("https://continuitybrowser.com/api");


export default function () {
  const scheme = useColorScheme();
  const [colorScheme, setColorScheme] = useState(scheme);
  const [credentials, setCredentials] = useState(null);
  const [currDeviceName, setCurrentDeviceName] = useState(null);
  const [devices, setDevices] = useState([]);
  const [button_haptics, setButtonHaptics] = useState('none');
  const [canGoBackToYourDevices, setCanGoBackToYourDevices] = useState(true);

  useEffect(() => {
    (async () => {
      let buttonHaptics = await storage.get("button_haptics");
      if (buttonHaptics === Haptics.ImpactFeedbackStyle.Medium) {
        setButtonHaptics(buttonHaptics);
      }
      else {
        setButtonHaptics('none');
      }

      const color_scheme = await storage.get("color_scheme");
      if (color_scheme === 'dark' || color_scheme === 'light') {
        setColorScheme(color_scheme);
      }
    })();
  }, []);

  const headerOptions = {
    headerStyle: {
      backgroundColor: (colorScheme === 'dark') ? 'rgba(28, 28, 30, 1)' : 'rgba(242, 242, 247, 1)',
    },
    headerTintColor: (colorScheme === 'dark') ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  }

  return (
    <StateContext.Provider value={{ credentials, setCredentials, currDeviceName, setCurrentDeviceName, devices, setDevices, socket, colorScheme, setColorScheme, button_haptics, setButtonHaptics, canGoBackToYourDevices, setCanGoBackToYourDevices }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Your Devices">
          <Stack.Screen
            name="Your Devices"
            component={YourDevices}
            options={{ ...headerOptions, headerShown: (credentials !== null && credentials !== undefined) }}
          />

          <Stack.Screen
            name="Login"
            component={Login}
            options={{
              headerShown: false,
              animation: 'none',
              gestureEnabled: false
            }}
          />

          <Stack.Screen name="Profile" component={Profile}
            options={headerOptions}
          />
          <Stack.Screen name="Help" component={Help}
            options={headerOptions}
          />
          <Stack.Screen name="Privacy Policy" component={PrivacyPolicy}
            options={headerOptions}
          />

          <Stack.Screen name="Settings" component={Settings}
            options={headerOptions}
          />

          <Stack.Screen name="Ultra Search" component={UltraSearch}
            options={{ ...headerOptions, presentation: 'modal' }}
          />

          <Stack.Screen name="Ultra Search Results" component={UltraSearchResult}
            options={{ ...headerOptions, presentation: 'modal' }}
          />

          <Stack.Screen name="Ultra Search | Terms of Use and Disclaimer" component={TermsDisclaimerUltraSearch}
            options={headerOptions}
          />

          <Stack.Screen name="Trackers Contacted" component={TrackersContacted}
            options={{ ...headerOptions, presentation: 'modal' }}
          />

          <Stack.Screen name="Search History" component={DeviceBrowserHistory}
            options={headerOptions}
          />

          <Stack.Screen name="Browser" component={BrowserWindow}
            options={{ presentation: 'containedModal', headerShown: false }}
          />

          <Stack.Screen name="Tabs" component={TabsManager}
            options={{ ...headerOptions, gestureEnabled: canGoBackToYourDevices, headerLeft: null, headerRight: null, headerShown: canGoBackToYourDevices }}
          />

          <Stack.Screen name="Report" component={Report}
            options={headerOptions}
          />

          <Stack.Screen name="Notifications" component={Notifications}
            options={headerOptions}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </StateContext.Provider>
  );
}
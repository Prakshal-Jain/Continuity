import 'react-native-gesture-handler';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import Profile from "./Profile";
import Help from "./Help";
import {
  useColorScheme,
  Platform
} from "react-native";
import PrivacyPolicy from './PrivacyPolicy';
import Settings from './Settings';
import UltraSearch from './UltraSearch';
import PrivacyPrevention from "./PrivacyPrevention";
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
import Tutorial from './Tutorial';
import { privacy_domain_set } from "./utilities/list";

const Stack = createStackNavigator();
const socket = io("https://continuitybrowser.com");


export default function () {
  const scheme = useColorScheme();
  const [colorScheme, setColorScheme] = useState(scheme);
  const [credentials, setCredentials] = useState(null);
  const [currDeviceName, setCurrentDeviceName] = useState(null);
  const [devices, setDevices] = useState([]);
  const [button_haptics, setButtonHaptics] = useState('none');
  const [canGoBackToYourDevices, setCanGoBackToYourDevices] = useState(true);
  const [loginCurrStep, setLoginCurrStep] = useState(1);
  const [error, setError] = useState(null);

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

  const headerOptionsSlideFromRight = {
    headerStyle: {
      backgroundColor: (colorScheme === 'dark') ? 'rgba(28, 28, 30, 1)' : 'rgba(242, 242, 247, 1)',
    },
    headerTintColor: (colorScheme === 'dark') ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
    ...(Platform.OS === 'ios' ? {} : TransitionPresets.SlideFromRightIOS),
  }

  const headerOptionsModalSlideFromBottomIOS = {
    headerStyle: {
      backgroundColor: (colorScheme === 'dark') ? 'rgba(28, 28, 30, 1)' : 'rgba(242, 242, 247, 1)',
    },
    headerTintColor: (colorScheme === 'dark') ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
    presentation: 'modal',
    ...(Platform.OS === 'ios' ? {} : TransitionPresets.ModalSlideFromBottomIOS),
  }

  return (
    <StateContext.Provider value={{ credentials, setCredentials, currDeviceName, setCurrentDeviceName, devices, setDevices, socket, colorScheme, setColorScheme, button_haptics, setButtonHaptics, canGoBackToYourDevices, setCanGoBackToYourDevices, privacy_domain_set, error, setError, loginCurrStep, setLoginCurrStep }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Your Devices">
          <Stack.Screen
            name="Your Devices"
            component={YourDevices}
            options={{ ...headerOptionsSlideFromRight, headerShown: (credentials !== null && credentials !== undefined) }}
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
            options={headerOptionsSlideFromRight}
          />
          <Stack.Screen name="Help" component={Help}
            options={headerOptionsSlideFromRight}
          />
          <Stack.Screen name="Privacy Policy" component={PrivacyPolicy}
            options={headerOptionsSlideFromRight}
          />

          <Stack.Screen name="Settings" component={Settings}
            options={headerOptionsSlideFromRight}
          />

          <Stack.Screen name="Ultra Search" component={UltraSearch}
            options={headerOptionsModalSlideFromBottomIOS}
          />

          <Stack.Screen name="Privacy Prevention" component={PrivacyPrevention}
            options={headerOptionsModalSlideFromBottomIOS}
          />

          <Stack.Screen name="Ultra Search Results" component={UltraSearchResult}
            options={headerOptionsModalSlideFromBottomIOS}
          />

          <Stack.Screen name="Ultra Search | Terms of Use and Disclaimer" component={TermsDisclaimerUltraSearch}
            options={headerOptionsSlideFromRight}
          />

          <Stack.Screen name="Trackers Contacted" component={TrackersContacted}
            options={headerOptionsModalSlideFromBottomIOS}
          />

          <Stack.Screen name="Search History" component={DeviceBrowserHistory}
            options={headerOptionsSlideFromRight}
          />

          <Stack.Screen name="Tabs" component={TabsManager}
            options={{ ...headerOptionsSlideFromRight, gestureEnabled: canGoBackToYourDevices, headerLeft: null, headerRight: null, headerShown: canGoBackToYourDevices }}
          />

          <Stack.Screen name="Report" component={Report}
            options={headerOptionsSlideFromRight}
          />

          <Stack.Screen name="Notifications" component={Notifications}
            options={headerOptionsSlideFromRight}
          />

          <Stack.Screen name="Tutorial" component={Tutorial}
            options={{ ...headerOptionsSlideFromRight, headerLeft: null, headerRight: null }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar animated={true}
        barStyle={colorScheme == 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={(colorScheme === 'dark') ? 'rgba(28, 28, 30, 1)' : 'rgba(242, 242, 247, 1)'}
      />
    </StateContext.Provider>
  );
}
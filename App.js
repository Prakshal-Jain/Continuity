import React from 'react';
import { StyleSheet, SafeAreaView, View, StatusBar, KeyboardAvoidingView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Browser from './Browser';
import Tabs from './Tabs';


export default class App extends React.Component {
  state = {
    currOpenWindow: "browser",
  }

  switchCurrOpenWindow = (window) => {
    this.setState({ currOpenWindow: window });
  }

  routes = {
    "tabs": <Tabs />,
    "browser": <Browser switchCurrOpenWindow={this.switchCurrOpenWindow} />
  }

  render() {
    return (
      <SafeAreaView style={styles.root}>
        <KeyboardAvoidingView
          {...(Platform.OS === 'ios' ? { behavior: 'padding' } : {})}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            zIndex: 1,
          }}
        >
          <StatusBar animated={true} barStyle="dark-content" backgroundColor="#fff" />
          <View style={styles.browser}>
            {this.routes[this.state.currOpenWindow]}
          </View>


        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  browser: {
    flex: 1,
    flexDirection: 'row',
  },
  header: {
    height: 65,
    paddingTop: 25,
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 20
  },
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex'
  },
});
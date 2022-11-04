import React from 'react';
import { StyleSheet, SafeAreaView, View, StatusBar, KeyboardAvoidingView } from 'react-native';
import Browser from './Browser';
import Tabs from './Tabs';


export default class App extends React.Component {
  state = {
    currOpenTab: -1,
    tabs: [],
    id: 0,
    metadata: [],
  }

  componentDidMount() {
    // this.addNewTab("https://www.google.com");
  }

  switchCurrOpenWindow = (tabIdx) => {
    this.setState({ currOpenTab: tabIdx });
  }

  addNewTab = (url) => {
    const uniqueID = this.state.id;
    this.setState({
      id: uniqueID + 1,
      tabs: [
        ...this.state.tabs,
        <Browser switchCurrOpenWindow={this.switchCurrOpenWindow} url={url} id={uniqueID} key={uniqueID} metadata={this.state.metadata} />
      ]
    })
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
          {this.state.tabs.map((tab, index) => (
            <View style={{ ...styles.browser, display: this.state.currOpenTab === index ? 'block' : 'none' }} key={index}>
              {tab}
            </View>
          ))}
          {this.state.currOpenTab === -1 ? <Tabs tabs={this.state.tabs} addNewTab={this.addNewTab} switchCurrOpenWindow={this.switchCurrOpenWindow} metadata={this.state.metadata} /> : null}
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
  display_browser: {
    display: 'block',
  },
  hide_browser: {
    display: 'hide',
  }
});
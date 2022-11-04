import React from 'react';
import { StyleSheet, SafeAreaView, View, StatusBar, KeyboardAvoidingView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Browser from './Browser';
import Tabs from './Tabs';


export default class App extends React.Component {
  state = {
    currOpenTab: -1,
    tabs: {},
    metadata: {},
    id: 0,
  }

  componentDidMount() {
    this.addNewTab("http://www.google.com")
  }

  switchCurrOpenWindow = (tabIdx) => {
    this.setState({ currOpenTab: tabIdx });
  }

  addMetaData = (id, metadata) => {
    if (id in this.state.tabs) {
      this.setState({
        metadata: {
          ...this.state.metadata,
          [id]: metadata
        }
      })
    }
  }

  addNewTab = (url) => {
    const uniqueID = this.state.id;
    this.setState({
      id: uniqueID + 1,
      tabs: {
        ...this.state.tabs,
        [uniqueID]: <Browser switchCurrOpenWindow={this.switchCurrOpenWindow} url={url} id={uniqueID} key={uniqueID} addMetaData={this.addMetaData} />
      }
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
          <View style={styles.browser}>
            {this.state.currOpenTab === -1 ? <Tabs tabs={this.state.tabs} switchCurrOpenWindow={this.switchCurrOpenWindow} metadata={this.state.metadata} /> : this.state.tabs[this.state.currOpenTab]}
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
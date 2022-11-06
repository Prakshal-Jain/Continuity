import React from 'react';
import { StyleSheet, View } from 'react-native';
import Browser from './Browser';
import Tabs from './Tabs';

export default class DeviceManager extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currOpenTab: -1,
            tabs: new Map(),
            id: 0,
            metadata: new Map(),
            device_name: this.props.tabs_data.device_name,
            device_type: this.props.tabs_data.device_type,
        }
    }

    componentDidMount = () => {
        const metadata_list = Object.entries(this.props.tabs_data.tabs);
        if(metadata_list.length === 0){
            return
        }
        const tabs = metadata_list.map(([key, metadata]) => [key, <Browser switchCurrOpenWindow={this.switchCurrOpenWindow} url={metadata.url} id={key} key={key} metadata={this.state.metadata} />])
        const id = (metadata_list.reduce((a, b) => a[1] > b[1] ? a : b, 0)[0]) + 1
        this.setState({metadata: new Map(metadata_list), tabs: new Map(tabs), id: id});
    }

    switchCurrOpenWindow = (tabIdx) => {
        this.setState({ currOpenTab: tabIdx });
    }

    addNewTab = (url) => {
        const uniqueID = this.state.id;
        this.setState({
            id: uniqueID + 1,
            tabs: new Map([
                ...this.state.tabs,
                [uniqueID, <Browser switchCurrOpenWindow={this.switchCurrOpenWindow} url={url} id={uniqueID} key={uniqueID} metadata={this.state.metadata} />]
            ])
        }, () => {
            this.switchCurrOpenWindow(uniqueID);
        })
    }

    deleteAllTabs = () => {
        this.setState({
            currOpenTab: -1,
            tabs: new Map(),
            id: 0,
            metadata: new Map(),
        })
    }

    renderTabs = () => {
        const tabs = [];
        for (const [key, tab] of this.state.tabs) {
            const display_obj = {}
            if (this.state.currOpenTab !== key) {
                display_obj['display'] = 'none';
            }

            tabs.push(
                <View style={{ ...styles.browser, ...display_obj }} key={key}>
                    {tab}
                </View>)
        }
        return tabs
    }

    removeTab = (id) => {
        if (this.state.tabs.has(id)) {
            const newMap = this.state.tabs;
            newMap.delete(id);
            this.setState({ tabs: newMap });
        }
        if (this.state.metadata.has(id)) {
            const newMap = this.state.metadata;
            newMap.delete(id);
            this.setState({ metadata: newMap });
        }
    }

    render() {
        return (
            <View>
                {this.renderTabs()}
                {this.state.currOpenTab === -1 ? <Tabs tabs={this.state.tabs} addNewTab={this.addNewTab} switchCurrOpenWindow={this.switchCurrOpenWindow} metadata={this.state.metadata} deleteAllTabs={this.deleteAllTabs} removeTab={this.removeTab} setCurrentDeviceName={this.props.setCurrentDeviceName} device_name={this.state.device_name} device_type={this.state.device_type} /> : null}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    browser: {
        flex: 1,
        flexDirection: 'row',
    },
    display_browser: {
        display: 'block',
    },
    hide_browser: {
        display: 'hide',
    }
});
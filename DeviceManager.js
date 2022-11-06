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
        }
    }

    componentDidMount = () => {
        this.props.socket.emit("get_my_tabs", { "user_id": this.props.credentials.user_id, "device_name": this.props.tabs_data.device_name })

        this.props.socket.on("get_my_tabs", (data) => {
            const metadata_list = Object.entries(data).map(([key, value]) => [Number(key), value]);
            const tabs = metadata_list.map(([key, metadata]) => [key, <Browser switchCurrOpenWindow={this.switchCurrOpenWindow} url={metadata.url} id={key} key={key} metadata={this.state.metadata} socket={this.props.socket} update_tab_data={{ 'user_id': this.props.credentials.user_id, 'device_name': this.props.tabs_data.device_name }} />])
            const id = metadata_list.length === 0 ? 0 : (Number(metadata_list.reduce((a, b) => a[1] > b[1] ? a : b, 0)[0]) + 1);
            this.setState({ metadata: new Map(metadata_list), tabs: new Map(tabs), id: id });
        })

        this.props.socket.on('add_tab', (data) => {
            if (data.device_name !== this.props.tabs_data.device_name) {
                return
            }
            const metadata_list = Object.entries(data.tabs_data).map(([key, value]) => [Number(key), value]);
            const idx = metadata_list[0][0]
            const metadata = this.state.metadata;
            const tabs = this.state.tabs;
            const to_add = data.tabs_data[String(idx)];
            const id = metadata_list.length === 0 ? 0 : (Number(metadata_list.reduce((a, b) => a[1] > b[1] ? a : b, 0)[0]) + 1);
            metadata.set(idx, to_add);
            tabs.set(idx, <Browser switchCurrOpenWindow={this.switchCurrOpenWindow} url={to_add.url} id={idx} key={idx} metadata={this.state.metadata} socket={this.props.socket} update_tab_data={{ 'user_id': this.props.credentials.user_id, 'device_name': this.props.tabs_data.device_name }} />)
            this.setState({ tabs: tabs, metadata: metadata, id: id })
        });

        this.props.socket.on('update_tab', (data) => {
            if (data.device_name !== this.props.tabs_data.device_name) {
                return
            }

            const metadata_list = Object.entries(data.tabs_data).map(([key, value]) => [Number(key), value]);
            const idx = metadata_list[0][0]
            const metadata = this.state.metadata;
            const tabs = this.state.tabs;
            const to_add = data.tabs_data[String(idx)];
            const id = metadata_list.length === 0 ? 0 : (Number(metadata_list.reduce((a, b) => a[1] > b[1] ? a : b, 0)[0]) + 1);
            metadata.set(idx, to_add);
            tabs.set(idx, <Browser switchCurrOpenWindow={this.switchCurrOpenWindow} url={to_add.url} id={idx} key={idx} metadata={this.state.metadata} socket={this.props.socket} update_tab_data={{ 'user_id': this.props.credentials.user_id, 'device_name': this.props.tabs_data.device_name }} />)
            this.setState({ tabs: tabs, metadata: metadata, id: id })
        });

        this.props.socket.on('remove_all_tabs', (data) => {
            if (data.device_name !== this.props.tabs_data.device_name) {
                return
            }

            this.setState({
                currOpenTab: -1,
                tabs: new Map(),
                id: 0,
                metadata: new Map(),
            })
        })
    }

    switchCurrOpenWindow = (tabIdx) => {
        this.setState({ currOpenTab: tabIdx });
    }

    addNewTab = (url) => {
        const uniqueID = this.state.id;
        this.setState({
            id: Number(uniqueID) + 1,
            tabs: new Map([
                ...this.state.tabs,
                [uniqueID, <Browser switchCurrOpenWindow={this.switchCurrOpenWindow} url={url} id={uniqueID} key={uniqueID} metadata={this.state.metadata} socket={this.props.socket} update_tab_data={{ 'user_id': this.props.credentials.user_id, 'device_name': this.props.tabs_data.device_name }} />]
            ])
        }, () => {
            const d = { "user_id": this.props.credentials.user_id, "device_name": this.props.tabs_data.device_name, "tabs_data": { [uniqueID]: { "title": "Google", "url": "https://www.google.com/" } } };
            this.props.socket.emit("add_tab", d)
            this.switchCurrOpenWindow(uniqueID);
        })
    }

    deleteAllTabs = () => {
        this.props.socket.emit("remove_all_tabs", { 'user_id': this.props.credentials.user_id, 'device_name': this.props.tabs_data.device_name, 'tabs_data': { 0: 'link_1_updated' } });
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
                {this.state.currOpenTab === -1 ? <Tabs tabs={this.state.tabs} addNewTab={this.addNewTab} switchCurrOpenWindow={this.switchCurrOpenWindow} metadata={this.state.metadata} deleteAllTabs={this.deleteAllTabs} removeTab={this.removeTab} setCurrentDeviceName={this.props.setCurrentDeviceName} device_name={this.props.tabs_data.device_name} device_type={this.state.device_type} /> : null}
            </View >
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
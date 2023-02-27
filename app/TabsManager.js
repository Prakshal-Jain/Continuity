import React from 'react';
import { StyleSheet, View, Animated, SafeAreaView } from 'react-native';
import Tabs from './Tabs';
import { StateContext } from "./state_context";
import BrowserWindow from './BrowserWindow';
import storage from './utilities/storage';

class TabsManager extends React.Component {
    static contextType = StateContext;
    constructor(props) {
        super(props);
        this.state = {
            currOpenTab: -1,
            tabs: new Map(),
            id: 0,
            metadata: new Map(),
            tabs_data: null,
            loading: true,
            isIncognitoView: false
        }
    }


    componentDidMount() {
        this.setState({ tabs_data: this?.context?.devices.filter(device => device.device_name === this?.context?.currDeviceName)[0], loading: true }, () => {
            this?.context?.socket.emit("get_my_tabs", { "user_id": this?.context?.credentials?.user_id, "device_name": this?.context?.credentials?.device_name, "device_token": this?.context?.credentials?.device_token, "target_device": this.state.tabs_data?.device_name })
        })

        this?.context?.socket.on("get_my_tabs", async (data) => {
            if (data?.successful === true) {
                const metadata_list = [];
                for(const key in data?.message){
                    const value = data?.message[key];
                    const img_data = await storage.get(`${this.state.tabs_data?.device_name}_${key}`);
                    metadata_list.push([Number(key), { thumbnail: img_data, ...value }]);
                }

                const id = metadata_list.length === 0 ? 0 : ((metadata_list.reduce((a, b) => a[1] > b[1] ? a : b, 0)[0]) + 1);
                this.setState({ metadata: new Map(metadata_list), id: id, loading: false }, () => {
                    if (this.props?.route?.params?.url !== undefined && this.props?.route?.params?.url !== null) {
                        this.addNewTab(this.props?.route?.params?.url);
                    }
                });
                this?.context?.setError(null);
            }
            else {
                this.setState({ loading: false }, () => {
                    if (this.props?.route?.params?.url !== undefined && this.props?.route?.params?.url !== null) {
                        this.addNewTab(this.props?.route?.params?.url);
                    }
                });
                this?.context?.setError({ message: data?.message, type: data?.type, displayPages: new Set(["Tabs"]) });
            }
        })

        this?.context?.socket.on('add_tab', async (data) => {
            if (data?.successful === true) {
                if (data?.message?.target_device !== this.state.tabs_data?.device_name) {
                    return
                }
                const metadata_list = Object.entries(data?.message?.tabs_data).map(([key, value]) => [Number(key), value]);
                const idx = metadata_list[0][0];
                const metadata = this.state.metadata;
                const to_add = data?.message?.tabs_data[String(idx)];
                const id = metadata_list.length === 0 ? 0 : (Number(metadata_list.reduce((a, b) => a[1] > b[1] ? a : b, 0)[0]) + 1);
                metadata.set(idx, to_add);
                this.setState({
                    metadata: metadata,
                    id: id,
                });
                this?.context?.setError(null);
                await storage.remove(`${this.state.tabs_data?.device_name}_${idx}`);
            }
            else {
                this?.context?.setError({ message: data?.message, type: data?.type, displayPages: new Set(["Tabs"]) });
            }
        });

        this?.context?.socket.on('update_tab', async (data) => {
            if (data?.successful === true) {
                if (data?.message?.target_device !== this.state.tabs_data?.device_name) {
                    return
                }

                const metadata_list = Object.entries(data?.message?.tabs_data).map(([key, value]) => [Number(key), value]);
                const idx = metadata_list[0][0]

                const metadata = this.state.metadata;
                const to_add = data?.message?.tabs_data[String(idx)];
                const id = metadata_list.length === 0 ? 0 : (Number(metadata_list.reduce((a, b) => a[1] > b[1] ? a : b, 0)[0]) + 1);
                metadata.set(idx, to_add);
                this.setState({ metadata: metadata, id: id })

                // Check if the updated index exist in the tabs map, and NOT in use            
                if (this.state.tabs.has(idx) && idx !== this.state.currOpenTab) {
                    const tabs_backup = this.state.tabs;
                    tabs_backup.delete(idx);
                    this.setState({ tabs: tabs_backup });
                }
                this?.context?.setError(null);

                await storage.remove(`${this.state.tabs_data?.device_name}_${idx}`);
            }
            else {
                this?.context?.setError({ message: data?.message, type: data?.type, displayPages: new Set(["Tabs"]) });
            }
        });

        this?.context?.socket.on('remove_all_tabs', async (data) => {
            if (data?.successful === true) {
                if (data?.message?.target_device !== this.state.tabs_data?.device_name) {
                    return
                }

                const metadata_keys = this.state.metadata?.keys();

                this.setState({
                    currOpenTab: -1,
                    tabs: new Map(),
                    id: 0,
                    metadata: new Map(),
                })
                this?.context?.setError(null);

                for (const key of metadata_keys) {
                    await storage.remove(`${this.state.tabs_data?.device_name}_${key}`);
                }
            }
            else {
                this?.context?.setError({ message: data?.message, type: data?.type, displayPages: new Set(["Tabs"]) });
            }
        })

        this?.context?.socket.on('remove_tab', (data) => {
            if (data?.successful === true) {
                data.message.id = Number(data?.message?.id);
                if (data?.message?.target_device !== this.state.tabs_data?.device_name) {
                    return
                }

                const metadata = this.state.metadata;
                const tabs = this.state.tabs;

                if (metadata.has(data?.message?.id)) {
                    metadata.delete(data?.message?.id);
                }
                if (tabs.has(data?.message?.id)) {
                    if (data?.message?.id === this.state.currOpenTab) {
                        this.setState({ currOpenTab: -1 }, () => {
                            tabs.delete(data?.message?.id);
                        })
                    }
                }

                this.setState({ metadata: metadata, tabs: tabs });
                this?.context?.setError(null);
            }
            else {
                this?.context?.setError({ message: data?.message, type: data?.type, displayPages: new Set(["Tabs"]) });
            }
        })
    }

    updateScreenshot = async (device_name, id, img_data) => {
        if (this.state.tabs_data.device_name === device_name && this.state.metadata.has(id)) {
            // TODO --> Save the screenshot (img_data) here and update the metadata
            this.state.metadata?.set(id, { thumbnail: img_data, ...this.state.metadata.get(id) });
            await storage.set(`${device_name}_${id}`, img_data);
        }
    }

    switchCurrOpenWindow = (tabIdx) => {
        if (tabIdx !== -1) {
            if (!this.state.tabs.has(tabIdx)) {
                const tabs = this.state.tabs;

                tabs.set(tabIdx, {
                    browser: <BrowserWindow url={(this.state.metadata?.get(tabIdx))?.url} incognito={(this.state.metadata?.get(tabIdx))?.is_incognito} setMetaData={(value) => this.setState({ metadata: value })} switchCurrOpenWindow={this.switchCurrOpenWindow} id={tabIdx} key={tabIdx} metadata={this.state.metadata} target_device={this.state.tabs_data?.device_name} navigation={this.props?.navigation} updateScreenshot={this.updateScreenshot} />,
                    animation: new Animated.Value(0),
                })

                this.setState({ tabs: tabs, currOpenTab: tabIdx }, () => {
                    Animated.timing(this.state.tabs?.get(tabIdx)?.animation, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }).start();
                });
            }
            else {
                this.setState({ currOpenTab: tabIdx }, () => {
                    Animated.timing(this.state.tabs?.get(tabIdx)?.animation, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }).start();
                })
            }

            this?.context?.setCanGoBackToYourDevices(false);
        }
        else {
            Animated.timing(this.state.tabs?.get(this.state.currOpenTab)?.animation, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                this.setState({ currOpenTab: tabIdx });
            });
            this?.context?.setCanGoBackToYourDevices(true);
        }
    }

    addNewTab = (url, isIncognito) => {
        const uniqueID = this.state.id;
        const item_metadata = { "title": isIncognito ? "Incognito" : 'Google', "url": url, "is_incognito": isIncognito };
        const metadataBackup = this.state.metadata;
        metadataBackup?.set(uniqueID, item_metadata)

        const tabsBackup = this.state.tabs;
        tabsBackup?.set(uniqueID, {
            browser: <BrowserWindow url={url} incognito={isIncognito} setMetaData={(value) => this.setState({ metadata: value })} switchCurrOpenWindow={this.switchCurrOpenWindow} id={uniqueID} key={uniqueID} metadata={this.state.metadata} target_device={this.state.tabs_data?.device_name} navigation={this.props?.navigation} updateScreenshot={this.updateScreenshot} />,
            animation: new Animated.Value(0),
        });

        this.setState({
            id: Number(uniqueID) + 1,
            metadata: metadataBackup,
            tabs: tabsBackup
        }, () => {
            const d = { "user_id": this?.context?.credentials.user_id, "device_name": this?.context?.credentials?.device_name, "device_token": this?.context?.credentials?.device_token, "target_device": this.state.tabs_data?.device_name, "tabs_data": { [uniqueID]: item_metadata } };
            this?.context?.socket.emit("add_tab", d);
            this.switchCurrOpenWindow(uniqueID);
        })
    }

    deleteAllTabs = () => {
        this?.context?.socket.emit("remove_all_tabs", { 'user_id': this?.context?.credentials.user_id, 'device_name': this?.context?.credentials?.device_name, "device_token": this?.context?.credentials?.device_token, "target_device": this.state.tabs_data?.device_name, 'tabs_data': { 0: 'link_1_updated' } });
        this.setState({
            currOpenTab: -1,
            tabs: new Map(),
            id: 0,
            metadata: new Map(),
        })
    }

    renderTabs = () => {
        const tabs = [];
        for (const [key, { browser, animation }] of this.state.tabs) {
            tabs.push(
                <Animated.View style={[styles.browser, { display: (this.state.currOpenTab !== key) ? 'none' : undefined, transform: [{ scale: animation }], opacity: animation }]} key={key}>
                    {browser}
                </Animated.View>)
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
            this?.context?.socket.emit("remove_tab", { "user_id": this?.context?.credentials.user_id, "device_name": this?.context?.credentials?.device_name, 'id': id, "device_token": this?.context?.credentials?.device_token, "target_device": this.state.tabs_data?.device_name });
        }
    }

    refreshTabs = () => {
        this.setState({ loading: true }, () => {
            this?.context?.socket.emit("get_my_tabs", { "user_id": this?.context?.credentials?.user_id, "device_name": this?.context?.credentials?.device_name, "device_token": this?.context?.credentials?.device_token, "target_device": this.state.tabs_data?.device_name });
        })
    }

    render() {
        return (
            <SafeAreaView style={[styles.root, { backgroundColor: (this?.context?.colorScheme === 'dark') ? 'rgba(28, 28, 30, 1)' : 'rgba(242, 242, 247, 1)' }]}>
                {
                    (this.state.tabs_data !== null && this.state.tabs_data !== undefined) && (
                        <View style={{ flex: 1 }}>
                            {this.renderTabs()}
                            {this.state.currOpenTab === -1 ? <Tabs tabs={this.state.tabs} addNewTab={this.addNewTab} switchCurrOpenWindow={this.switchCurrOpenWindow} metadata={this.state.metadata} deleteAllTabs={this.deleteAllTabs} removeTab={this.removeTab} device_name={this.state.tabs_data.device_name} device_type={this.state.tabs_data.device_type} refreshTabs={this.refreshTabs} loading={this.state.loading} navigation={this.props?.navigation} isIncognitoView={this.state.isIncognitoView} setIsIncognitoView={(value) => this.setState({ isIncognitoView: value })} route_name={this.props?.route?.name} /> : null}
                        </View>
                    )
                }
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        justifyContent: 'center',
        display: 'flex',
    },
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


export default TabsManager;
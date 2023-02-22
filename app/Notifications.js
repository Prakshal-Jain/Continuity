import { StateContext } from "./state_context";
import { SafeAreaView, StatusBar, StyleSheet, ScrollView, Text, View, TouchableOpacity, Image, RefreshControl } from "react-native";
import React, { Component } from "react";
import Loader from "./components/Loader";
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import UnifiedError from "./components/UnifiedError";

/*
Sample Notification structure:
{"title": "Check Out Our Website", "description": "is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.", "action_type": "link", "target": "https://continuitybrowser.com/", "image": "https://continuitybrowser.com/assets/logo-light.png"}
*/


const NotificationContainer = ({ id, message: { description, title, image = null }, colorScheme, getActionFunction }) => (
    <TouchableOpacity
        style={[styles.notification_container, { backgroundColor: (colorScheme === 'dark') ? 'rgba(58, 58, 60, 1)' : 'rgba(209, 209, 214, 1)', borderColor: (colorScheme === 'dark') ? 'rgba(72, 72, 74, 1)' : 'rgba(199, 199, 204, 1)' }]}
        onPress={getActionFunction}>
        {image && (
            <Image style={styles.image} source={{ uri: image }} />
        )}
        <View style={{ flex: 1, marginRight: 10 }}>
            {title && <Text style={[styles.title, { color: (colorScheme === 'dark') ? '#fff' : '#000' }]}>{title}</Text>}
            {description && <Text style={[styles.description, { color: colorScheme === 'dark' ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)' }]} numberOfLines={2}>{description}</Text>}
        </View>
        <FontAwesome name="angle-right" size={25} color={(colorScheme === 'dark') ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)'} />
    </TouchableOpacity>
)


class Notifications extends Component {
    static contextType = StateContext;
    constructor(props) {
        super(props);

        this.state = {
            notifications: null,
            loading: true,
        }
    }

    navigation = this.props?.navigation;

    componentDidMount = () => {
        this?.context?.socket.on('get_notification', (data) => {
            if (data?.successful === true) {
                this.setState({ notifications: data?.message, loading: false });
                this?.context?.setError(null);
            }
            else {
                this?.context?.setError({ message: data?.message, type: data?.type, displayPages: new Set(["Notifications"]) });
                this.setState({ loading: false })
            }
        });

        this?.context?.socket.on('ack_notification', (data) => {
            if (data?.successful !== true) {
                this?.context?.setError({ message: data?.message, type: data?.type, displayPages: new Set(["Notifications"]) });
            }
            else {
                this?.context?.setError(null);
            }
        });

        this?.context?.socket.emit("get_notification", { user_id: this?.context?.credentials?.user_id, device_token: this?.context?.credentials?.device_token, device_name: this?.context?.credentials?.device_name })
    }

    getActionFunction = (notification_id, action_type, target) => {
        const message = { user_id: this?.context?.credentials?.user_id, id: notification_id, device_token: this?.context?.credentials?.device_token, device_name: this?.context?.credentials?.device_name };
        if (action_type === 'redirect') {
            return () => {
                // Emit ACK for reading the message
                this?.context?.socket.emit("ack_notification", message);
                this?.props?.navigation?.navigate(target);

                this.setState({
                    notifications: this.state.notifications?.filter(({ id }) => id !== notification_id)
                })
            };
        }
        else if (action_type === 'link') {
            // Open a browser tab here
            return () => {
                // Emit ACK for reading the message

                this?.context?.socket.emit("ack_notification", message);

                this.setState({
                    notifications: this.state.notifications?.filter(({ id }) => id !== notification_id)
                })

                this?.context?.setCurrentDeviceName(this?.context?.credentials?.device_name);
                this?.props?.navigation?.navigate("Tabs", { 'url': target });
            }
        }
        else {
            return () => {
                // Emit ACK for reading the message
                this?.context?.socket.emit("ack_notification", message);

                this.setState({
                    notifications: this.state.notifications?.filter(({ id }) => id !== notification_id)
                })
            }
        }
    }

    render() {
        return (
            <SafeAreaView style={[styles.root, { backgroundColor: (this?.context?.colorScheme === 'dark') ? 'rgba(28, 28, 30, 1)' : 'rgba(242, 242, 247, 1)' }]}>
                <ScrollView
                    style={{ width: '100%', flex: 1, padding: 20 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.loading}
                            onRefresh={() => this?.context?.socket.emit("get_notification", { user_id: this?.context?.credentials?.user_id, device_token: this?.context?.credentials?.device_token, device_name: this?.context?.credentials?.device_name })}
                            tintColor={this?.context?.colorScheme == 'dark' ? "rgba(209, 209, 214, 1)" : 'rgba(58, 58, 60, 1)'}
                        />
                    }
                >
                    <UnifiedError currentPage={this.props?.route?.name} />
                    {this.state.loading ? <Loader message="Gathering all your notifications..." showActivityIndicator={false} /> : (
                        <>
                            <Text style={{ color: (this?.context?.colorScheme === 'dark') ? 'rgba(209, 209, 214, 1)' : 'rgba(58, 58, 60, 1)', textAlign: "center", fontSize: 13, marginBottom: 15 }}>Pull to sync with other devices</Text>
                            {(this.state.notifications === null || this.state.notifications === undefined || this.state.notifications?.length === 0)
                                ?
                                <Text style={{ marginVertical: 10, textAlign: "center", color: this?.context?.colorScheme === 'dark' ? 'rgba(174, 174, 178, 1)' : 'rgba(99, 99, 102, 1)', }}>Woohoo! No new notifications yet.</Text>
                                :
                                this.state.notifications.map((notification) => (
                                    <View key={notification?.id}>
                                        <NotificationContainer {...notification} colorScheme={this?.context?.colorScheme} getActionFunction={this.getActionFunction(notification?.id, notification?.message?.action_type, notification?.message?.target)} />
                                    </View>
                                ))
                            }
                        </>
                    )}
                    <View style={{ marginVertical: 20 }} />
                </ScrollView>
            </SafeAreaView>
        )
    }
}


const styles = StyleSheet.create({
    root: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex',
    },

    notification_container: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        marginVertical: 15,
        flexDirection: "row",
        alignItems: "center"
    },

    title: {
        fontSize: 17,
        fontWeight: 'bold',
        marginBottom: 5
    },

    description: {
        fontSize: 15,
    },

    image: {
        width: 50,
        height: 50,
        resizeMode: 'contain',
        marginRight: 15,
        borderRadius: 10,
    }
});

export default Notifications;
// socket.onopen = (event) => {
//     console.log('Connection Established');
// };

// socket.onclose = (event) => {
//     console.log('Connection Closed');
// }

// socket.onmessage = (event) => {
//     console.log(event);
// }


// Get tab URL
// chrome.tabs.onUpdated.addListener(async function (id) {
//     const tab_url = await chrome.tabs.get(id);
//     console.log(tab_url);
// })


// For adding a new tab
// chrome.tabs.create({
//     url: "https://linkedin.com/",
// })


// For creating new window with multiple tabs
// chrome.windows.create({
//     url: ["https://linkedin.com/", "https://github.com/"],
// })


// For creating new window with single tab
// chrome.windows.create({
//     url: ["https://linkedin.com/", "https://github.com/"],
// })


// Get user info
// let profile = {};
// chrome.identity.getProfileUserInfo().then(function (userInfo) {
//     profile = userInfo;
// },
//     (err) => console.log(err)
// )


// Storage
// chrome.storage.local.set({ 'token': Math.random() });
// chrome.storage.local.get('token', (data) => {
//     console.log(data);
// });
// chrome.storage.local.remove('token', (data) => {
//     console.log(data);
// });


// Privacy tracker --> TODO


const EXTENSION_DEVICE_DETAILS_PAGE = 'https://continuitybrowser.com/api/extension_device_details';


function generateRandomIntegerInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const device_to_windowid_map = new Map();
const windowid_to_device_map = new Map();
const tab_ids = new Map();

const methods = {
    "open_tab": async ({ is_incognito = false, unique_tab_id, url, title, window_id, target_device_type }, sendResponse, sender) => {
        if (device_to_windowid_map.has(window_id)) {
            const id = device_to_windowid_map.get(window_id);
            chrome.windows.getAll({ populate: false, windowTypes: ['normal'] }, async function (windows) {
                const idx = windows.findIndex((w) => w?.id === id);
                if (idx !== -1) {
                    const tab = await chrome.tabs.create({ url, windowId: id });
                    tab_ids.set(tab.id, {
                        unique_tab_id: unique_tab_id ?? tab.id,
                        url: tab.pendingUrl,
                        title,
                        is_incognito
                    });
                    chrome.windows.update(id, {
                        focused: true
                    });
                }
                else {
                    // Clear the unfound window data
                    device_to_windowid_map.delete(window_id);
                    windowid_to_device_map.delete(id);

                    // window was closed. Open a new window
                    const window = await chrome.windows.create({ url: [`${EXTENSION_DEVICE_DETAILS_PAGE}?device_name=${window_id}&device_type=${target_device_type}`, url], incognito: is_incognito });
                    for (const tab of window.tabs) {
                        tab_ids.set(tab.id, {
                            unique_tab_id: (tab.pendingUrl.includes(EXTENSION_DEVICE_DETAILS_PAGE) ? tab.id : unique_tab_id) ?? tab.id,
                            url: tab.pendingUrl,
                            title: tab.pendingUrl.includes(EXTENSION_DEVICE_DETAILS_PAGE) ? "Continuity | Device Details" : title,
                            is_incognito: tab.incognito
                        });
                    }
                    device_to_windowid_map.set(window_id, window?.id);
                    windowid_to_device_map.set(window?.id, window_id);
                }
            })
        }
        else {
            const window = await chrome.windows.create({ url: [`${EXTENSION_DEVICE_DETAILS_PAGE}?device_name=${window_id}&device_type=${target_device_type}`, url], incognito: is_incognito });
            for (const tab of window.tabs) {
                tab_ids.set(tab.id, {
                    unique_tab_id: (tab.pendingUrl.includes(EXTENSION_DEVICE_DETAILS_PAGE) ? tab.id : unique_tab_id) ?? tab.id,
                    url: tab.pendingUrl,
                    title: tab.pendingUrl.includes(EXTENSION_DEVICE_DETAILS_PAGE) ? "Continuity | Device Details" : title,
                    is_incognito: tab.incognito
                });
            }
            device_to_windowid_map.set(window_id, window?.id);
            windowid_to_device_map.set(window?.id, window_id);
        }
    },

    "login": async ({ curr_device }) => {
        const window = await chrome.windows.getCurrent();
        const window_id = window.id;

        if (!device_to_windowid_map.has(curr_device)) {
            device_to_windowid_map.set(curr_device, window_id);
        }

        if (!windowid_to_device_map.has(window_id)) {
            windowid_to_device_map.set(window_id, curr_device);
        }
    }
}


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (methods[request?.type] !== undefined && methods[request?.type] !== null) {
        methods[request?.type](request?.data, sendResponse, sender);
    }
});


// Buffer for closed tabs
let closedTabs = [];

chrome.tabs.onRemoved.addListener(async function (tabId, { isWindowClosing }) {
    // if (!isWindowClosing) {
    //     const window = await chrome.windows.getCurrent();
    //     const window_id = window.id;
    //     const { device_name, device_token, user_id } = chrome.storage.local.get(['device_name', 'device_token', 'user_id'])
    //     if (windowid_to_device_map.has(window_id) && tab_ids.has(tabId)) {
    //         const [curr_device, closed_tab_id] = [windowid_to_device_map.get(window_id), tab_ids.get(tabId).unique_tab_id];

    //         // Filter to only delete tabs for current devide (from which logged in!)
    //         if (curr_device !== device_name) {
    //             return;
    //         }

    //         const message = {
    //             event_name: 'remove_tab',
    //             data: {
    //                 device_name,
    //                 device_token,
    //                 user_id,
    //                 target_device: curr_device,
    //                 id: closed_tab_id
    //             }
    //         }

    //         const tabs = await chrome.tabs.query({ active: true, currentWindow: true, status: "complete" });
    //         const processing_tab = tabs[0];
    //         // MAYBE need to check if windowid is the same?
    //         await chrome.tabs.sendMessage(processing_tab.id, message);
    //         tab_ids.delete(tabId);
    //     }
    // }
    // else {
    //     closedTabs.push(tabId);
    // }
    tab_ids.delete(tabId);
})

chrome.windows.onRemoved.addListener(async function removedWindow(window_id) {
    // const { device_name, device_token, user_id } = await chrome.storage.local.get(['device_name', 'device_token', 'user_id']);

    // // Skip for other device. Only delete for current device
    // if ((!windowid_to_device_map.has(window_id)) || (windowid_to_device_map.get(window_id) !== device_name)) {
    //     return;
    // }


    // closedTabs = closedTabs.filter((tabId) => {
    //     if (tab_ids.has(tabId) && (!tab_ids.get(tabId).url.includes(EXTENSION_DEVICE_DETAILS_PAGE))) {
    //         return true;
    //     }
    //     else {
    //         return false;
    //     }
    // })

    // if (closedTabs.length === 0) {
    //     return;
    // }

    // const window = await chrome.windows.create({
    //     url: EXTENSION_DEVICE_DETAILS_PAGE,
    // })

    // chrome.windows.onRemoved.removeListener(removedWindow);

    // const curr_tabs = await chrome.tabs.query({ windowId: window.id });
    // const only_tab = curr_tabs[0];

    // let totalSent = 0;

    // for (const tabId of closedTabs) {
    //     if (windowid_to_device_map.has(window_id) && tab_ids.has(tabId)) {
    //         const message = {
    //             event_name: 'remove_tab',
    //             data: {
    //                 device_name,
    //                 device_token,
    //                 user_id,
    //                 target_device: windowid_to_device_map.get(window_id),
    //                 id: tab_ids.get(tabId).unique_tab_id
    //             }
    //         }

    //         totalSent += 1;

    //         chrome.tabs.sendMessage(only_tab.id, message, {}, async (m) => {
    //             console.log(m);
    //             totalSent -= 1;

    //             if (totalSent === 0) {
    //                 // await chrome.windows.remove(window.id);
    //                 // chrome.windows.onRemoved.addListener(removedWindow);
    //             }
    //         });
    //     }
    // }


    if (windowid_to_device_map.has(window_id)) {
        const device = windowid_to_device_map.get(window_id);
        device_to_windowid_map.delete(device);
        windowid_to_device_map.delete(window_id);
    }
})


// ============== Event listners ==============
chrome.tabs.onUpdated.addListener(function (tabid, changeinfo, tab) {
    const url = (tab.url.startsWith('http://') || tab.url.startsWith('https://')) ? tab.url : 'https://www.google.com';
    const title = (tab.url.startsWith('http://') || tab.url.startsWith('https://')) ? tab.title : 'Google Search';
    if (url !== undefined && changeinfo.status == "complete" && (!url.includes(EXTENSION_DEVICE_DETAILS_PAGE))) {
        chrome.storage.local.get(['device_name', 'device_token', 'user_id'], function ({ device_name, device_token, user_id }) {
            if (windowid_to_device_map.has(tab.windowId)) {
                // Window already exist for given device.
                if (tab_ids.has(tabid)) {
                    if (tab_ids.get(tabid).url !== url) {
                        // Tab is already added --> an update. Get the device and emit update!
                        tab_ids.get(tabid).url = url;
                        tab_ids.get(tabid).title = title;

                        const message = {
                            event_name: 'update_tab',
                            data: {
                                device_name,
                                device_token,
                                user_id,
                                target_device: windowid_to_device_map.get(tab.windowId),
                                tabs_data: {
                                    [tab_ids.get(tabid).unique_tab_id]: {
                                        url,
                                        title,
                                        is_incognito: tab_ids.get(tabid).is_incognito ?? false
                                    }
                                }
                            }
                        }

                        chrome.tabs.sendMessage(tabid, message)
                    }
                }
                else {
                    // New tab added to device. Create a new tab.
                    tab_ids.set(
                        tabid,
                        { unique_tab_id: tabid, url, title, is_incognito: tab.incognito }
                    );

                    const message = {
                        event_name: 'add_tab',
                        data: {
                            device_name,
                            device_token,
                            user_id,
                            target_device: windowid_to_device_map.get(tab.windowId),
                            tabs_data: {
                                [tab_ids.get(tabid).unique_tab_id]: {
                                    url,
                                    title,
                                    is_incognito: tab_ids.get(tabid).is_incognito ?? false
                                }
                            }
                        }
                    }

                    chrome.tabs.sendMessage(tabid, message)
                }
            }

            else {
                // Window doesn't exist for any device. Add these tabs to current (this) device!

                if (tab_ids.has(tabid)) {
                    if (tab_ids.get(tabid).url !== url) {
                        // Tab is already added --> an update. Get the device and emit update!

                        tab_ids.get(tabid).url = url;
                        tab_ids.get(tabid).title = title;

                        const message = {
                            event_name: 'update_tab',
                            data: {
                                device_name,
                                device_token,
                                user_id,
                                target_device: device_name,
                                tabs_data: {
                                    [tab_ids.get(tabid).unique_tab_id]: {
                                        url,
                                        title,
                                        is_incognito: tab_ids.get(tabid).is_incognito ?? false
                                    }
                                }
                            }
                        }

                        chrome.tabs.sendMessage(tabid, message)
                        // socket.send(message);
                    }
                }
                else {

                    tab_ids.set(
                        tabid,
                        { unique_tab_id: tabid, url, title, is_incognito: tab.incognito }
                    );

                    // New tab added to device. Create a new tab.
                    const message = {
                        event_name: 'add_tab',
                        data: {
                            device_name,
                            device_token,
                            user_id,
                            target_device: device_name,
                            tabs_data: {
                                [tab_ids.get(tabid).unique_tab_id]: {
                                    url,
                                    title,
                                    is_incognito: tab_ids.get(tabid).is_incognito ?? false
                                }
                            }
                        }
                    }

                    chrome.tabs.sendMessage(tabid, message)
                }

                windowid_to_device_map.set(tab.windowId, device_name);
                device_to_windowid_map.set(device_name, tab.windowId);
            }
        });
    }
})
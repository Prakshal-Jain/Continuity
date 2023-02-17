import "./websocket.js";
import { setup_login_page, render_loading_page, setup_verify_email_page, render_error } from "./pages.js";
import { throttle } from "./utilities.js";

// ============= Render Functions =============
function render_login_page() {
    setup_login_page();

    document.querySelector('.get_started')?.addEventListener('click', async () => {
        const curr_device = document.querySelector('.device_name').value;
        const d = await chrome.storage.local.get(['user_id']);

        socket.emit('login', {
            device_name: curr_device,
            device_type: document.querySelector('input[name="device_type"]:checked').id,
            user_id: d?.user_id
        });

        chrome.runtime.sendMessage({
            type: "login",
            data: {
                curr_device,
            }
        });
    })
}

function render_verify_email_page() {
    setup_verify_email_page();

    document.querySelector('.sign_in')?.addEventListener('click', async () => {
        const user_id = (document.querySelector('.email').value)?.trim();
        const d = { user_id };
        await chrome.storage.local.set(d);
        socket.emit('sign_in', d);
    })
}

function render_devices_page() {
    chrome.storage.local.get(['setup_tutorial'], async function (result) {
        if (result?.setup_tutorial === true) {
            setup_devices_page();
        }
        else {
            await chrome.storage.local.set({ setup_tutorial: true });
            render_setup_tutorial();
        }
    });

}
// =============================================




const socket = io.connect("https://continuitybrowser.com");
let all_devices = [];
let target_device = null;
let target_device_type = null;
const content_container = document.body;

socket.on('connect', async function () {
    chrome.storage.local.get(['user_id'], function (result) {
        socket.emit('sign_in', result);
    })
});

socket.on('disconnect', async function () {
    render_verify_email_page();
});

socket.on('sign_in', async (data) => {
    if (data?.successful === true) {
        const result = await chrome.storage.local.get(['device_name', 'device_token', 'user_id']);
        if (data?.message?.verified === true) {
            socket.emit('auto_authenticate', result);
        }
        else {
            render_verify_email_page();
            render_error(`A verification link has been sent to your email:<br/><b>${result?.user_id}</b>. <br/><br/>Please check for it and follow the instructions to verify your account.<br/><br/>Make sure to check your Spam folder if you cannot find the email in your inbox.`, "warning")
        }
    }
    else {
        all_devices = [];
        target_device = null;
        target_device_type = null;
        await chrome.storage.local.clear();
        render_verify_email_page();
    }
})

socket.on('login', async function (d) {
    if (d?.successful === true) {
        const data = d?.message;
        const to_save = { device_name: data?.device_name, device_token: data?.device_token, user_id: data?.user_id };
        await chrome.storage.local.set(to_save);
    }
    else {
        render_error(d?.message, d?.type);
    }
});

socket.on("logout", async function (data) {
    if (data?.successful === true) {
        await chrome.storage.local.clear();
        render_verify_email_page();
    }
    else {
        render_error(data?.message, data?.type);
    }
})

socket.on("auto_authenticate", async function (data) {
    if (data?.successful === true) {
        console.log(data);
    }
    else {
        render_login_page();
    }
});


socket.on("all_devices", function (data) {
    if (data?.successful === true) {
        all_devices = data?.message;
        render_devices_page();
    }
    else {
        render_error(data?.message, data?.type);
    }
});

socket.on("add_device", function (data) {
    if (data?.successful === true) {
        all_devices = [...all_devices, data?.message];
        setup_devices_page();
    }
    else {
        render_error(data?.message, data?.type);
    }
});

socket.on("get_my_tabs", (data) => {
    if (data?.successful === true) {
        render_tabs(data?.message);
    }
    else {
        render_error(data?.message, data?.type);
    }
});


socket.on('update_tab', (data) => {
    if (data?.successful === true) {
        if (data?.message?.target_device === target_device) {
            const updated_tab = Object.entries(data?.message?.tabs_data)[0];
            render_update_tab(updated_tab[0], updated_tab[1]);
        }
    }
    else {
        render_error(data?.message, data?.type);
    }
});

socket.on('add_tab', (data) => {
    if (data?.successful === true) {
        if (data?.message?.target_device === target_device) {
            const updated_tab = Object.entries(data?.message?.tabs_data)[0];
            render_update_tab(updated_tab[0], updated_tab[1]);
        }
    }
    else {
        render_error(data?.message, data?.type);
    }
});

socket.on('remove_tab', (data) => {
    if (data?.successful === true && data?.message?.target_device === target_device) {
        const id = data?.message?.id;
        document.getElementById(`device-${target_device}tab_id-${id}`)?.remove();
        if (document.getElementById(`tab_list-${target_device}`)?.children?.length === 0) {
            document.getElementById(`no_tabs-${target_device}`).appendChild(document.createTextNode(`No open tabs on device: ${target_device}.`));
        }
    }
    else {
        render_error(data?.message, data?.type);
    }
});

socket.on('remove_all_tabs', (data) => {
    if (data?.successful === true && data?.message?.target_device === target_device) {
        document.getElementById(`tab_list-${target_device}`).innerHTML = '';
        document.getElementById(`no_tabs-${target_device}`).innerHTML = '';
        document.getElementById(`no_tabs-${target_device}`).appendChild(document.createTextNode(`No open tabs on device: ${target_device}.`));
    }
    else {
        render_error(data?.message, data?.type);
    }
})

render_loading_page();

function setup_devices_page() {
    content_container.innerHTML = '';
    const heading_container = document.createElement('div');
    heading_container.classList.add('heading_container');
    const [headerLeft, headerRight] = [document.createElement('div'), document.createElement('div')];
    headerLeft.classList.add('header_parts', 'header_left');
    headerRight.classList.add('header_parts', 'header_right');

    const logo_link = document.createElement('a');
    logo_link.setAttribute('href', 'https://continuitybrowser.com/');
    logo_link.setAttribute('target', '_blank');
    const small_logo = document.createElement('div');
    small_logo.classList.add('small_logo');
    logo_link.appendChild(small_logo);
    headerLeft.appendChild(logo_link);
    heading_container.appendChild(headerLeft);

    const heading = document.createElement('div');
    heading.appendChild(document.createTextNode('Your Devices'));
    heading.classList.add('heading1')
    heading_container.appendChild(heading);


    const tutorial_icon = document.createElement('i');
    tutorial_icon.classList.add('fa', 'fa-map');
    tutorial_icon.style.fontSize = 'large';
    tutorial_icon.setAttribute('title', 'Device setup tutorial');
    tutorial_icon.onclick = () => {
        chrome.storage.local.get(['device_name', 'user_id'], function (result) {
            window.open(`http://continuitybrowser.com/sync_tutorial?email=${result?.user_id}&device_name=${result?.device_name}`, '_blank');
        })
    }
    tutorial_icon.style.color = 'rgba(40, 205, 65, 1)';
    tutorial_icon.style.cursor = 'pointer';
    headerRight.appendChild(tutorial_icon);

    const logout_icon = document.createElement('i');
    logout_icon.classList.add('fa', 'fa-sign-out');
    logout_icon.style.fontSize = 'x-large';
    logout_icon.style.marginLeft = '1rem';
    logout_icon.onclick = () => {
        chrome.storage.local.get(['device_name', 'device_token', 'user_id'], function (result) {
            const to_send = { "user_id": result?.user_id, "device_name": result?.device_name, "device_token": result?.device_token };
            socket.emit("logout", to_send);
        })
    }
    logout_icon.style.color = 'rgba(255, 45, 85, 1)';
    logout_icon.style.cursor = 'pointer';
    logout_icon.setAttribute('title', 'Logout');
    headerRight.appendChild(logout_icon);



    heading_container.appendChild(headerRight);
    content_container.appendChild(heading_container);


    const devices_wrapper = document.createElement('div');
    devices_wrapper.classList.add('devices_wrapper');
    chrome.storage.local.get('device_name', function (curr) {
        const curr_device = curr?.device_name;

        for (const { device_name, device_type } of all_devices) {
            const device_box = document.createElement('div');
            device_box.classList.add('device_box');
            device_box.setAttribute("id", device_name);
            device_box.onclick = () => {
                target_device = device_name;
                target_device_type = device_type;
                chrome.storage.local.get(['device_name', 'device_token', 'user_id'], function (result) {
                    const to_send = { "user_id": result?.user_id, "device_name": result?.device_name, "device_token": result?.device_token, "target_device": device_name };
                    socket.emit("get_my_tabs", to_send);
                })
            };

            const icon = document.createElement('i');
            icon.classList.add('fa', `fa-${device_type}`, 'device_icon');
            icon.style.fontSize = '3rem';
            device_box.appendChild(icon);

            const name = document.createElement('div');
            name.appendChild(document.createTextNode(device_name));
            name.classList.add('device_list_name');
            device_box.appendChild(name);

            if (device_name === curr_device) {
                const this_device = document.createElement('div');
                this_device.classList.add('this_device');
                const circle = document.createElement('i');
                circle.classList.add('fa', 'fa-circle');
                circle.style.fontSize = '0.7rem';
                circle.style.marginRight = '0.3rem'
                this_device.appendChild(circle);
                this_device.appendChild(document.createTextNode("This Device"));
                device_box.appendChild(this_device);
            }

            devices_wrapper.appendChild(device_box);
        }
    });
    content_container.appendChild(devices_wrapper);
}


const tab_component = (id, title, url, is_incognito) => {
    const parent_tab_container = document.createElement('div');
    parent_tab_container.classList.add('parent_tab_container', is_incognito ? 'incognito_tab' : 'regular_tab');
    parent_tab_container.setAttribute('id', `device-${target_device}tab_id-${id}`)

    const img = document.createElement('img');
    img.setAttribute('src', (is_incognito === true && url === null) ? "./assets/incognito.png" : `https://s2.googleusercontent.com/s2/favicons?domain_url=${url}&sz=64`)
    img.classList.add('favicon');
    parent_tab_container.appendChild(img);

    img.onclick = throttle(() => {
        chrome.runtime.sendMessage({
            type: "open_tab",
            data: {
                is_incognito,
                unique_tab_id: id,
                title,
                target_device_type: target_device_type,
                url,
                window_id: target_device
            }
        });
    }, 1000, { leading: true, trailing: false });

    const tab_title = document.createElement('div');
    tab_title.appendChild(document.createTextNode(title))
    tab_title.classList.add('tab_title');
    tab_title.onclick = throttle(() => {
        chrome.runtime.sendMessage({
            type: "open_tab", data: {
                is_incognito,
                unique_tab_id: id,
                title,
                target_device_type: target_device_type,
                url,
                window_id: target_device
            }
        });
    }, 1000, { leading: true, trailing: false });

    parent_tab_container.appendChild(tab_title);

    const closeBtn = document.createElement('i');
    closeBtn.classList.add('fa', 'fa-close');
    closeBtn.style.color = 'rgba(255, 45, 85, 1)';
    closeBtn.style.fontSize = 'large';
    closeBtn.onclick = () => {
        chrome.storage.local.get(['device_name', 'device_token', 'user_id'], function (result) {
            const to_send = { "user_id": result?.user_id, "device_name": result?.device_name, "device_token": result?.device_token, "target_device": target_device, id };
            socket.emit("remove_tab", to_send);
            parent_tab_container.remove();
        })
    }
    parent_tab_container.appendChild(closeBtn);
    return parent_tab_container;
}


function render_update_tab(id, { title, url, is_incognito }) {
    const existTab = document.getElementById(`device-${target_device}tab_id-${id}`);
    if (existTab === null || existTab === undefined) {
        if (document.getElementById(`tab_list-${target_device}`)?.children?.length === 0) {
            document.getElementById(`no_tabs-${target_device}`).innerHTML = '';
        }
        document.getElementById(`tab_list-${target_device}`)?.appendChild(tab_component(id, title, url, is_incognito));
    }
    else {
        existTab?.replaceWith(tab_component(id, title, url, is_incognito));
    }
}


function render_tabs(tabs) {
    content_container.innerHTML = '';
    const heading_container = document.createElement('div');
    heading_container.classList.add('heading_container');
    const [headerLeft, headerRight] = [document.createElement('div'), document.createElement('div')];
    headerLeft.classList.add('header_parts', 'header_left');
    headerRight.classList.add('header_parts', 'header_right');
    const back = document.createElement('div');
    const angle_left = document.createElement('i');
    angle_left.classList.add('fa', 'fa-angle-left');
    angle_left.style.fontSize = 'x-large';
    back.appendChild(angle_left);
    back.classList.add('nav_container');
    back.appendChild(document.createTextNode('Back'));
    headerLeft.appendChild(back);

    back.onclick = () => {
        target_device = null;
        setup_devices_page();
    }
    heading_container.appendChild(headerLeft);

    const heading = document.createElement('div');
    heading.appendChild(document.createTextNode('Tabs'));
    if (target_device !== null && target_device !== undefined) {
        const subheading = document.createElement('div');
        const icon = document.createElement('i');
        icon.classList.add('fa', `fa-${target_device_type}`);
        icon.style.fontSize = 'medium';
        icon.style.marginRight = '0.5em';
        subheading.appendChild(icon);
        subheading.appendChild(document.createTextNode(target_device));
        subheading.classList.add('subheading');
        heading.appendChild(subheading);
    }

    heading.classList.add('heading1');
    heading_container.appendChild(heading);


    const add_new_tab_icon = document.createElement('i');
    add_new_tab_icon.classList.add('fa', 'fa-plus');
    add_new_tab_icon.style.fontSize = 'x-large';
    add_new_tab_icon.style.cursor = 'pointer';
    add_new_tab_icon.style.marginLeft = '0.5rem';
    add_new_tab_icon.style.marginRight = '0.5rem';
    add_new_tab_icon.onclick = throttle(() => {
        chrome.runtime.sendMessage({
            type: "open_tab", data: {
                is_incognito: false,
                unique_tab_id: null,
                title: "Google Search",
                target_device_type: target_device_type,
                url: "https://www.google.com",
                window_id: target_device
            }
        });
    }, 1000, { leading: true, trailing: false });

    add_new_tab_icon.style.color = 'rgba(0, 122, 255, 1)';
    add_new_tab_icon.setAttribute('title', 'Add a new tab');
    headerRight.appendChild(add_new_tab_icon);


    const delete_all = document.createElement('i');
    delete_all.classList.add('fa', 'fa-trash');
    delete_all.style.fontSize = 'x-large';
    delete_all.style.cursor = 'pointer';
    delete_all.style.marginLeft = '0.5rem';
    delete_all.onclick = () => {
        chrome.storage.local.get(['device_name', 'device_token', 'user_id'], function (result) {
            const to_send = { "user_id": result?.user_id, "device_name": result?.device_name, "device_token": result?.device_token, "target_device": target_device };
            document.getElementById(`tab_list-${target_device}`).innerHTML = '';
            document.getElementById(`no_tabs-${target_device}`).innerHTML = '';
            document.getElementById(`no_tabs-${target_device}`).appendChild(document.createTextNode(`No open tabs on device: ${target_device}.`));
            socket.emit("remove_all_tabs", to_send);
        })
    }
    delete_all.style.color = 'rgba(255, 45, 85, 1)';
    delete_all.setAttribute('title', 'Delete all tabs');
    headerRight.appendChild(delete_all);


    heading_container.appendChild(headerRight);

    content_container.appendChild(heading_container)


    const all_tabs = document.createElement('div');
    all_tabs.classList.add('all_tabs');
    all_tabs.setAttribute('id', `tab_list-${target_device}`);

    const no_tabs = document.createElement('div');
    no_tabs.classList.add('loading_text');
    no_tabs.setAttribute('id', `no_tabs-${target_device}`);

    const tabs_arr = Object.entries(tabs);
    if (tabs_arr !== null && tabs_arr !== undefined && tabs_arr?.length > 0) {
        for (const [id, { title, url, is_incognito }] of tabs_arr) {
            all_tabs.appendChild(tab_component(id, title, url, is_incognito));
        }
    }
    else {
        no_tabs.appendChild(document.createTextNode(`No open tabs on device: ${target_device}.`))
    }

    content_container.appendChild(all_tabs);
    content_container.appendChild(no_tabs)
}

const render_setup_tutorial = () => {
    content_container.innerHTML = '';
    const heading_container = document.createElement('div');
    heading_container.classList.add('heading_container');
    const [headerLeft, headerRight] = [document.createElement('div'), document.createElement('div')];
    headerLeft.classList.add('header_parts', 'header_left');
    headerRight.classList.add('header_parts', 'header_right');

    const logo_link = document.createElement('a');
    logo_link.setAttribute('href', 'https://continuitybrowser.com/');
    logo_link.setAttribute('target', '_blank');
    const small_logo = document.createElement('div');
    small_logo.classList.add('small_logo');
    logo_link.appendChild(small_logo);
    headerLeft.appendChild(logo_link);
    heading_container.appendChild(headerLeft);

    const heading = document.createElement('div');
    heading.appendChild(document.createTextNode('Tutorial'));
    heading.classList.add('heading1')
    heading_container.appendChild(heading);


    const skip = document.createElement('div');
    skip.classList.add('nav_container');
    skip.appendChild(document.createTextNode('Skip'));
    const angle_right = document.createElement('i');
    angle_right.classList.add('fa', 'fa-angle-right');
    angle_right.style.fontSize = 'x-large';
    skip.appendChild(angle_right);
    skip.onclick = () => {
        setup_devices_page();
    }
    headerRight.appendChild(skip);

    heading_container.appendChild(headerRight);
    content_container.appendChild(heading_container)

    const padded_container = document.createElement('div');
    padded_container.style.padding = '0.5rem';
    const title = document.createElement('h2');
    title.style.color = '#fff';
    title.appendChild(document.createTextNode("Let's set up your other devices with Continuity"));
    padded_container.appendChild(title);

    const subheading = document.createElement('div');
    subheading.classList.add('subheading');
    subheading.appendChild(document.createTextNode('To sync all your tabs across multiple devices in real time using Continuity, follow this tutorial on our website.'))
    padded_container.appendChild(subheading);

    const get_started = document.createElement('button');
    get_started.innerHTML = 'Start the Tutorial&nbsp;&nbsp;<i class="fa fa-external-link"></i>';
    get_started.classList.add('start_tutorial');
    get_started.onclick = () => {
        chrome.storage.local.get(['device_name', 'user_id'], function (result) {
            window.open(`http://continuitybrowser.com/sync_tutorial?email=${result?.user_id}&device_name=${result?.device_name}`, '_blank');
        })
    }
    padded_container.appendChild(get_started);

    content_container.appendChild(padded_container);
}
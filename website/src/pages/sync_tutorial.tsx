import styles from '@/styles/sync_tutorial.module.css'
import Head from 'next/head'
import Navbar from '@/components/Navbar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAndroid, faApple, faDiscord } from '@fortawesome/free-brands-svg-icons'
import { faAngleLeft, faAngleRight, faPuzzlePiece } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import playstore_qr from "../../public/images/playstore_qr.png";
import appstore_qr from "../../public/images/appstore_qr.png";
import chromestore_qr from "../../public/images/chromestore_qr.png";
import chromeExtension1 from '../../public/images/chromeExtension1.png';
import chromeExtension2 from '../../public/images/chromeExtension2.png';
import chromeExtension3 from '../../public/images/chromeExtension3.png';
import chromeExtension4 from '../../public/images/chromeExtension4.png';
import chromeExtension5 from '../../public/images/chromeExtension5.png';
import chromeExtension6 from '../../public/images/chromeExtension6.png';

export default function SyncTutorial() {
    const router = useRouter();
    const [currStep, setCurrStep] = useState(0);
    const [email, setEmail] = useState<string | string[] | null>(null);
    const [deviceName, setDeviceName] = useState<string | string[] | null>(null);

    useEffect(() => {
        console.log(router?.query);
        if (router?.query?.email !== null && router?.query?.email !== undefined && router?.query?.email?.length > 0) {
            setEmail(router?.query?.email)
        };
        if (router?.query?.device_name !== null && router?.query?.device_name !== undefined) {
            setDeviceName(router?.query?.device_name)
        };
    }, [router?.query])

    const steps = [
        {
            element: (
                <>
                    <div className={styles.heading}>Continuity Device Setup Tutorial</div>
                    <div className={styles.subheading}>
                        To sync all your tabs across multiple devices in real time using Continuity, please select the type of device you would like to set up next.
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div className={styles.link_container} onClick={() => setCurrStep(1)}>
                            <FontAwesomeIcon icon={faAndroid} color='#669933' style={{ fontSize: 'x-large' }} />
                            <div>
                                Android (Phone or Tablet)
                            </div>
                        </div>

                        <div className={styles.link_container} onClick={() => setCurrStep(5)}>
                            <FontAwesomeIcon icon={faApple} color='#000' style={{ fontSize: 'x-large' }} />
                            <div>
                                iOS (Apple iPhone or iPad)
                            </div>
                        </div>

                        <div className={styles.link_container} onClick={() => setCurrStep(8)}>
                            <FontAwesomeIcon icon={faPuzzlePiece} color='rgba(10, 132, 255, 1)' style={{ fontSize: 'x-large' }} />
                            <div>
                                Chrome Extension (Laptop or Desktop)
                            </div>
                        </div>
                    </div>

                    <div className={styles.divided_section}>
                        Or, watch our <b>Device Setup Tutorial</b> video on YouTube

                        <div style={{ marginTop: 20 }}>
                            <iframe className={styles.video} src="https://www.youtube.com/embed/rRPC211SAIM" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
                        </div>
                    </div>

                </>
            ),

            previous: null,
            next: null
        },

        {
            element: (
                <>
                    <div className={styles.heading}>Setup your Android Device</div>
                    <div className={styles.text_style} style={{ textAlign: "center" }}>Step 1</div>
                    <div className={styles.larger_text}>Download the Continuity App on your Android device.</div>

                    <div>
                        <Image
                            style={{ borderRadius: '10px', marginTop: 20, marginBottom: 20 }}
                            src={playstore_qr}
                            alt="Playstore QR code"
                            height={200} // Desired size with correct aspect ratio
                            width={200} // Desired size with correct aspect ratio
                        />
                    </div>

                    <div>
                        <div className={styles.larger_text}>Or, visit this link: <a className={styles.link} href='https://play.google.com/store/apps/details?id=com.continuity&pli=1' target="_blank" rel="noreferrer">https://play.google.com/store/apps/details?id=com.continuity&pli=1</a>.</div>
                    </div>
                </>
            ),

            previous: 0,
            next: 2
        },

        {
            element: (
                <>
                    <div className={styles.heading}>Setup your Android Device</div>
                    <div className={styles.text_style} style={{ textAlign: "center" }}>Step 2</div>
                    {(email === null || email === undefined) ?
                        (
                            <div className={styles.larger_text}>Enter the <span style={{ fontWeight: "bold" }}>same</span> Email ID across all your devices for the tabs to sync.</div>
                        )
                        :
                        <>
                            <div className={styles.larger_text}>Enter the Email ID:</div>
                            <div className={`${styles.larger_text} ${styles.border_container}`}>{email}</div>
                            <div className={styles.larger_text}>to log into continuity on your Android device.</div>
                        </>
                    }
                </>
            ),

            previous: 1,
            next: 3
        },

        {
            element: (
                <>
                    <div className={styles.heading}>Setup your Android Device</div>
                    <div className={styles.text_style} style={{ textAlign: "center" }}>Step 3</div>
                    <div className={styles.larger_text}>Enter a device name which is <span style={{ fontWeight: "bold" }}>different</span> from all your currently registered devices.</div>
                    {(deviceName !== null && deviceName !== undefined) && (
                        <>
                            <div className={styles.larger_text} style={{ marginTop: '0.5rem' }}>For example:</div>
                            <div className={`${styles.larger_text} ${styles.border_container}`}>{'Android ' + deviceName}</div>
                        </>
                    )}
                </>
            ),

            previous: 2,
            next: 4
        },

        {
            element: (
                <>
                    <div className={styles.heading}>Congratulations!</div>
                    <div className={styles.larger_text}>All your devices are now in sync.</div>
                    <div className={styles.larger_text}>If you have any questions, please send us a message on our Discord community for a quick reply <span style={{ color: 'rgb(255, 55, 95)' }}>(Recommended)</span>.</div>
                    <a href="https://discord.gg/TwJ863WJsQ" target="_blank" rel="noreferrer">
                        <div style={{ margin: '1rem' }} className={styles.scale}>
                            <FontAwesomeIcon icon={faDiscord} style={{ color: 'rgba(88, 101, 242, 1)' }} />&nbsp;&nbsp;Join our Discord Community
                        </div>
                    </a>
                    <div className={styles.larger_text} style={{ marginTop: '2rem' }}>
                        You can also email us at <a className={styles.link} href='mailto:continuitybrowser@gmail.com'>continuitybrowser@gmail.com</a>.
                    </div>
                </>
            ),

            previous: null,
            next: null,
            isFinalStep: true
        },

        {
            element: (
                <>
                    <div className={styles.heading}>Setup your iOS Device</div>
                    <div className={styles.text_style} style={{ textAlign: "center" }}>Step 1</div>
                    <div className={styles.larger_text}>Download the Continuity App on your iOS device.</div>

                    <div>
                        <Image
                            style={{ borderRadius: '10px', marginTop: 20, marginBottom: 20 }}
                            src={appstore_qr}
                            alt="Appstore QR code"
                            height={200} // Desired size with correct aspect ratio
                            width={200} // Desired size with correct aspect ratio
                        />
                    </div>

                    <div>
                        <div className={styles.larger_text}>Or, visit this link: <a className={styles.link} href='https://apps.apple.com/us/app/continuity-browser/id1666743201' target="_blank" rel="noreferrer">https://apps.apple.com/us/app/continuity-browser/id1666743201</a>.</div>
                    </div>
                </>
            ),

            previous: 0,
            next: 6
        },

        {
            element: (
                <>
                    <div className={styles.heading}>Setup your iOS Device</div>
                    <div className={styles.text_style} style={{ textAlign: "center" }}>Step 2</div>
                    {(email === null || email === undefined) ?
                        (
                            <div className={styles.larger_text}>Enter the <span style={{ fontWeight: "bold" }}>same</span> Email ID across all your devices for the tabs to sync.</div>
                        )
                        :
                        <>
                            <div className={styles.larger_text}>Enter the Email ID:</div>
                            <div className={`${styles.larger_text} ${styles.border_container}`}>{email}</div>
                            <div className={styles.larger_text}>to log into continuity on your Android device.</div>
                        </>
                    }
                </>
            ),

            previous: 5,
            next: 7
        },

        {
            element: (
                <>
                    <div className={styles.heading}>Setup your iOS Device</div>
                    <div className={styles.text_style} style={{ textAlign: "center" }}>Step 3</div>
                    <div className={styles.larger_text}>Enter a device name which is <span style={{ fontWeight: "bold" }}>different</span> from all your currently registered devices.</div>
                    {(deviceName !== null && deviceName !== undefined) && (
                        <>
                            <div className={styles.larger_text} style={{ marginTop: '0.5rem' }}>For example:</div>
                            <div className={`${styles.larger_text} ${styles.border_container}`}>{'iOS ' + deviceName}</div>
                        </>
                    )}
                </>
            ),

            previous: 6,
            next: 4
        },

        {
            element: (
                <>
                    <div className={styles.heading}>Setup your Chrome Extension</div>
                    <div className={styles.text_style} style={{ textAlign: "center" }}>Step 1</div>
                    <div className={styles.larger_text}>Enter the URL on your desktop&apos;s or laptop&apos;s Chrome browser to visit the Continuity page on Chrome Web Store</div>
                    <div>
                        <Image
                            style={{ borderRadius: '10px', marginTop: 20, marginBottom: 20 }}
                            src={chromestore_qr}
                            alt="Chrome Store QR code"
                            height={200} // Desired size with correct aspect ratio
                            width={200} // Desired size with correct aspect ratio
                        />
                    </div>

                    <div>
                        <div className={styles.larger_text}>Or, visit this link: <a className={styles.link} href='https://chrome.google.com/webstore/detail/continuity/iialcggedkdlcbjfmgbmnjofjnlhpccc' target="_blank" rel="noreferrer">https://chrome.google.com/webstore/detail/continuity/iialcggedkdlcbjfmgbmnjofjnlhpccc</a>.</div>
                    </div>
                </>
            ),

            previous: 0,
            next: 9
        },

        {
            element: (
                <>
                    <div className={styles.heading}>Setup your Chrome Extension</div>
                    <div className={styles.text_style} style={{ textAlign: "center" }}>Step 2</div>
                    <div className={styles.larger_text}>Click on <span style={{ fontWeight: "bold" }}>Add to Chrome</span> button.</div>
                    <Image
                        src={chromeExtension1}
                        alt="Screenshot for click on Add to Chrome button"
                        className={styles.desktop_screenshot}
                    />
                </>
            ),

            previous: 8,
            next: 10
        },

        {
            element: (
                <>
                    <div className={styles.heading}>Setup your Chrome Extension</div>
                    <div className={styles.text_style} style={{ textAlign: "center" }}>Step 3</div>
                    <div className={styles.larger_text}>Click on <span style={{ fontWeight: "bold" }}>Add extension</span> button.</div>
                    <Image
                        src={chromeExtension2}
                        alt="Screenshot for click on Add to Chrome button"
                        className={styles.desktop_screenshot}
                    />
                </>
            ),

            previous: 9,
            next: 11
        },

        {
            element: (
                <>
                    <div className={styles.heading}>Setup your Chrome Extension</div>
                    <div className={styles.text_style} style={{ textAlign: "center" }}>Step 4</div>
                    <div className={styles.larger_text}>Click on <FontAwesomeIcon icon={faPuzzlePiece} color='rgba(10, 132, 255, 1)' style={{ fontSize: 'large' }} /> icon on the top right to see all your extensions.</div>
                    <Image
                        src={chromeExtension3}
                        alt="Screenshot for click on Add to Chrome button"
                        className={styles.desktop_screenshot}
                    />
                </>
            ),

            previous: 10,
            next: 12
        },

        {
            element: (
                <>
                    <div className={styles.heading}>Setup your Chrome Extension</div>
                    <div className={styles.text_style} style={{ textAlign: "center" }}>Step 5</div>
                    <div className={styles.larger_text}>Click on <span style={{ fontWeight: "bold" }}>Continuity</span> extension to start.</div>
                    <Image
                        src={chromeExtension4}
                        alt="Screenshot for click on Add to Chrome button"
                        className={styles.desktop_screenshot}
                    />
                </>
            ),

            previous: 11,
            next: 13
        },

        {
            element: (
                <>
                    <div className={styles.heading}>Setup your Chrome Extension</div>
                    <div className={styles.text_style} style={{ textAlign: "center" }}>Step 6</div>
                    {(email === null || email === undefined) ?
                        (
                            <div className={styles.larger_text}>Enter the <span style={{ fontWeight: "bold" }}>same</span> Email ID across all your devices for the tabs to sync.</div>
                        )
                        :
                        <>
                            <div className={styles.larger_text}>Enter the Email ID:</div>
                            <div className={`${styles.larger_text} ${styles.border_container}`}>{email}</div>
                            <div className={styles.larger_text}>and click on <span style={{ fontWeight: "bold" }}>Sign In</span> button to Log In / Sign Up on continuity from the Chrome Extension.</div>
                            <div style={{ margin: '1rem' }}>
                                <div>
                                    You will receive a verification email from <span style={{ fontWeight: "bold" }}>continuitybrowser@gmail.com</span>. Click on the verification link to verify your account.
                                </div>
                            </div>
                        </>
                    }
                    <Image
                        src={chromeExtension5}
                        alt="Screenshot for click on Add to Chrome button"
                        className={styles.desktop_screenshot}
                    />

                    <div style={{ margin: '2rem 3rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ color: 'rgb(255, 55, 95)' }}><sup>*</sup>Make sure to check your email account&apos;s <b>Spam</b> folder if you cannot find the email in your inbox.</div>
                        <div style={{ color: 'rgb(255, 149, 0)' }}>
                            <div>
                                <div>
                                    <sup>*</sup>If you haven&apos;t recieved the email for 3 minutes or more, please try again or use a different email.
                                </div>
                                <div>Please note that if you are using an organization&apos;s email id (example, <b>your_email@company.org</b>), some organizations filter out the emails.</div>
                            </div>
                        </div>
                    </div>
                </>
            ),

            previous: 12,
            next: 14
        },

        {
            element: (
                <>
                    <div className={styles.heading}>Setup your Chrome Extension</div>
                    <div className={styles.larger_text}>Enter the <span style={{ fontWeight: "bold" }}>Device Name</span> and <span style={{ fontWeight: "bold" }}>Device Type</span>.</div>
                    {(deviceName !== null && deviceName !== undefined) && (
                        <>
                            <div className={styles.larger_text} style={{ marginTop: '0.5rem' }}>For example:</div>
                            <div className={`${styles.larger_text} ${styles.border_container}`}>{deviceName + ' Extension'}</div>
                        </>
                    )}
                    <div className={styles.larger_text}>Then, click on <span style={{ fontWeight: "bold" }}>Get Started</span> button.</div>
                    <Image
                        src={chromeExtension6}
                        alt="Screenshot for click on Add to Chrome button"
                        className={styles.desktop_screenshot}
                    />
                </>
            ),

            previous: 13,
            next: 4
        },
    ]


    return (
        <>
            <Head>
                <title>Continuity | Devices Setup</title>
                <meta name="description" content="Experience seamless and productive browsing with Continuity - tabs synced across all devices, secure personal info, a built-in content creator mind, and much more!" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Navbar downloadLink={"/#download"} />
            <main className={styles.main}>
                {steps[currStep]?.element}
                <div className={styles.navigation_container}>
                    {steps[currStep]?.previous !== null && (
                        <div className={styles.prevBtn} onClick={() => setCurrStep(steps[currStep]?.previous ?? 0)}>
                            <FontAwesomeIcon icon={faAngleLeft} color='#000' style={{ fontSize: 'large' }} />
                            <div>
                                Previous
                            </div>
                        </div>
                    )}
                    {(steps[currStep]?.next !== null || steps[currStep]?.isFinalStep === true) && (
                        <div className={styles.nextBtn} onClick={() => setCurrStep(steps[currStep]?.next ?? 0)}>
                            <div>
                                {(steps[currStep]?.isFinalStep === true) ? "Add more devices" : "Next"}
                            </div>

                            {(steps[currStep]?.isFinalStep !== true) && (
                                <FontAwesomeIcon icon={faAngleRight} color='#fff' style={{ fontSize: 'large' }} />
                            )}
                        </div>
                    )}
                </div>
            </main>
        </>
    )
}
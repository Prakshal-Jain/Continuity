import styles from '../styles/pricing.module.css';
import React, { useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faClose, faHeart } from '@fortawesome/free-solid-svg-icons';

type featureProps = { featureList: { name: JSX.Element | string, is_available: boolean }[] }

const AvailableFeatures = ({ featureList }: featureProps) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>
        {
            featureList.map(({ name, is_available }, idx) => (
                <div className={styles.feature_row} key={`${name}_price_feature_${idx}`}>
                    <div>
                        <FontAwesomeIcon icon={is_available ? faCheck : faClose} className={styles.feature_available_logo} style={{ color: is_available ? 'rgb(40, 205, 65)' : 'rgb(255, 59, 48)' }} />
                    </div>

                    <div>
                        {name}
                    </div>
                </div>
            ))
        }
    </div>
)


export default function Pricing() {
    const [isMonthly, setIsMonthly] = useState(true)

    const SubscriptionTime = () => (
        <div className={styles.subscription_container}>
            <div onClick={() => setIsMonthly(true)} className={`${styles.subscription_time_btn} ${isMonthly ? styles.selected_sub_time : null}`} role="button">
                Monthly
            </div>

            <div onClick={() => setIsMonthly(false)} className={`${styles.subscription_time_btn} ${isMonthly ? null : styles.selected_sub_time}`} role="button">
                Yearly
            </div>
        </div>
    )

    return (
        <main className={styles.main}>
            <div className={styles.title}>Pricing</div>

            <SubscriptionTime />

            <div className={styles.card_container}>
                <div className={`${styles.price_card} ${styles.popular}`}>
                    <div style={{ color: 'rgb(0, 122, 255)' }}>Most Popular</div>
                    <h2 style={{ marginTop: '1rem', marginBottom: '1rem' }}>Essentials</h2>
                    <button className={styles.buy_btn} style={{ background: 'rgb(0, 122, 255)' }}>Start Free Trial</button>
                    <div className={styles.price_tag}>7 days free, then just {isMonthly ? <span style={{fontSize: 'large'}}>$4.99/month</span> : <span><del>$59.88</del>{' '}<span style={{fontSize: 'large'}}>$49.99/year</span></span>}.</div>
                    <AvailableFeatures featureList={essentials} />
                </div>
                <div className={styles.price_card}>
                    <h2 style={{ marginTop: '1rem', marginBottom: '1rem' }}>Professional</h2>
                    <button className={styles.buy_btn} style={{ background: '#00a173' }}>Start Free Trial</button>
                    <div className={styles.price_tag}>7 days free, then just {isMonthly ? <span style={{fontSize: 'large'}}>$9.99/month</span> : <span><del>$119.88</del>{' '}<span style={{fontSize: 'large'}}>$99.99/year</span></span>}.</div>

                    <AvailableFeatures featureList={professional} />
                </div>
                <div className={styles.price_card}>
                    <h3 style={{ marginTop: '1rem', marginBottom: '1rem' }}>Basic</h3>
                    <div className={styles.price_tag}>Free</div>
                    <AvailableFeatures featureList={basic} />
                </div>
            </div>
        </main>
    )
}

const basic = [
    { name: <div>Tab Syncing across at most <span style={{ fontWeight: 'bold' }}>3 devices</span>.</div>, is_available: true },
    { name: "Intelligent Privacy Report", is_available: true },
    { name: "Ultra Search", is_available: false },
    { name: "Intelligent Privacy Prevention", is_available: false },
    { name: "Early access to all upcoming features before they are publicly released.", is_available: false }
]

const essentials = [
    { name: <div>Tab Syncing across at most <span style={{ fontWeight: 'bold' }}>3 devices</span>.</div>, is_available: true },
    { name: "Intelligent Privacy Report", is_available: true },
    { name: "Ultra Search", is_available: true },
    { name: "Intelligent Privacy Prevention", is_available: true },
    { name: "Early access to all upcoming features before they are publicly released.", is_available: false }
]

const professional = [
    { name: <div>Tab Syncing across <span style={{ fontWeight: 'bold' }}>unlimited devices</span>.</div>, is_available: true },
    { name: "Intelligent Privacy Report", is_available: true },
    { name: "Ultra Search", is_available: true },
    { name: "Intelligent Privacy Prevention", is_available: true },
    { name: "Early access to all upcoming features before they are publicly released.", is_available: true },
]
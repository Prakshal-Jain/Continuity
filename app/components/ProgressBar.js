import { useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

export default function ProgressBar({ stepCount = 1, currStep = 0, showLabel = true, colorScheme = 'light' }) {
    const containerRef = useRef();

    const styles = StyleSheet.create({
        progress_container: {
            paddingHorizontal: 10,
            paddingVertical: 15,
            width: '95%',
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "nowrap",
        },

        progress_bar: {
            height: 10,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: 'rgba(99, 99, 102, 1)',
        }
    })

    return (
        <View style={[styles.progress_container]} ref={containerRef}>
            {Array(stepCount).fill(0).map((_, idx) => {
                if ((idx + 1) < currStep) {
                    return (
                        <View key={`bar_${idx}`} style={[styles.progress_bar, { width: `${(100 / stepCount) - 1}%`, marginRight: (idx === (stepCount - 1) ? undefined : '3%'), backgroundColor: (colorScheme === 'dark' ? 'rgba(10, 132, 255, 1)' : 'rgba(0, 122, 255, 1)') }]}>
                        </View>
                    )
                }
                else if ((idx + 1) === currStep) {
                    return (
                        <LinearGradient
                            key={`bar_${idx}`}
                            style={[styles.progress_bar, { width: `${(100 / stepCount) - 1}%`, marginRight: (idx === (stepCount - 1) ? undefined : '3%') }]}
                            colors={[(colorScheme === 'dark') ? 'rgba(10, 132, 255, 1)' : 'rgba(0, 122, 255, 1)', 'rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0)']}
                            start={[0, 0]} end={[1, 0]}
                        >
                        </LinearGradient>
                    )
                }
                else {
                    return (
                        <View key={`bar_${idx}`} style={[styles.progress_bar, { width: `${(100 / stepCount) - 1}%`, marginRight: (idx === (stepCount - 1) ? undefined : '3%') }]}>
                        </View>
                    )
                }
            })}
        </View>
    )
}
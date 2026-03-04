/**
 * _layout.tsx — Root Layout (Bottom Tabs)
 *
 * PENJELASAN:
 * File ini adalah root layout Expo Router.
 * Menggunakan bottom tab navigation dengan 5 tabs:
 * Generate, Validate, QR, Tools (convert+encrypt), Settings
 *
 * Dark-first design dari theme/colors.ts
 */

import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import { useWalletStore } from '../store/walletStore';
import { Colors } from '../theme/colors';

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
    const icons: Record<string, string> = {
        Generate: '⚡',
        Validate: '✓',
        QR: '▣',
        Tools: '⚙',
        Settings: '☰',
    };
    return (
        <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>
            {icons[name] || '•'}
        </Text>
    );
}

export default function RootLayout() {
    const theme = useWalletStore((s) => s.theme);
    const c = Colors[theme];

    return (
        <View style={[styles.container, { backgroundColor: c.background }]}>
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: {
                        backgroundColor: c.tabBar,
                        borderTopColor: c.border,
                        borderTopWidth: 1,
                        height: 60,
                        paddingBottom: 8,
                        paddingTop: 4,
                    },
                    tabBarActiveTintColor: c.accent,
                    tabBarInactiveTintColor: c.tabInactive,
                    tabBarLabelStyle: {
                        fontSize: 10,
                        fontWeight: '600',
                        letterSpacing: 0.3,
                    },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Generate',
                        tabBarIcon: ({ focused }) => <TabIcon name="Generate" focused={focused} />,
                    }}
                />
                <Tabs.Screen
                    name="validate"
                    options={{
                        title: 'Validate',
                        tabBarIcon: ({ focused }) => <TabIcon name="Validate" focused={focused} />,
                    }}
                />
                <Tabs.Screen
                    name="qr"
                    options={{
                        title: 'QR',
                        tabBarIcon: ({ focused }) => <TabIcon name="QR" focused={focused} />,
                    }}
                />
                <Tabs.Screen
                    name="tools"
                    options={{
                        title: 'Tools',
                        tabBarIcon: ({ focused }) => <TabIcon name="Tools" focused={focused} />,
                    }}
                />
                <Tabs.Screen
                    name="settings"
                    options={{
                        title: 'Settings',
                        tabBarIcon: ({ focused }) => <TabIcon name="Settings" focused={focused} />,
                    }}
                />
            </Tabs>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabIcon: {
        fontSize: 20,
        opacity: 0.5,
    },
    tabIconActive: {
        opacity: 1,
    },
});

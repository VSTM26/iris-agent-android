import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ChatScreen from './src/screens/ChatScreen';
import DevicesScreen from './src/screens/DevicesScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { MessagingService } from './src/services/MessagingService';
import { useDeviceStore } from './src/store/deviceStore';

const Tab = createBottomTabNavigator();

const TabBarIcon = ({ name, color, size }: any) => {
  const icons: Record<string, string> = {
    Chat: '💬',
    Devices: '📱',
    Settings: '⚙️',
  };
  return <Text style={{ fontSize: size, color }}>{icons[name]}</Text>;
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setDeviceId } = useDeviceStore();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const deviceId = await MessagingService.initializeDevice();
      setDeviceId(deviceId);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.container}
      >
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Initializing Iris Agent...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.container}
      >
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>⚠️ Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: true,
          headerStyle: {
            backgroundColor: '#fff',
            borderBottomWidth: 1,
            borderBottomColor: '#f0f0f0',
            elevation: 2,
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '700',
            color: '#333',
          },
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#f0f0f0',
            paddingTop: 8,
            paddingBottom: 8,
            height: 70,
            elevation: 8,
          },
          tabBarActiveTintColor: '#667eea',
          tabBarInactiveTintColor: '#999',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 4,
          },
          tabBarIconStyle: {
            marginTop: 4,
          },
        })}
      >
        <Tab.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            title: 'Chat',
            tabBarLabel: 'Chat',
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="Chat" color={color} size={24} />
            ),
          }}
        />
        <Tab.Screen
          name="Devices"
          component={DevicesScreen}
          options={{
            title: 'Devices',
            tabBarLabel: 'Devices',
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="Devices" color={color} size={24} />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Settings',
            tabBarLabel: 'Settings',
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="Settings" color={color} size={24} />
            ),
          }}
        />
      </Tab.Navigator>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 24,
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

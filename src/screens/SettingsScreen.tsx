import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDeviceStore } from '../store/deviceStore';

export default function SettingsScreen() {
  const [apiUrl, setApiUrl] = useState('http://localhost:8000');
  const [autoConnect, setAutoConnect] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const { deviceId } = useDeviceStore();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedUrl = await AsyncStorage.getItem('api_url');
      const savedAutoConnect = await AsyncStorage.getItem('auto_connect');
      const savedNotifications = await AsyncStorage.getItem('notifications');

      if (savedUrl) setApiUrl(savedUrl);
      if (savedAutoConnect) setAutoConnect(JSON.parse(savedAutoConnect));
      if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await AsyncStorage.setItem('api_url', apiUrl);
      await AsyncStorage.setItem('auto_connect', JSON.stringify(autoConnect));
      await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to defaults?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Reset',
          onPress: async () => {
            await AsyncStorage.removeItem('api_url');
            await AsyncStorage.removeItem('auto_connect');
            await AsyncStorage.removeItem('notifications');
            loadSettings();
            Alert.alert('Success', 'Settings reset to defaults');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device Information</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Device ID:</Text>
          <Text style={styles.infoValue}>{deviceId}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>API Configuration</Text>
        <Text style={styles.label}>Backend URL</Text>
        <TextInput
          style={styles.input}
          placeholder="http://localhost:8000"
          value={apiUrl}
          onChangeText={setApiUrl}
          editable
        />
        <Text style={styles.hint}>
          Enter the URL of your Iris Agent backend server
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingLabel}>
            <Text style={styles.label}>Auto-Connect to Desktop</Text>
            <Text style={styles.hint}>
              Automatically connect to the desktop on startup
            </Text>
          </View>
          <Switch
            value={autoConnect}
            onValueChange={setAutoConnect}
            trackColor={{ false: '#ccc', true: '#81c784' }}
            thumbColor={autoConnect ? '#007AFF' : '#f4f3f4'}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <View style={styles.settingLabel}>
            <Text style={styles.label}>Enable Notifications</Text>
            <Text style={styles.hint}>
              Receive notifications for new messages
            </Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#ccc', true: '#81c784' }}
            thumbColor={notifications ? '#007AFF' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveSettings}
        >
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetSettings}
        >
          <Text style={styles.resetButtonText}>Reset to Defaults</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.aboutBox}>
          <Text style={styles.aboutText}>Iris Agent Android</Text>
          <Text style={styles.aboutVersion}>Version 1.0.0</Text>
          <Text style={styles.aboutDescription}>
            Control your desktop AI assistant from your Android phone
          </Text>
        </View>
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    flex: 1,
    marginRight: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  infoBox: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  resetButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resetButtonText: {
    color: '#d32f2f',
    fontWeight: '600',
    fontSize: 16,
  },
  aboutBox: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  aboutText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  aboutVersion: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  aboutDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  spacer: {
    height: 40,
  },
});

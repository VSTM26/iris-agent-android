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
  Animated,
  Easing,
  LinearGradient,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDeviceStore } from '../store/deviceStore';

const GRADIENT_COLORS = ['#667eea', '#764ba2'];

export default function SettingsScreen() {
  const [apiUrl, setApiUrl] = useState('http://localhost:8000');
  const [autoConnect, setAutoConnect] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const { deviceId } = useDeviceStore();

  useEffect(() => {
    loadSettings();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const loadSettings = async () => {
    try {
      const savedUrl = await AsyncStorage.getItem('api_url');
      const savedAutoConnect = await AsyncStorage.getItem('auto_connect');
      const savedNotifications = await AsyncStorage.getItem('notifications');
      const savedDarkMode = await AsyncStorage.getItem('dark_mode');

      if (savedUrl) setApiUrl(savedUrl);
      if (savedAutoConnect) setAutoConnect(JSON.parse(savedAutoConnect));
      if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
      if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await AsyncStorage.setItem('api_url', apiUrl);
      await AsyncStorage.setItem('auto_connect', JSON.stringify(autoConnect));
      await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
      await AsyncStorage.setItem('dark_mode', JSON.stringify(darkMode));
      Alert.alert('✓ Success', 'Settings saved successfully');
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
            await AsyncStorage.removeItem('dark_mode');
            loadSettings();
            Alert.alert('✓ Success', 'Settings reset to defaults');
          },
        },
      ]
    );
  };

  const SettingSection = ({ title, children }: any) => (
    <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </Animated.View>
  );

  const SettingRow = ({ label, hint, children }: any) => (
    <View style={styles.settingRow}>
      <View style={styles.settingLabel}>
        <Text style={styles.label}>{label}</Text>
        {hint && <Text style={styles.hint}>{hint}</Text>}
      </View>
      {children}
    </View>
  );

  return (
    <LinearGradient colors={['#f8f9fa', '#ffffff']} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SettingSection title="Device Information">
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Device ID</Text>
              <Text style={styles.infoValue}>{deviceId}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Platform</Text>
              <Text style={styles.infoValue}>Android</Text>
            </View>
          </View>
        </SettingSection>

        <SettingSection title="API Configuration">
          <SettingRow label="Backend URL" hint="Enter your server address">
            <TextInput
              style={styles.input}
              placeholder="http://localhost:8000"
              value={apiUrl}
              onChangeText={setApiUrl}
              placeholderTextColor="#ccc"
            />
          </SettingRow>
        </SettingSection>

        <SettingSection title="Preferences">
          <SettingRow label="Auto-Connect" hint="Connect to desktop on startup">
            <Switch
              value={autoConnect}
              onValueChange={setAutoConnect}
              trackColor={{ false: '#ccc', true: '#667eea' }}
              thumbColor={autoConnect ? '#fff' : '#f4f3f4'}
            />
          </SettingRow>

          <View style={styles.divider} />

          <SettingRow label="Notifications" hint="Receive new message alerts">
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#ccc', true: '#667eea' }}
              thumbColor={notifications ? '#fff' : '#f4f3f4'}
            />
          </SettingRow>

          <View style={styles.divider} />

          <SettingRow label="Dark Mode" hint="Enable dark theme">
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#ccc', true: '#667eea' }}
              thumbColor={darkMode ? '#fff' : '#f4f3f4'}
            />
          </SettingRow>
        </SettingSection>

        <SettingSection title="Actions">
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveSettings}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>💾 Save Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetSettings}
            activeOpacity={0.8}
          >
            <Text style={styles.resetButtonText}>↻ Reset to Defaults</Text>
          </TouchableOpacity>
        </SettingSection>

        <SettingSection title="About">
          <View style={styles.aboutBox}>
            <Text style={styles.aboutTitle}>Iris Agent</Text>
            <Text style={styles.aboutVersion}>Android v1.0.0</Text>
            <Text style={styles.aboutDescription}>
              Control your desktop AI assistant from your Android phone
            </Text>
            <View style={styles.aboutDivider} />
            <Text style={styles.aboutFeature}>✓ Local LLM Processing</Text>
            <Text style={styles.aboutFeature}>✓ GitHub Integration</Text>
            <Text style={styles.aboutFeature}>✓ Web Browsing</Text>
            <Text style={styles.aboutFeature}>✓ Cross-Device Sync</Text>
          </View>
        </SettingSection>

        <View style={styles.spacer} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
  },
  section: {
    marginHorizontal: 12,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#667eea',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#f9f9f9',
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
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
  },
  infoBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#e8e8e8',
    marginVertical: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  saveButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  resetButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },
  resetButtonText: {
    color: '#d32f2f',
    fontWeight: '700',
    fontSize: 15,
  },
  aboutBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  aboutVersion: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  aboutDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  aboutDivider: {
    height: 1,
    backgroundColor: '#e8e8e8',
    marginVertical: 12,
    width: '100%',
  },
  aboutFeature: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
    marginVertical: 4,
  },
  spacer: {
    height: 40,
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Animated,
  Easing,
  LinearGradient,
} from 'react-native';
import MessagingService from '../services/MessagingService';
import { useDeviceStore } from '../store/deviceStore';

interface Device {
  device_id: string;
  device_type: string;
  registered_at: string;
  metadata?: Record<string, any>;
}

const GRADIENT_COLORS = ['#667eea', '#764ba2'];

export default function DevicesScreen() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { selectedDesktopId, setSelectedDesktopId } = useDeviceStore();

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      setLoading(true);
      const allDevices = await MessagingService.getDevices();
      setDevices(allDevices);
    } catch (error) {
      console.error('Failed to load devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDevices();
    setRefreshing(false);
  };

  const handleSelectDevice = (deviceId: string) => {
    setSelectedDesktopId(deviceId);
  };

  const renderDevice = ({ item, index }: { item: Device; index: number }) => {
    const isSelected = selectedDesktopId === item.device_id;
    const isDesktop = item.device_type === 'windows_desktop';
    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400 + index * 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, []);

    const getDeviceIcon = () => {
      if (isDesktop) return '💻';
      if (item.device_type === 'android') return '🤖';
      if (item.device_type === 'ios') return '🍎';
      return '📱';
    };

    const getDeviceName = () => {
      if (isDesktop) return 'Desktop PC';
      if (item.device_type === 'android') return 'Android Phone';
      if (item.device_type === 'ios') return 'iPhone';
      return 'Device';
    };

    return (
      <Animated.View
        style={[
          styles.deviceCardWrapper,
          {
            transform: [
              {
                scale: scaleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.deviceCard, isSelected && styles.selectedDevice]}
          onPress={() => isDesktop && handleSelectDevice(item.device_id)}
          disabled={!isDesktop}
          activeOpacity={0.8}
        >
          {isSelected && (
            <LinearGradient
              colors={['rgba(102, 126, 234, 0.1)', 'rgba(118, 75, 162, 0.05)']}
              style={styles.selectedGradient}
            />
          )}

          <View style={styles.deviceHeader}>
            <View style={styles.deviceIconContainer}>
              <Text style={styles.deviceIcon}>{getDeviceIcon()}</Text>
            </View>

            <View style={styles.deviceInfo}>
              <Text style={styles.deviceName}>{getDeviceName()}</Text>
              <Text style={styles.deviceId}>
                {item.device_id.substring(0, 12)}...
              </Text>
            </View>

            {isSelected && (
              <View style={styles.selectedBadge}>
                <Text style={styles.selectedBadgeText}>✓</Text>
              </View>
            )}
          </View>

          <View style={styles.deviceDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Type:</Text>
              <Text style={styles.detailValue}>
                {item.device_type.replace('_', ' ')}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Registered:</Text>
              <Text style={styles.detailValue}>
                {new Date(item.registered_at).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {isDesktop && !isSelected && (
            <View style={styles.selectPrompt}>
              <Text style={styles.selectPromptText}>Tap to select</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={['#f8f9fa', '#ffffff']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading devices...</Text>
        </View>
      </LinearGradient>
    );
  }

  const desktopDevices = devices.filter((d) => d.device_type === 'windows_desktop');
  const otherDevices = devices.filter((d) => d.device_type !== 'windows_desktop');

  return (
    <LinearGradient colors={['#f8f9fa', '#ffffff']} style={styles.container}>
      <FlatList
        data={[...desktopDevices, ...otherDevices]}
        renderItem={renderDevice}
        keyExtractor={(item) => item.device_id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#667eea"
          />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>🔌</Text>
            </View>
            <Text style={styles.emptyText}>No Devices Connected</Text>
            <Text style={styles.emptySubtext}>
              Make sure your Iris Agent desktop app is running
            </Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={onRefresh}
            >
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </LinearGradient>
  );
}

const useRef = React.useRef;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
  listContent: {
    padding: 12,
    paddingBottom: 20,
  },
  deviceCardWrapper: {
    marginBottom: 12,
  },
  deviceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e8e8e8',
    overflow: 'hidden',
  },
  selectedGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  selectedDevice: {
    borderColor: '#667eea',
    backgroundColor: '#f8f9ff',
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  deviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deviceIcon: {
    fontSize: 24,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  deviceId: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  selectedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  deviceDetails: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  selectPrompt: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  selectPromptText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  refreshButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#667eea',
    borderRadius: 20,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

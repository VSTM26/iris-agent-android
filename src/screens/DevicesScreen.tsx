import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import MessagingService from '../services/MessagingService';
import { useDeviceStore } from '../store/deviceStore';

interface Device {
  device_id: string;
  device_type: string;
  registered_at: string;
  metadata?: Record<string, any>;
}

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

  const renderDevice = ({ item }: { item: Device }) => {
    const isSelected = selectedDesktopId === item.device_id;
    const isDesktop = item.device_type === 'windows_desktop';

    return (
      <TouchableOpacity
        style={[styles.deviceCard, isSelected && styles.selectedDevice]}
        onPress={() => isDesktop && handleSelectDevice(item.device_id)}
        disabled={!isDesktop}
      >
        <View style={styles.deviceHeader}>
          <View style={styles.deviceInfo}>
            <Text style={styles.deviceName}>
              {isDesktop ? '💻 Desktop' : `📱 ${item.device_type}`}
            </Text>
            <Text style={styles.deviceId}>{item.device_id.substring(0, 8)}...</Text>
          </View>
          {isSelected && <Text style={styles.selectedBadge}>✓ Selected</Text>}
        </View>
        <Text style={styles.deviceType}>
          Type: {item.device_type.replace('_', ' ')}
        </Text>
        <Text style={styles.deviceTime}>
          Registered: {new Date(item.registered_at).toLocaleDateString()}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const desktopDevices = devices.filter((d) => d.device_type === 'windows_desktop');
  const otherDevices = devices.filter((d) => d.device_type !== 'windows_desktop');

  return (
    <View style={styles.container}>
      <FlatList
        data={[...desktopDevices, ...otherDevices]}
        renderItem={renderDevice}
        keyExtractor={(item) => item.device_id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No devices connected</Text>
            <Text style={styles.emptySubtext}>
              Make sure your Iris Agent desktop app is running
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 10,
  },
  deviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  selectedDevice: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f7ff',
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  deviceId: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  selectedBadge: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },
  deviceType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  deviceTime: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
    textAlign: 'center',
  },
});

import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export interface Message {
  id: string;
  type: 'task' | 'response' | 'status' | 'error';
  sender_device_id: string;
  sender_device_type: 'android' | 'ios' | 'windows_desktop';
  recipient_device_id?: string;
  content: Record<string, any>;
  timestamp: string;
  status: 'pending' | 'sent' | 'received' | 'processed';
}

export interface Device {
  device_id: string;
  device_type: string;
  registered_at: string;
  metadata?: Record<string, any>;
}

export class MessagingService {
  private static instance: MessagingService;
  private client: AxiosInstance;
  private deviceId: string | null = null;

  private constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  static getInstance(): MessagingService {
    if (!MessagingService.instance) {
      MessagingService.instance = new MessagingService();
    }
    return MessagingService.instance;
  }

  static async initializeDevice(): Promise<string> {
    const service = MessagingService.getInstance();
    return service.initializeDevice();
  }

  async initializeDevice(): Promise<string> {
    try {
      // Check if device already registered
      let deviceId = await AsyncStorage.getItem('device_id');
      if (!deviceId) {
        deviceId = uuid.v4() as string;
        await AsyncStorage.setItem('device_id', deviceId);
      }

      this.deviceId = deviceId;

      // Register device with backend
      await this.registerDevice(deviceId);

      return deviceId;
    } catch (error) {
      throw new Error(`Failed to initialize device: ${error}`);
    }
  }

  async registerDevice(deviceId: string): Promise<Device> {
    try {
      const response = await this.client.post('/devices/register', {
        device_id: deviceId,
        device_type: 'android',
        metadata: {
          platform: 'android',
          timestamp: new Date().toISOString(),
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to register device: ${error}`);
    }
  }

  async sendMessage(
    type: 'task' | 'response',
    recipientDeviceId: string,
    content: Record<string, any>
  ): Promise<Message> {
    if (!this.deviceId) {
      throw new Error('Device not initialized');
    }

    try {
      const response = await this.client.post('/messages/send', {
        message_type: type,
        sender_device_id: this.deviceId,
        recipient_device_id: recipientDeviceId,
        content,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to send message: ${error}`);
    }
  }

  async getMessages(
    messageType?: string,
    status?: string
  ): Promise<Message[]> {
    if (!this.deviceId) {
      throw new Error('Device not initialized');
    }

    try {
      const params: Record<string, any> = {};
      if (messageType) params.message_type = messageType;
      if (status) params.status = status;

      const response = await this.client.get(`/messages/device/${this.deviceId}`, {
        params,
      });
      return response.data.messages || [];
    } catch (error) {
      throw new Error(`Failed to get messages: ${error}`);
    }
  }

  async getDevices(deviceType?: string): Promise<Device[]> {
    try {
      const params: Record<string, any> = {};
      if (deviceType) params.device_type = deviceType;

      const response = await this.client.get('/devices', { params });
      return response.data.devices || [];
    } catch (error) {
      throw new Error(`Failed to get devices: ${error}`);
    }
  }

  async getDesktopDevices(): Promise<Device[]> {
    return this.getDevices('windows_desktop');
  }

  async sendTaskToDesktop(
    desktopDeviceId: string,
    task: string
  ): Promise<Message> {
    return this.sendMessage('task', desktopDeviceId, {
      task,
      timestamp: new Date().toISOString(),
    });
  }

  getDeviceId(): string | null {
    return this.deviceId;
  }
}

export default MessagingService.getInstance();

import { create } from 'zustand';

interface Device {
  device_id: string;
  device_type: string;
  registered_at: string;
  metadata?: Record<string, any>;
}

interface DeviceStore {
  deviceId: string | null;
  devices: Device[];
  selectedDesktopId: string | null;
  setDeviceId: (id: string) => void;
  setDevices: (devices: Device[]) => void;
  setSelectedDesktopId: (id: string | null) => void;
  addDevice: (device: Device) => void;
  removeDevice: (deviceId: string) => void;
}

export const useDeviceStore = create<DeviceStore>((set) => ({
  deviceId: null,
  devices: [],
  selectedDesktopId: null,
  setDeviceId: (id) => set({ deviceId: id }),
  setDevices: (devices) => set({ devices }),
  setSelectedDesktopId: (id) => set({ selectedDesktopId: id }),
  addDevice: (device) =>
    set((state) => ({
      devices: [device, ...state.devices.filter((d) => d.device_id !== device.device_id)],
    })),
  removeDevice: (deviceId) =>
    set((state) => ({
      devices: state.devices.filter((d) => d.device_id !== deviceId),
    })),
}));

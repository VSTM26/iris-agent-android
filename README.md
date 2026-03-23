# Iris Agent Android App

Control your desktop AI assistant from your Android phone. Send tasks to your Windows Iris Agent desktop app and receive responses in real-time.

## Features

- **Remote Task Execution**: Send tasks from your phone to your desktop
- **Real-time Messaging**: Communicate with your desktop AI assistant
- **Device Management**: View and manage connected devices
- **Configurable Backend**: Connect to any Iris Agent backend server
- **Cross-Device Sync**: Seamless integration with desktop and iOS apps

## Prerequisites

- Android 8.0 or higher
- Expo CLI: `npm install -g expo-cli`
- Node.js 18+

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/VSTM26/iris-agent-android.git
cd iris-agent-android
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Backend URL

Edit `src/services/MessagingService.ts` and update the API base URL:

```typescript
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://your-backend-url:8000';
```

Or set the environment variable:

```bash
export EXPO_PUBLIC_API_URL=http://your-backend-url:8000
```

## Running the App

### Development Mode

```bash
npm start
```

Then select:
- `a` for Android emulator
- `i` for iOS simulator
- `w` for web
- `r` to reload

### Android Emulator

```bash
npm run android
```

### Physical Device

1. Install Expo Go app from Google Play Store
2. Run `npm start`
3. Scan the QR code with Expo Go

## Project Structure

```
iris-agent-android/
├── App.tsx                  # Main app component
├── src/
│   ├── screens/            # Screen components
│   │   ├── ChatScreen.tsx
│   │   ├── DevicesScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/           # API and messaging services
│   │   └── MessagingService.ts
│   ├── store/              # Zustand state management
│   │   └── deviceStore.ts
│   └── types/              # TypeScript types
├── package.json
└── README.md
```

## Usage

### 1. Connect to Desktop

- Make sure your Iris Agent desktop app is running
- Open the "Devices" tab to see connected devices
- Select your desktop device

### 2. Send Tasks

- Go to the "Chat" tab
- Type your task (e.g., "Browse google.com", "Check my GitHub repos")
- Tap "Send"
- Wait for your desktop to process and respond

### 3. Configure Settings

- Go to the "Settings" tab
- Update backend URL if needed
- Enable/disable auto-connect and notifications
- Save settings

## Available Tasks

### Web Browsing
```
"Open google.com"
"Search for machine learning"
"Click the first search result"
```

### GitHub Integration
```
"List my repositories"
"Get details about owner/repo"
"Create an issue in owner/repo"
```

### General Tasks
```
"What time is it?"
"Get the weather"
"Help me with a task"
```

## Troubleshooting

### Cannot Connect to Desktop

1. Verify desktop app is running
2. Check backend URL in settings
3. Ensure both devices are on the same network
4. Check firewall settings

### Messages Not Sending

1. Check internet connection
2. Verify backend URL is correct
3. Check device registration in settings
4. Try refreshing the devices list

### App Crashes

1. Clear app cache and data
2. Reinstall the app
3. Check console logs: `npm start` shows debug info

## API Integration

The app communicates with the Iris Agent backend via REST API:

### Register Device

```
POST /devices/register
{
  "device_id": "uuid",
  "device_type": "android",
  "metadata": {...}
}
```

### Send Message

```
POST /messages/send
{
  "message_type": "task",
  "sender_device_id": "uuid",
  "recipient_device_id": "uuid",
  "content": {"task": "..."}
}
```

### Get Messages

```
GET /messages/device/{device_id}
```

### List Devices

```
GET /devices
```

## Development

### Adding New Screens

1. Create a new file in `src/screens/`
2. Add to navigation in `App.tsx`
3. Use `useDeviceStore` for state management

### Adding New Services

1. Create a new file in `src/services/`
2. Export singleton instance
3. Use in components via hooks

### State Management

Using Zustand for state:

```typescript
import { useDeviceStore } from '../store/deviceStore';

const { deviceId, selectedDesktopId } = useDeviceStore();
```

## Building for Production

### Android APK

```bash
eas build --platform android
```

### Android App Bundle

```bash
eas build --platform android --app-bundle
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

- GitHub Issues: https://github.com/VSTM26/iris-agent-android/issues
- Documentation: See main Iris Agent repo

## Related Projects

- [Iris Agent Desktop](https://github.com/VSTM26/new-iris-agent)
- [Iris Agent iOS](https://github.com/VSTM26/iris-agent-ios)
- [ElectronBrowser](https://github.com/VSTM26/ElectronBrowser)

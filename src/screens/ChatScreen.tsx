import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  LinearGradient,
} from 'react-native';
import MessagingService from '../services/MessagingService';
import { useDeviceStore } from '../store/deviceStore';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const GRADIENT_COLORS = ['#667eea', '#764ba2'];
const USER_BUBBLE_COLOR = '#667eea';
const ASSISTANT_BUBBLE_COLOR = '#f0f0f0';

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [desktopConnected, setDesktopConnected] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const { selectedDesktopId, deviceId } = useDeviceStore();

  useEffect(() => {
    checkDesktopConnection();
    loadMessages();
    // Animate initial load
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const checkDesktopConnection = async () => {
    try {
      const desktops = await MessagingService.getDesktopDevices();
      setDesktopConnected(desktops.length > 0);
      if (desktops.length > 0 && !selectedDesktopId) {
        useDeviceStore.setState({ selectedDesktopId: desktops[0].device_id });
      }
    } catch (error) {
      console.error('Failed to check desktop connection:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const msgs = await MessagingService.getMessages();
      const chatMessages: ChatMessage[] = msgs.map((msg) => ({
        id: msg.id,
        role: msg.sender_device_type === 'android' ? 'user' : 'assistant',
        content: msg.content.task || msg.content.response || JSON.stringify(msg.content),
        timestamp: new Date(msg.timestamp),
      }));
      setMessages(chatMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedDesktopId || !deviceId) {
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      await MessagingService.sendTaskToDesktop(selectedDesktopId, input);
      setTimeout(async () => {
        await loadMessages();
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to send message:', error);
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    const messageAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(messageAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View
        style={[
          styles.messageWrapper,
          {
            opacity: messageAnim,
            transform: [
              {
                translateY: messageAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View
          style={[
            styles.messageContainer,
            isUser ? styles.userMessage : styles.assistantMessage,
          ]}
        >
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>
            {item.content}
          </Text>
          <Text style={[styles.timestamp, isUser && styles.userTimestamp]}>
            {item.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </Animated.View>
    );
  };

  if (!desktopConnected) {
    return (
      <LinearGradient colors={GRADIENT_COLORS} style={styles.container}>
        <Animated.View
          style={[
            styles.centerContent,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.noConnectionIcon}>
            <Text style={styles.iconText}>📱</Text>
          </View>
          <Text style={styles.errorText}>No Desktop Connected</Text>
          <Text style={styles.errorSubtext}>
            Make sure your Iris Agent desktop app is running and accessible
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={checkDesktopConnection}
          >
            <Text style={styles.retryButtonText}>Retry Connection</Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#f8f9fa', '#ffffff']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          contentContainerStyle={styles.messagesList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Text style={styles.emptyIcon}>💬</Text>
              </View>
              <Text style={styles.emptyText}>Start a Conversation</Text>
              <Text style={styles.emptySubtext}>
                Send your first message to your desktop AI
              </Text>
            </View>
          }
          scrollEventThrottle={16}
        />

        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type your message..."
              placeholderTextColor="#999"
              value={input}
              onChangeText={setInput}
              editable={!loading}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!input.trim() || loading) && styles.sendButtonDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={!input.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.sendButtonText}>➤</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardView: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  messagesList: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  messageWrapper: {
    marginVertical: 6,
  },
  messageContainer: {
    marginHorizontal: 8,
    padding: 12,
    borderRadius: 16,
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: USER_BUBBLE_COLOR,
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: ASSISTANT_BUBBLE_COLOR,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    marginTop: 6,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 64,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  inputSection: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    marginLeft: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: USER_BUBBLE_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: USER_BUBBLE_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0.1,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  noConnectionIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconText: {
    fontSize: 40,
  },
  errorText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

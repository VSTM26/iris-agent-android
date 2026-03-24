import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  LinearGradient,
} from 'react-native';
import AgentService, { Agent, AgentTemplate } from '../services/AgentService';

const GRADIENT_COLORS = ['#667eea', '#764ba2'];

export default function AgentsScreen() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [templates, setTemplates] = useState<Record<string, AgentTemplate>>({});
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    agent_type: 'general',
    model: 'mistral',
    system_prompt: '',
    tools: ['http', 'github'],
    temperature: 0.7,
    max_tokens: 2000,
  });

  useEffect(() => {
    loadAgents();
    loadTemplates();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const data = await AgentService.listAgents();
      setAgents(data);
    } catch (error) {
      console.error('Failed to load agents:', error);
      Alert.alert('Error', 'Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const data = await AgentService.listTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const handleCreateAgent = async () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const newAgent = await AgentService.createAgent(formData);
      setAgents([...agents, newAgent]);
      setShowCreateModal(false);
      setFormData({
        name: '',
        description: '',
        agent_type: 'general',
        model: 'mistral',
        system_prompt: '',
        tools: ['http', 'github'],
        temperature: 0.7,
        max_tokens: 2000,
      });
      Alert.alert('Success', 'Agent created successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to create agent');
    }
  };

  const handleCreateFromTemplate = async (templateName: string) => {
    try {
      const newAgent = await AgentService.createFromTemplate(templateName);
      setAgents([...agents, newAgent]);
      setShowTemplateModal(false);
      Alert.alert('Success', 'Agent created from template');
    } catch (error) {
      Alert.alert('Error', 'Failed to create agent from template');
    }
  };

  const handleStartAgent = async (agentId: string) => {
    try {
      const updated = await AgentService.startAgent(agentId);
      setAgents(agents.map(a => a.id === agentId ? updated : a));
    } catch (error) {
      Alert.alert('Error', 'Failed to start agent');
    }
  };

  const handleStopAgent = async (agentId: string) => {
    try {
      const updated = await AgentService.stopAgent(agentId);
      setAgents(agents.map(a => a.id === agentId ? updated : a));
    } catch (error) {
      Alert.alert('Error', 'Failed to stop agent');
    }
  };

  const handleDeleteAgent = (agentId: string) => {
    Alert.alert('Delete Agent', 'Are you sure you want to delete this agent?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await AgentService.deleteAgent(agentId);
            setAgents(agents.filter(a => a.id !== agentId));
          } catch (error) {
            Alert.alert('Error', 'Failed to delete agent');
          }
        },
      },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return '#4caf50';
      case 'paused':
        return '#ff9800';
      case 'stopped':
        return '#999';
      case 'error':
        return '#d32f2f';
      default:
        return '#667eea';
    }
  };

  const renderAgent = ({ item }: { item: Agent }) => (
    <View style={styles.agentCard}>
      <View style={styles.agentHeader}>
        <View style={styles.agentInfo}>
          <Text style={styles.agentName}>{item.config.name}</Text>
          <Text style={styles.agentDescription}>{item.config.description}</Text>
        </View>
        <View
          style={[styles.agentStatus, { backgroundColor: getStatusColor(item.status) }]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.agentDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Type:</Text>
          <Text style={styles.detailValue}>{item.config.agent_type}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Model:</Text>
          <Text style={styles.detailValue}>{item.config.model}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Messages:</Text>
          <Text style={styles.detailValue}>{item.message_count}</Text>
        </View>
      </View>

      <View style={styles.agentActions}>
        {item.status === 'stopped' || item.status === 'created' ? (
          <TouchableOpacity
            style={[styles.btn, styles.btnSuccess]}
            onPress={() => handleStartAgent(item.id)}
          >
            <Text style={styles.btnText}>▶ Start</Text>
          </TouchableOpacity>
        ) : item.status === 'running' ? (
          <TouchableOpacity
            style={[styles.btn, styles.btnWarning]}
            onPress={() => handleStopAgent(item.id)}
          >
            <Text style={styles.btnText}>⏹ Stop</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={[styles.btn, styles.btnDanger]}
          onPress={() => handleDeleteAgent(item.id)}
        >
          <Text style={styles.btnText}>🗑 Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient colors={GRADIENT_COLORS} style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading agents...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#f8f9fa', '#ffffff']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🤖 Agent Management</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary]}
            onPress={() => setShowCreateModal(true)}
          >
            <Text style={styles.btnText}>+ Create</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.btnSecondary]}
            onPress={() => setShowTemplateModal(true)}
          >
            <Text style={styles.btnText}>📋 Template</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={agents}
        renderItem={renderAgent}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🤖</Text>
            <Text style={styles.emptyText}>No agents yet</Text>
            <Text style={styles.emptySubtext}>Create your first agent to get started</Text>
          </View>
        }
      />

      {/* Create Agent Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <LinearGradient colors={GRADIENT_COLORS} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Agent</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Agent Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Research Assistant"
                  value={formData.name}
                  onChangeText={text => setFormData({ ...formData, name: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  placeholder="Describe what this agent does"
                  value={formData.description}
                  onChangeText={text => setFormData({ ...formData, description: text })}
                  multiline
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Type</Text>
                  <View style={styles.select}>
                    <Text style={styles.selectText}>{formData.agent_type}</Text>
                  </View>
                </View>

                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Model</Text>
                  <View style={styles.select}>
                    <Text style={styles.selectText}>{formData.model}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>System Prompt</Text>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  placeholder="Custom instructions for the agent"
                  value={formData.system_prompt}
                  onChangeText={text => setFormData({ ...formData, system_prompt: text })}
                  multiline
                />
              </View>

              <View style={styles.formActions}>
                <TouchableOpacity
                  style={[styles.btn, styles.btnSecondary]}
                  onPress={() => setShowCreateModal(false)}
                >
                  <Text style={styles.btnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, styles.btnPrimary]}
                  onPress={handleCreateAgent}
                >
                  <Text style={styles.btnText}>Create</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </LinearGradient>
      </Modal>

      {/* Template Modal */}
      <Modal visible={showTemplateModal} animationType="slide" transparent>
        <LinearGradient colors={GRADIENT_COLORS} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Template</Text>
              <TouchableOpacity onPress={() => setShowTemplateModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.templatesGrid}>
              {Object.entries(templates).map(([key, template]) => (
                <TouchableOpacity
                  key={key}
                  style={styles.templateCard}
                  onPress={() => handleCreateFromTemplate(key)}
                >
                  <Text style={styles.templateName}>{template.name}</Text>
                  <Text style={styles.templateDescription}>{template.description}</Text>
                  <Text style={styles.templateUse}>Use Template →</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </LinearGradient>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  listContent: {
    padding: 12,
    paddingBottom: 20,
  },
  agentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  agentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  agentDescription: {
    fontSize: 13,
    color: '#999',
  },
  agentStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  agentDetails: {
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
  agentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: '#667eea',
    flex: 1,
  },
  btnSecondary: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flex: 1,
  },
  btnSuccess: {
    backgroundColor: '#4caf50',
    flex: 1,
  },
  btnWarning: {
    backgroundColor: '#ff9800',
    flex: 1,
  },
  btnDanger: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flex: 1,
  },
  btnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
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
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  closeBtn: {
    fontSize: 24,
    color: '#999',
  },
  form: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  select: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  selectText: {
    fontSize: 14,
    color: '#333',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  templatesGrid: {
    padding: 16,
  },
  templateCard: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  templateDescription: {
    fontSize: 13,
    color: '#999',
    marginBottom: 12,
  },
  templateUse: {
    fontSize: 13,
    color: '#667eea',
    fontWeight: '600',
  },
});

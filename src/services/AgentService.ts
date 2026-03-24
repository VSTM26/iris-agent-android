/**
 * Agent Service for Mobile Apps
 * Handles agent creation, management, and lifecycle
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export interface AgentConfig {
  name: string;
  description: string;
  agent_type: string;
  model?: string;
  system_prompt?: string;
  tools?: string[];
  temperature?: number;
  max_tokens?: number;
  timeout?: number;
  memory_enabled?: boolean;
  memory_size?: number;
  auto_save?: boolean;
  metadata?: Record<string, any>;
}

export interface Agent {
  id: string;
  user_id: string;
  config: AgentConfig;
  status: string;
  created_at: string;
  updated_at: string;
  started_at?: string;
  stopped_at?: string;
  message_count: number;
  error_message?: string;
  metadata: Record<string, any>;
}

export interface AgentTemplate {
  name: string;
  description: string;
  agent_type: string;
  system_prompt: string;
  tools: string[];
  temperature: number;
  max_tokens: number;
}

class AgentService {
  private userId: string = 'default-user';

  constructor() {
    this.loadUserId();
  }

  private async loadUserId() {
    try {
      const stored = await AsyncStorage.getItem('user_id');
      if (stored) {
        this.userId = stored;
      } else {
        this.userId = `user-${Date.now()}`;
        await AsyncStorage.setItem('user_id', this.userId);
      }
    } catch (error) {
      console.error('Failed to load user ID:', error);
    }
  }

  async createAgent(config: AgentConfig): Promise<Agent> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/agents/create?user_id=${this.userId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create agent: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Create agent error:', error);
      throw error;
    }
  }

  async getAgent(agentId: string): Promise<Agent> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/agents/${agentId}`);

      if (!response.ok) {
        throw new Error(`Failed to get agent: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get agent error:', error);
      throw error;
    }
  }

  async listAgents(status?: string): Promise<Agent[]> {
    try {
      let url = `${API_BASE_URL}/api/agents?user_id=${this.userId}`;
      if (status) {
        url += `&status=${status}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to list agents: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('List agents error:', error);
      throw error;
    }
  }

  async updateAgentConfig(agentId: string, config: AgentConfig): Promise<Agent> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/agents/${agentId}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error(`Failed to update agent: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Update agent error:', error);
      throw error;
    }
  }

  async startAgent(agentId: string): Promise<Agent> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/agents/${agentId}/start`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to start agent: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Start agent error:', error);
      throw error;
    }
  }

  async stopAgent(agentId: string): Promise<Agent> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/agents/${agentId}/stop`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to stop agent: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Stop agent error:', error);
      throw error;
    }
  }

  async pauseAgent(agentId: string): Promise<Agent> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/agents/${agentId}/pause`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to pause agent: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Pause agent error:', error);
      throw error;
    }
  }

  async resumeAgent(agentId: string): Promise<Agent> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/agents/${agentId}/resume`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to resume agent: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Resume agent error:', error);
      throw error;
    }
  }

  async deleteAgent(agentId: string): Promise<Agent> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/agents/${agentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete agent: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Delete agent error:', error);
      throw error;
    }
  }

  async getAgentStats(agentId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/agents/${agentId}/stats`);

      if (!response.ok) {
        throw new Error(`Failed to get agent stats: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get agent stats error:', error);
      throw error;
    }
  }

  async listTemplates(): Promise<Record<string, AgentTemplate>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/agents/templates/list`);

      if (!response.ok) {
        throw new Error(`Failed to list templates: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('List templates error:', error);
      throw error;
    }
  }

  async createFromTemplate(templateName: string): Promise<Agent> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/agents/templates/${templateName}/create?user_id=${this.userId}`,
        { method: 'POST' }
      );

      if (!response.ok) {
        throw new Error(`Failed to create agent from template: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Create from template error:', error);
      throw error;
    }
  }
}

export default new AgentService();

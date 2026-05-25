import { api } from './api';
import type { AllocationRule } from '../types';

export const allocationRulesApi = {
  /**
   * Create a new allocation rule
   */
  createAllocationRule: async (rule: Omit<AllocationRule, 'ruleId' | 'createdAt' | 'updatedAt'>) => {
    const response = await api.post('/allocation-rules', rule);
    return response.data;
  },

  /**
   * Get all allocation rules with optional filters
   */
  listAllocationRules: async (filters?: {
    facilityId?: string;
    vehicleTypeId?: string;
    status?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDir?: string;
  }) => {
    const response = await api.get('/allocation-rules', { params: filters });
    return response.data;
  },

  /**
   * Get a specific allocation rule by ID
   */
  getAllocationRule: async (ruleId: string) => {
    const response = await api.get(`/allocation-rules/${ruleId}`);
    return response.data;
  },

  /**
   * Update an allocation rule
   */
  updateAllocationRule: async (
    ruleId: string,
    rule: Partial<AllocationRule>
  ) => {
    const response = await api.put(`/allocation-rules/${ruleId}`, rule);
    return response.data;
  },

  /**
   * Update the status of an allocation rule
   */
  updateAllocationRuleStatus: async (
    ruleId: string,
    status: 'active' | 'inactive',
    updatedBy?: string
  ) => {
    const response = await api.patch(`/allocation-rules/${ruleId}/status`, {
      status,
      updatedBy,
    });
    return response.data;
  },

  /**
   * Get the allocation matrix for a facility
   */
  getAllocationMatrix: async (facilityId: string) => {
    const response = await api.get('/allocation-matrix', {
      params: { facilityId },
    });
    return response.data;
  },
};

import api from './apiutils';
import { api as configApi } from './config';
import { Subscription, SubscriptionPlan } from '../interface';

export interface UserSubscriptionsResponse {
  success: boolean;
  subscriptions: Subscription[];
  currentUsage: {
    projects: number;
    specs: number;
  };
  message?: string;
}

export interface SubscriptionPlansResponse {
  success: boolean;
  plans: SubscriptionPlan[];
  message?: string;
}

/**
 * Fetch user's subscriptions and current usage
 */
export const getUserSubscriptions = async (): Promise<UserSubscriptionsResponse> => {
  try {
    const response = await api.get(configApi.API_URL.subscriptions.getUserSubscriptions);
    return response.data;
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    throw error;
  }
};

/**
 * Fetch available subscription plans
 */
export const getSubscriptionPlans = async (): Promise<SubscriptionPlansResponse> => {
  try {
    const response = await api.get(configApi.API_URL.subscriptions.getPlans);
    return response.data;
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    throw error;
  }
};

/**
 * Create a new subscription
 */
export const createSubscription = async (planId: string): Promise<any> => {
  try {
    const response = await api.post(configApi.API_URL.subscriptions.create, { planId });
    return response.data;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

/**
 * Update an existing subscription
 */
export const updateSubscription = async (subscriptionId: string, data: any): Promise<any> => {
  try {
    const response = await api.put(`${configApi.API_URL.subscriptions.update}/${subscriptionId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

/**
 * Cancel a subscription
 */
export const cancelSubscription = async (subscriptionId: string): Promise<any> => {
  try {
    const response = await api.post(`${configApi.API_URL.subscriptions.cancel}/${subscriptionId}`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
};

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

// 添加请求拦截器，自动添加认证头
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export interface SubscriptionInfo {
  subscription_level: string;
  subscription_name: string;
  subscription_expire_at: string | null;
  daily_generation_used: number;
  daily_generation_limit: number;
  daily_generation_remaining: number;
  monthly_word_limit: number;
  project_limit: number;
  price_monthly: number;
  price_yearly: number;
  features: string[];
}

export interface UsageCheckResult {
  allowed: boolean;
  reason?: string;
  daily_generation_used?: number;
  daily_generation_limit?: number;
  daily_generation_remaining?: number;
  upgrade_hint?: string;
}

export interface SubscriptionTier {
  level: string;
  name: string;
  daily_limit: number;
  monthly_word_limit: number;
  project_limit: number;
  price_monthly: number;
  price_yearly: number;
  recommended: boolean;
  features: string[];
}

export const subscriptionApi = {
  getSubscriptionInfo: () =>
    api.get<SubscriptionInfo>('/subscription/info').then((res) => res.data),

  getSubscriptionTiers: () =>
    api.get<SubscriptionTier[]>('/subscription/tiers').then((res) => res.data),

  checkUsage: () =>
    api.post<UsageCheckResult>('/subscription/check-usage').then((res) => res.data),

  incrementUsage: () =>
    api.post<UsageCheckResult>('/subscription/increment-usage').then((res) => res.data),

  upgradeSubscription: (level: string, months: number = 1) =>
    api.post(`/subscription/upgrade?level=${level}&months=${months}`).then((res) => res.data),
};

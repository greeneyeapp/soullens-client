import { create } from 'zustand';
import api from '@/lib/axiosInstance';

interface CreditCostsState {
  creditCosts: {
    analysis_types?: Record<string, number>;
    speeds?: Record<string, number>;
  };
  loading: boolean;
  fetchCreditCosts: () => Promise<void>;
}

export const useCreditCosts = create<CreditCostsState>((set) => ({
  creditCosts: {},
  loading: false,
  fetchCreditCosts: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/app/credit-costs');
      set({ creditCosts: response.data, loading: false });
    } catch (error: any) {
      console.error('🚨 Kredi maliyeti çekilemedi:', error.response?.data || error.message || error);
      set({ loading: false });
    }
  },
}));
import { create } from 'zustand';
import api from '@/lib/axiosInstance'; // Axios instance'ınız

type HistoryEntry = any; // İsterseniz daha spesifik bir tip tanımlayabilirsiniz

// API'den veya setUserData'ya gelen veri yapısı
interface UserDataInput {
  device_id?: string | null; // device_id opsiyonel ve null olabilir
  credits?: number | null;
  has_daily_free_premium_analysis?: boolean | null; // API'den null gelebilir başlangıçta
  history?: HistoryEntry[] | null;
  // Backend'den gelen diğer kullanıcı alanları da buraya eklenebilir
}

// Store içinde tutulacak state yapısı
interface UserState {
  device_id: string | null;
  credits: number | null;
  has_daily_free_premium_analysis: boolean | null; // Başlangıçta null olabilir
  history: HistoryEntry[];
  setUserData: (data: UserDataInput) => void;
  setUserCredits: (credits: number | null) => void;
  clearUserData: () => void;
  fetchAndSetUserData: () => Promise<void>; // Yeni eylem
}

const initialState: {
  device_id: string | null;
  credits: number | null;
  has_daily_free_premium_analysis: boolean | null;
  history: HistoryEntry[];
} = {
  device_id: null,
  credits: null,
  has_daily_free_premium_analysis: null, // Başlangıçta bilinmiyor olabilir
  history: [],
};

export const useUserStore = create<UserState>((set) => ({
  ...initialState,

  setUserData: (data) => {
    set((state) => ({
      // Gelen data null veya undefined ise mevcut state'i korumak yerine initialState'e dönmek daha iyi olabilir
      // ya da sadece tanımlı alanları güncellemek. Mevcut implementasyon null/undefined kontrolü yapıyor.
      device_id: data?.device_id !== undefined ? data.device_id : state.device_id,
      credits: typeof data?.credits === 'number' ? data.credits : state.credits,
      has_daily_free_premium_analysis: typeof data?.has_daily_free_premium_analysis === 'boolean'
        ? data.has_daily_free_premium_analysis
        : state.has_daily_free_premium_analysis,
      history: Array.isArray(data?.history) ? data.history : state.history,
    }));
  },

  setUserCredits: (credits) => {
    set({ credits: typeof credits === 'number' ? credits : null });
  },

  clearUserData: () => {
    set(initialState);
  },

  fetchAndSetUserData: async () => {
    try {
      // Backend'deki /user endpoint'inizin POST mu GET mi olduğunu kontrol edin.
      // Token header'da olduğu için genellikle body'siz bir POST veya GET olabilir.
      const response = await api.post('/user'); // Veya api.get('/user')

      if (response && response.data) {
        // Gelen verinin UserDataInput tipine uygun olduğundan emin olun
        const userDataFromAPI: UserDataInput = {
            device_id: response.data.device_id, // Bu alan /user endpoint'inden dönüyor mu?
            credits: response.data.credits,
            has_daily_free_premium_analysis: response.data.has_daily_free_premium_analysis,
            history: response.data.history,
        };
        set({
            device_id: userDataFromAPI.device_id ?? null,
            credits: typeof userDataFromAPI.credits === 'number' ? userDataFromAPI.credits : null,
            has_daily_free_premium_analysis: typeof userDataFromAPI.has_daily_free_premium_analysis === 'boolean'
                ? userDataFromAPI.has_daily_free_premium_analysis
                : null, // Bilinmiyorsa null
            history: Array.isArray(userDataFromAPI.history) ? userDataFromAPI.history : [],
        });
      }
    } catch (error) {
      console.error("Failed to fetch and set user data:", error);
      // Hata durumunda belki mevcut state'i korumak veya bir hata state'i set etmek isteyebilirsiniz.
    }
  },
}));
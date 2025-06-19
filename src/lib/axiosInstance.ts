import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Alert, BackHandler } from 'react-native';
import i18n from './i18n';

const apiUrl = Constants.expoConfig?.extra?.API_URL;
const CUSTOM_JWT_KEY = 'custom_jwt';
const api = axios.create({
  baseURL: apiUrl,
  timeout: 120000,
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const noAuthEndpoints = ['/auth/token', '/health'];
    const requiresAuth = !noAuthEndpoints.some(endpoint => config.url?.startsWith(endpoint));

    if (requiresAuth) {
      const token = await SecureStore.getItemAsync(CUSTOM_JWT_KEY);
      if (!config.headers) config.headers = {};
      // Token varsa header'a ekle
      if (token) {
        config.headers['x-auth-token'] = `Bearer ${token}`;
      }
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest?._retry) {
       if (originalRequest) {
           originalRequest._retry = true;
       }
      try {
        await SecureStore.deleteItemAsync(CUSTOM_JWT_KEY);

        Alert.alert(
          i18n.t('sessionExpiredTitle'),
          i18n.t('sessionExpiredMessage'),
          [
            {
              text: i18n.t('ok'),
              onPress: () => BackHandler.exitApp(),
              style: 'default',
            },
          ],
          { cancelable: false }
        );
        return Promise.reject(error);

      } catch (err) {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

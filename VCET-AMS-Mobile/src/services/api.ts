import axios from 'axios';
import Constants from 'expo-constants';
import NetInfo from '@react-native-community/netinfo';
import { useAuthStore } from '../store/auth';
import { queryClient, stableStringify, type CachedAxiosResponse } from './queryClient';

type AxiosCacheConfig = {
  method?: string;
  url?: string;
  params?: unknown;
  data?: unknown;
  baseURL?: string;
};

function buildCacheKey(config: AxiosCacheConfig): string {
  const method = (config.method ?? 'get').toLowerCase();
  const url = `${config.baseURL ?? ''}${config.url ?? ''}`;
  const params = stableStringify(config.params);
  const data = stableStringify(config.data);
  return [method, url, params, data].join('|');
}

const API_URL = Constants.expoConfig?.extra?.apiUrl ?? 'http://10.0.2.2:3000';

const API = axios.create({
  baseURL: API_URL,
});

API.interceptors.request.use(
  async (config) => {
    const netInfo = await NetInfo.fetch();
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    const cacheKey = buildCacheKey(config as AxiosCacheConfig);
    (config as AxiosCacheConfig & { __cacheKey?: string }).__cacheKey = cacheKey;

    if (netInfo.isConnected === false) {
      const cachedResponse = queryClient.getQueryData<CachedAxiosResponse>(['axios-cache', cacheKey]);
      if (cachedResponse) {
        config.adapter = async () => cachedResponse as any;
        return config;
      }

      config.adapter = async () => {
        throw Object.assign(new Error('Offline and no cached response available'), {
          status: 503,
          isOffline: true,
        });
      };
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => {
    const cacheKey = (response.config as AxiosCacheConfig & { __cacheKey?: string }).__cacheKey
      ?? buildCacheKey(response.config as AxiosCacheConfig);

    const cachedResponse: CachedAxiosResponse = {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers as Record<string, unknown>,
      config: response.config,
      request: response.request,
    };

    queryClient.setQueryData(['axios-cache', cacheKey], cachedResponse);
    return response;
  },
  (error) => {
    const config = error?.config as AxiosCacheConfig | undefined;
    if (config) {
      const cacheKey = (config as AxiosCacheConfig & { __cacheKey?: string }).__cacheKey
        ?? buildCacheKey(config);
      const cachedResponse = queryClient.getQueryData<CachedAxiosResponse>(['axios-cache', cacheKey]);
      if (cachedResponse) {
        return Promise.resolve(cachedResponse as any);
      }
    }

    return Promise.reject(error);
  }
);

export default API;

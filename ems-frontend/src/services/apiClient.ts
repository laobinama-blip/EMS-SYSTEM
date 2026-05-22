import axios from 'axios';
import type { AxiosResponse } from 'axios';
import * as fixtures from '../mocks/fixtures';

// Create Axios instance pointing to local proxy /api
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to determine mock response based on request URL path and method
const getMockResponse = (url: string, _method = 'get', _body: any = null): any => {
  const cleanUrl = url.split('?')[0].replace(/^\/api/, '').replace(/^\/kpi/, '');

  switch (cleanUrl) {
    case '/common/header-status':
      return fixtures.HEADER_STATUS;

    case '/efficiency/work-summary':
      return fixtures.WORK_SUMMARY;

    case '/efficiency/summary-cards':
      return fixtures.SUMMARY_CARDS;

    case '/efficiency/charts':
      return fixtures.EFFICIENCY_CHARTS;

    case '/network/topology':
      return fixtures.TOPOLOGY_DATA;

    case '/dispatch/algorithm-efficiency':
      return fixtures.ALGORITHM_EFFICIENCY;

    case '/dispatch/hymala-stability':
      return fixtures.HYMALA_STABILITY;

    case '/dispatch/secondary-events':
      return fixtures.SECONDARY_EVENTS;

    case '/energy/device-types':
      return [
        { code: 'VEHICLE', name: '集卡车辆' },
        { code: 'QC', name: '岸桥设备' },
        { code: 'YC', name: '场桥设备' }
      ];

    case '/energy/devices':
      return [
        { deviceCode: 'T101', deviceName: 'T101' },
        { deviceCode: 'T102', deviceName: 'T102' },
        { deviceCode: 'T103', deviceName: 'T103' },
        { deviceCode: 'T104', deviceName: 'T104' },
        { deviceCode: 'T105', deviceName: 'T105' },
        { deviceCode: 'T106', deviceName: 'T106' },
        { deviceCode: 'QC301', deviceName: 'QC301' },
        { deviceCode: 'QC302', deviceName: 'QC302' },
        { deviceCode: 'RTG01', deviceName: 'RTG01' },
        { deviceCode: 'RTG02', deviceName: 'RTG02' }
      ];

    case '/energy/single-box-energy-statistics':
      return fixtures.SINGLE_BOX_ENERGY_STATISTICS;

    case '/energy/single-box-energy-cost':
      return fixtures.SINGLE_BOX_ENERGY_COST;

    case '/energy/carbon-emission-distribution':
      return fixtures.SINGLE_BOX_CARBON_EMISSION;

    case '/energy/energy-trend':
      return fixtures.ENERGY_TREND;

    case '/energy/energy-ranking':
      return fixtures.ENERGY_RANKING;

    case '/energy/device-energy-ratio':
      return fixtures.DEVICE_ENERGY_RATIO;

    case '/energy/traditional-vs-green-power':
      return fixtures.TRADITIONAL_VS_GREEN_POWER;

    case '/energy/time-of-use-electricity':
      return fixtures.TIME_OF_USE_ELECTRICITY;

    case '/energy/vehicle-energy-per-100km':
      return fixtures.VEHICLE_ENERGY_PER_100KM;

    default:
      return null;
  }
};

// Response Interceptor: unwrap envelope and handle fallback on network errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const resData = response.data;
    // Check if it's already enveloped { code, message, data }
    if (resData && typeof resData === 'object' && 'code' in resData && 'data' in resData) {
      return resData.data; // unwrap to direct body data
    }
    return resData;
  },
  async (error) => {
    // If the request fails (e.g. 404, connection refused, offline), fall back to fixtures
    const config = error.config;
    if (config && config.url) {
      const mockData = getMockResponse(config.url, config.method, config.data);
      if (mockData !== null) {
        console.warn(`[API Fallback] Request to "${config.url}" failed. Resolving with local high-fidelity mock data.`);
        return mockData;
      }
    }
    return Promise.reject(error);
  }
);

// Standardised request wrappers
export const getRequest = async <T>(url: string, params?: any): Promise<T> => {
  try {
    const res = await apiClient.get<T>(url, { params });
    // In case interceptor was bypassed or returned raw response
    return (res as any);
  } catch (error: any) {
    // Last-mile fallback if interceptor didn't catch (e.g. parsing error)
    const mock = getMockResponse(url, 'get');
    if (mock !== null) {
      return mock as T;
    }
    throw error;
  }
};

export const postRequest = async <T>(url: string, data?: any): Promise<T> => {
  try {
    const res = await apiClient.post<T>(url, data);
    return (res as any);
  } catch (error: any) {
    const mock = getMockResponse(url, 'post', data);
    if (mock !== null) {
      return mock as T;
    }
    throw error;
  }
};

export default apiClient;

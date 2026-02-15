import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra;

const API_BASE_URL = __DEV__
  ? (extra?.apiBaseUrlDev || 'http://localhost:5000/api')
  : (extra?.apiBaseUrlProd || 'https://your-production-api.com/api');

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  GET_ME: '/auth/me',
  
  // Tutorials
  GET_TUTORIALS: '/tutorials',
  GET_TUTORIAL_BY_ID: '/tutorials',
  CREATE_TUTORIAL: '/tutorials',
  UPDATE_TUTORIAL: '/tutorials',
  DELETE_TUTORIAL: '/tutorials',
  
  // Progress
  GET_USER_PROGRESS: '/tutorials/user/progress',
  GET_TUTORIAL_PROGRESS: '/tutorials',
  UPDATE_PROGRESS: '/tutorials',
};

export default API_BASE_URL;

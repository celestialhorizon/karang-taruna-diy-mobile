import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL, { API_ENDPOINTS } from '../config/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.loadToken();
  }

  private async loadToken() {
    this.token = await AsyncStorage.getItem('auth_token');
  }

  private async saveToken(token: string) {
    this.token = token;
    await AsyncStorage.setItem('auth_token', token);
  }

  private async removeToken() {
    this.token = null;
    await AsyncStorage.removeItem('auth_token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle different error response formats
        let errorMessage = 'Something went wrong';
        
        if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.errors && Array.isArray(data.errors)) {
          // If errors is an array, join them
          errorMessage = data.errors.join(', ');
        } else if (data.errors && typeof data.errors === 'object') {
          // If errors is an object, get the first error
          const firstError = Object.values(data.errors)[0];
          errorMessage = Array.isArray(firstError) ? firstError[0] : String(firstError);
        } else if (typeof data === 'string') {
          errorMessage = data;
        }
        
        // Create error with additional properties for better handling
        const error = new Error(errorMessage) as any;
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    const data = await this.request(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.token) {
      await this.saveToken(data.token);
    }

    return data;
  }

  async register(userData: {
    name: string;
    username: string;
    email: string;
    password: string;
    karangTarunaName: string;
    provinsi: string;
    kabupatenKota: string;
    kecamatan: string;
    jalan: string;
    phone?: string;
    interests?: string[];
    skillLevel?: string;
    peranAnggota?: string;
  }) {
    const data = await this.request(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (data.token) {
      await this.saveToken(data.token);
    }

    return data;
  }

  async getMe() {
    return this.request(API_ENDPOINTS.GET_ME);
  }

  async logout() {
    await this.removeToken();
  }

  // Tutorial methods
  async getTutorials(params?: {
    category?: string;
    difficulty?: string;
  }) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString 
      ? `${API_ENDPOINTS.GET_TUTORIALS}?${queryString}`
      : API_ENDPOINTS.GET_TUTORIALS;
    
    return this.request(endpoint);
  }

  async getTutorialById(id: string) {
    return this.request(`${API_ENDPOINTS.GET_TUTORIAL_BY_ID}/${id}`);
  }

  // Progress methods
  async getUserProgress() {
    return this.request(API_ENDPOINTS.GET_USER_PROGRESS);
  }

  async getTutorialProgress(tutorialId: string) {
    return this.request(`${API_ENDPOINTS.GET_TUTORIAL_PROGRESS}/${tutorialId}/progress`);
  }

  async updateProgress(tutorialId: string, stepNumber: number, completed: boolean) {
    return this.request(`${API_ENDPOINTS.UPDATE_PROGRESS}/${tutorialId}/progress`, {
      method: 'POST',
      body: JSON.stringify({ stepNumber, completed }),
    });
  }

  async updateTimeSpent(tutorialId: string, timeSpent: number) {
    return this.request(`${API_ENDPOINTS.UPDATE_PROGRESS}/${tutorialId}/time`, {
      method: 'POST',
      body: JSON.stringify({ timeSpent }),
    });
  }
}

export default new ApiService();

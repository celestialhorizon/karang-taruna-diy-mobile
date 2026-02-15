import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '../config/api';

interface UploadResponse {
  success: boolean;
  url: string;
  publicId: string;
  format?: string;
  duration?: number;
  width?: number;
  height?: number;
}

// Get Cloudinary optimized image URL
export const getOptimizedImageUrl = (
  publicId: string,
  options: { width?: number; height?: number; crop?: string } = {}
): string => {
  if (!publicId) return '';

  const { width, height, crop = 'fill' } = options;
  
  // Build transformation string
  let transformations = '';
  if (width || height) {
    const transformParts = [];
    if (width) transformParts.push(`w_${width}`);
    if (height) transformParts.push(`h_${height}`);
    transformParts.push(`c_${crop}`);
    transformations = transformParts.join(',') + '/';
  }
  
  // Add quality and format optimization
  transformations += 'q_auto,f_auto/';
  
  return `https://res.cloudinary.com/${process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${transformations}${publicId}`;
};

// Get Cloudinary video URL
export const getOptimizedVideoUrl = (publicId: string): string => {
  if (!publicId) return '';
  return `https://res.cloudinary.com/${process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/q_auto/${publicId}`;
};

// Upload image using backend API
export const uploadImage = async (
  uri: string,
  filename: string,
  mimeType: string = 'image/jpeg'
): Promise<UploadResponse> => {
  const token = await AsyncStorage.getItem('auth_token');
  
  // Create form data
  const formData = new FormData();
  formData.append('image', {
    uri,
    name: filename,
    type: mimeType,
  } as any);

  const response = await fetch(`${API_URL}/api/upload/image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(error.message || 'Failed to upload image');
  }

  return response.json();
};

// Upload video using backend API
export const uploadVideo = async (
  uri: string,
  filename: string,
  mimeType: string = 'video/mp4'
): Promise<UploadResponse> => {
  const token = await AsyncStorage.getItem('auth_token');
  
  // Create form data
  const formData = new FormData();
  formData.append('video', {
    uri,
    name: filename,
    type: mimeType,
  } as any);

  const response = await fetch(`${API_URL}/api/upload/video`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(error.message || 'Failed to upload video');
  }

  return response.json();
};

// Delete media from Cloudinary
export const deleteMedia = async (
  publicId: string,
  resourceType: 'image' | 'video' = 'image'
): Promise<void> => {
  const token = await AsyncStorage.getItem('auth_token');
  
  const response = await fetch(
    `${API_URL}/api/upload/${publicId}?resourceType=${resourceType}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Delete failed' }));
    throw new Error(error.message || 'Failed to delete media');
  }
};

// Pick and upload image helper (for use with expo-image-picker)
export const uploadPickedImage = async (
  pickerResult: { uri: string; fileName?: string; mimeType?: string; width?: number; height?: number }
): Promise<UploadResponse> => {
  if (!pickerResult.uri) {
    throw new Error('No image selected');
  }

  const filename = pickerResult.fileName || `image_${Date.now()}.jpg`;
  const mimeType = pickerResult.mimeType || 'image/jpeg';

  return uploadImage(pickerResult.uri, filename, mimeType);
};

// Pick and upload video helper
export const uploadPickedVideo = async (
  pickerResult: { uri: string; fileName?: string; mimeType?: string }
): Promise<UploadResponse> => {
  if (!pickerResult.uri) {
    throw new Error('No video selected');
  }

  const filename = pickerResult.fileName || `video_${Date.now()}.mp4`;
  const mimeType = pickerResult.mimeType || 'video/mp4';

  return uploadVideo(pickerResult.uri, filename, mimeType);
};

// Cloudinary configuration object
export const cloudinaryConfig = {
  cloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
  apiKey: process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY || '',
};

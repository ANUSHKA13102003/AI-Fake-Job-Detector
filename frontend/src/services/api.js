import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

export async function analyzeJobText(text, url = '') {
  const response = await axios.post(`${API_BASE}/analyze-job`, { text, url });
  return response.data;
}

export async function uploadJobFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(`${API_BASE}/upload-image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

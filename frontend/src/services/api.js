import axios from 'axios';

const API_BASE = (process.env.REACT_APP_API_URL || '/api').replace(/\/+$/, '');

function apiUrl(path) {
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

export async function analyzeJobText(text, url = '') {
  const response = await axios.post(apiUrl('/analyze-job'), { text, url });
  return response.data;
}

export async function uploadJobFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(apiUrl('/upload-image'), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

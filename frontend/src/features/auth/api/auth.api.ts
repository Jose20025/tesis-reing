import { BASE_URL } from '@/lib/constants';
import axios from 'axios';

export const authApi = axios.create({
  baseURL: `${BASE_URL}/usuarios`,
});

import { BASE_URL } from '@/lib/constants';
import axios from 'axios';

export const usuariosApi = axios.create({
  baseURL: `${BASE_URL}/usuarios`,
});

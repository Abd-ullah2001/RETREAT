/**
 * Shared RapidAPI Axios client — one key, per-request host header.
 */
import axios from 'axios';
import { config } from '../config.js';

export const rapidApi = axios.create({
  timeout: 30_000,
  headers: {
    'x-rapidapi-key': config.RAPIDAPI_KEY,
    'Content-Type': 'application/json',
  },
});

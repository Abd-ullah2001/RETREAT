import axios, { type AxiosInstance } from 'axios';
import { supabase } from './supabase';
import type { Activity, Inquiry, Property, Trip, User } from '@/types';

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      await supabase.auth.signOut();
      window.location.href = '/';
    }
    return Promise.reject(error);
  },
);

export async function verifyAuth(accessToken: string) {
  const { data } = await api.post<{ user: User }>('/api/v1/auth/verify', {
    access_token: accessToken,
  });
  return data.user;
}

export async function getMe() {
  const { data } = await api.get<{ user: User }>('/api/v1/auth/me');
  return data.user;
}

export async function searchProperties(params: {
  destination: string;
  destId?: string;
  checkin: string;
  checkout: string;
  guests: number;
  currency?: string;
}) {
  const { data } = await api.get<{
    properties: Property[];
    sources: { booking: number; airbnb: number };
    cached: boolean;
    count: number;
  }>('/api/v1/properties/search', { params });
  return data;
}

export async function searchActivities(params: { lat: number; lng: number; radius?: number }) {
  const { data } = await api.get<{ activities: Activity[]; cached: boolean; count: number }>(
    '/api/v1/activities/search',
    { params },
  );
  return data;
}

export async function createTrip(body: {
  destination: string;
  destination_lat: number;
  destination_lng: number;
  checkin: string;
  checkout: string;
  guests: number;
}) {
  const { data } = await api.post<{ trip: Trip }>('/api/v1/trips', body);
  return data.trip;
}

export async function getTrips() {
  const { data } = await api.get<{ trips: Trip[] }>('/api/v1/trips');
  return data.trips;
}

export async function getTrip(tripId: string) {
  const { data } = await api.get<{ trip: Trip }>(`/api/v1/trips/${tripId}`);
  return data.trip;
}

export async function generateItinerary(tripId: string, body?: { destId?: string; currency?: string }) {
  const { data } = await api.post<{ trip: Trip }>(`/api/v1/trips/${tripId}/itinerary`, body ?? {});
  return data.trip;
}

export async function recordInteraction(
  tripId: string,
  body: {
    propertyId: string;
    platform: 'booking' | 'airbnb';
    propertySnapshot: Property;
    action: 'interested' | 'skipped';
  },
) {
  await api.post(`/api/v1/trips/${tripId}/interactions`, body);
}

export async function createInquiry(body: {
  tripId: string;
  propertyId: string;
  platform: 'booking' | 'airbnb';
  propertySnapshot: Property;
  hostPhone?: string;
}) {
  const { data } = await api.post<{
    inquiry: { id: string; ai_message: string; wa_link: string | null; status: string };
  }>('/api/v1/inquiries', body);
  return data.inquiry;
}

export async function getInquiries() {
  const { data } = await api.get<{ inquiries: Inquiry[] }>('/api/v1/inquiries');
  return data.inquiries;
}

export async function updateInquiryMessage(id: string, final_message: string) {
  const { data } = await api.patch<{ inquiry: Inquiry }>(`/api/v1/inquiries/${id}/message`, {
    final_message,
  });
  return data.inquiry;
}

export async function markInquirySent(id: string) {
  const { data } = await api.patch<{ inquiry: Inquiry }>(`/api/v1/inquiries/${id}/sent`);
  return data.inquiry;
}

export default api;

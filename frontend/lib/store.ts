import { create } from 'zustand';
import type { Property, Trip } from '@/types';

interface SearchParams {
  destination: string;
  lat: number;
  lng: number;
  checkin: string;
  checkout: string;
  guests: number;
  destId?: string;
}

interface RetreatState {
  searchParams: SearchParams | null;
  setSearchParams: (params: SearchParams | null) => void;
  currentTrip: Trip | null;
  setCurrentTrip: (trip: Trip | null) => void;
  properties: Property[];
  setProperties: (properties: Property[]) => void;
  swipedPropertyIds: Set<string>;
  interestedPropertyIds: Set<string>;
  markInterested: (id: string) => void;
  markSkipped: (id: string) => void;
  mapSelectedId: string | null;
  setMapSelectedId: (id: string | null) => void;
}

export const useRetreatStore = create<RetreatState>((set, get) => ({
  searchParams: null,
  setSearchParams: (searchParams) => set({ searchParams }),
  currentTrip: null,
  setCurrentTrip: (currentTrip) => set({ currentTrip }),
  properties: [],
  setProperties: (properties) => set({ properties }),
  swipedPropertyIds: new Set(),
  interestedPropertyIds: new Set(),
  markInterested: (id) => {
    const swiped = new Set(get().swipedPropertyIds);
    const interested = new Set(get().interestedPropertyIds);
    swiped.add(id);
    interested.add(id);
    set({ swipedPropertyIds: swiped, interestedPropertyIds: interested });
  },
  markSkipped: (id) => {
    const swiped = new Set(get().swipedPropertyIds);
    swiped.add(id);
    set({ swipedPropertyIds: swiped });
  },
  mapSelectedId: null,
  setMapSelectedId: (mapSelectedId) => set({ mapSelectedId }),
}));

import { create } from 'zustand';
import type { Property, SearchParams, Trip } from '@/types';

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
  resetSwipeState: () => void;
  mapSelectedId: string | null;
  mapSelectedType: 'property' | 'activity' | null;
  setMapSelected: (id: string | null, type: 'property' | 'activity' | null) => void;
  inquiryModalOpen: boolean;
  inquiryProperty: Property | null;
  openInquiryModal: (property: Property) => void;
  closeInquiryModal: () => void;
  onboardingData: {
    name: string;
    travelStyle: string;
    interests: string[];
    budget: string;
  };
  setOnboardingData: (data: Partial<RetreatState['onboardingData']>) => void;
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
  resetSwipeState: () => set({ swipedPropertyIds: new Set(), interestedPropertyIds: new Set() }),
  mapSelectedId: null,
  mapSelectedType: null,
  setMapSelected: (mapSelectedId, mapSelectedType) => set({ mapSelectedId, mapSelectedType }),
  inquiryModalOpen: false,
  inquiryProperty: null,
  openInquiryModal: (inquiryProperty) => set({ inquiryModalOpen: true, inquiryProperty }),
  closeInquiryModal: () => set({ inquiryModalOpen: false, inquiryProperty: null }),
  onboardingData: {
    name: '',
    travelStyle: 'relaxation',
    interests: [],
    budget: 'comfort',
  },
  setOnboardingData: (data) => set((state) => ({ onboardingData: { ...state.onboardingData, ...data } })),
}));

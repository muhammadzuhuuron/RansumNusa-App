import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set) => ({
      // Sheep Management
      sheep: [],
      addSheep: (sheep) => set((state) => ({ sheep: [...state.sheep, sheep] })),
      updateSheep: (id, updatedSheep) =>
        set((state) => ({
          sheep: state.sheep.map((s) => (s.id === id ? { ...s, ...updatedSheep } : s)),
        })),
      deleteSheep: (id) => set((state) => ({ sheep: state.sheep.filter((s) => s.id !== id) })),

      // Feed Management
      feeds: [],
      addFeed: (feed) => set((state) => ({ feeds: [...state.feeds, feed] })),
      updateFeed: (id, updatedFeed) =>
        set((state) => ({
          feeds: state.feeds.map((f) => (f.id === id ? { ...f, ...updatedFeed } : f)),
        })),
      deleteFeed: (id) => set((state) => ({ feeds: state.feeds.filter((f) => f.id !== id) })),

      // Feeding Records
      feedingRecords: [],
      addFeedingRecord: (record) =>
        set((state) => ({ feedingRecords: [...state.feedingRecords, record] })),
      updateFeedingRecord: (id, updatedRecord) =>
        set((state) => ({
          feedingRecords: state.feedingRecords.map((r) =>
            r.id === id ? { ...r, ...updatedRecord } : r
          ),
        })),
      deleteFeedingRecord: (id) =>
        set((state) => ({ feedingRecords: state.feedingRecords.filter((r) => r.id !== id) })),

      // Financial Records
      finances: [],
      addFinance: (finance) => set((state) => ({ finances: [...state.finances, finance] })),
      updateFinance: (id, updatedFinance) =>
        set((state) => ({
          finances: state.finances.map((f) =>
            f.id === id ? { ...f, ...updatedFinance } : f
          ),
        })),
      deleteFinance: (id) =>
        set((state) => ({ finances: state.finances.filter((f) => f.id !== id) })),

      // Health Records
      healthRecords: [],
      addHealthRecord: (record) =>
        set((state) => ({ healthRecords: [...state.healthRecords, record] })),
      updateHealthRecord: (id, updatedRecord) =>
        set((state) => ({
          healthRecords: state.healthRecords.map((r) =>
            r.id === id ? { ...r, ...updatedRecord } : r
          ),
        })),
      deleteHealthRecord: (id) =>
        set((state) => ({ healthRecords: state.healthRecords.filter((r) => r.id !== id) })),

      // Production Records
      productions: [],
      addProduction: (production) =>
        set((state) => ({ productions: [...state.productions, production] })),
      updateProduction: (id, updatedProduction) =>
        set((state) => ({
          productions: state.productions.map((p) =>
            p.id === id ? { ...p, ...updatedProduction } : p
          ),
        })),
      deleteProduction: (id) =>
        set((state) => ({ productions: state.productions.filter((p) => p.id !== id) })),
    }),
    {
      name: 'ransum-nusa-storage',
    }
  )
)

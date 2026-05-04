import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type { Trip, Expense } from './types'

interface TravelStore {
  trips: Trip[]
  addTrip: (name: string, description: string, currency: string) => string
  updateTrip: (id: string, name: string, description: string, currency: string) => void
  deleteTrip: (id: string) => void
  addPerson: (tripId: string, name: string) => void
  deletePerson: (tripId: string, personId: string) => void
  addExpense: (tripId: string, expense: Omit<Expense, 'id'>) => void
  updateExpense: (tripId: string, expense: Expense) => void
  deleteExpense: (tripId: string, expenseId: string) => void
}

export const useStore = create<TravelStore>()(
  persist(
    (set) => ({
      trips: [],

      addTrip: (name, description, currency) => {
        const id = uuidv4()
        set((state) => ({
          trips: [
            ...state.trips,
            {
              id,
              name,
              description,
              currency,
              people: [],
              expenses: [],
              createdAt: new Date().toISOString(),
            },
          ],
        }))
        return id
      },

      updateTrip: (id, name, description, currency) =>
        set((state) => ({
          trips: state.trips.map((t) =>
            t.id === id ? { ...t, name, description, currency } : t,
          ),
        })),

      deleteTrip: (id) =>
        set((state) => ({ trips: state.trips.filter((t) => t.id !== id) })),

      addPerson: (tripId, name) =>
        set((state) => ({
          trips: state.trips.map((t) =>
            t.id === tripId
              ? { ...t, people: [...t.people, { id: uuidv4(), name }] }
              : t,
          ),
        })),

      deletePerson: (tripId, personId) =>
        set((state) => ({
          trips: state.trips.map((t) =>
            t.id === tripId
              ? { ...t, people: t.people.filter((p) => p.id !== personId) }
              : t,
          ),
        })),

      addExpense: (tripId, expense) =>
        set((state) => ({
          trips: state.trips.map((t) =>
            t.id === tripId
              ? { ...t, expenses: [...t.expenses, { ...expense, id: uuidv4() }] }
              : t,
          ),
        })),

      updateExpense: (tripId, expense) =>
        set((state) => ({
          trips: state.trips.map((t) =>
            t.id === tripId
              ? {
                  ...t,
                  expenses: t.expenses.map((e) => (e.id === expense.id ? expense : e)),
                }
              : t,
          ),
        })),

      deleteExpense: (tripId, expenseId) =>
        set((state) => ({
          trips: state.trips.map((t) =>
            t.id === tripId
              ? { ...t, expenses: t.expenses.filter((e) => e.id !== expenseId) }
              : t,
          ),
        })),
    }),
    { name: 'travelsplit-storage' },
  ),
)

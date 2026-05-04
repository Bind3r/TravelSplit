import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import TripModal from '../components/TripModal'
import { formatAmount } from '../utils/currencies'

export default function TripsPage() {
  const trips = useStore((s) => s.trips)
  const addTrip = useStore((s) => s.addTrip)
  const updateTrip = useStore((s) => s.updateTrip)
  const deleteTrip = useStore((s) => s.deleteTrip)
  const navigate = useNavigate()

  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const editingTrip = trips.find((t) => t.id === editingId)

  function handleCreate(name: string, description: string, currency: string) {
    const id = addTrip(name, description, currency)
    setShowCreate(false)
    navigate(`/trip/${id}`)
  }

  function handleUpdate(name: string, description: string, currency: string) {
    if (!editingId) return
    updateTrip(editingId, name, description, currency)
    setEditingId(null)
  }

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    if (!confirm('Delete this trip? This cannot be undone.')) return
    deleteTrip(id)
  }

  const sorted = trips.slice().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">TravelSplit</h1>
            <p className="text-xs text-gray-400">Split travel expenses effortlessly</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Trip
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {trips.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">✈️</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No trips yet</h2>
            <p className="text-sm text-gray-500 mb-6">
              Create your first trip to start splitting expenses
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
            >
              Create a trip
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((trip) => {
              const total = trip.expenses.reduce((sum, e) => sum + e.amount, 0)
              return (
                <div
                  key={trip.id}
                  onClick={() => navigate(`/trip/${trip.id}`)}
                  className="bg-white rounded-xl border border-gray-200 p-4 hover:border-indigo-200 hover:shadow-sm transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{trip.name}</h3>
                      {trip.description && (
                        <p className="text-sm text-gray-500 truncate mt-0.5">{trip.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                        <span>
                          {trip.people.length}{' '}
                          {trip.people.length === 1 ? 'person' : 'people'}
                        </span>
                        <span>·</span>
                        <span>{trip.expenses.length} expenses</span>
                        <span>·</span>
                        <span className="font-medium text-gray-600">
                          {formatAmount(total, trip.currency)}
                        </span>
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-1 flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setEditingId(trip.id)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit trip"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, trip.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete trip"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {showCreate && (
        <TripModal onSave={handleCreate} onClose={() => setShowCreate(false)} />
      )}
      {editingTrip && (
        <TripModal
          trip={editingTrip}
          onSave={handleUpdate}
          onClose={() => setEditingId(null)}
        />
      )}
    </div>
  )
}

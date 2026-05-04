import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store'
import TripModal from '../components/TripModal'
import ExpenseModal from '../components/ExpenseModal'
import { calculateBalances } from '../utils/balances'
import { formatAmount } from '../utils/currencies'
import type { Expense } from '../types'

type Tab = 'overview' | 'expenses' | 'people'

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const trip = useStore((s) => s.trips.find((t) => t.id === id))
  const updateTrip = useStore((s) => s.updateTrip)
  const deleteTrip = useStore((s) => s.deleteTrip)
  const addPerson = useStore((s) => s.addPerson)
  const deletePerson = useStore((s) => s.deletePerson)
  const addExpense = useStore((s) => s.addExpense)
  const updateExpense = useStore((s) => s.updateExpense)
  const deleteExpense = useStore((s) => s.deleteExpense)

  const [tab, setTab] = useState<Tab>('overview')
  const [showEditTrip, setShowEditTrip] = useState(false)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [newPersonName, setNewPersonName] = useState('')

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Trip not found.</p>
          <button
            onClick={() => navigate('/')}
            className="text-indigo-600 text-sm hover:underline"
          >
            ← Back to trips
          </button>
        </div>
      </div>
    )
  }

  const { netBalances, settlements, totalSpent } = calculateBalances(trip)

  function getPersonName(personId: string) {
    return trip!.people.find((p) => p.id === personId)?.name ?? 'Unknown'
  }

  function isPersonUsed(personId: string) {
    return trip!.expenses.some(
      (e) => e.paidById === personId || e.splitBetweenIds.includes(personId),
    )
  }

  function handleDeleteTrip() {
    if (!confirm('Delete this trip? This cannot be undone.')) return
    deleteTrip(trip!.id)
    navigate('/')
  }

  function handleAddPerson(e: React.FormEvent) {
    e.preventDefault()
    const name = newPersonName.trim()
    if (!name) return
    addPerson(trip!.id, name)
    setNewPersonName('')
  }

  function handleDeletePerson(personId: string) {
    if (isPersonUsed(personId)) {
      alert('Cannot remove: this person is part of one or more expenses.')
      return
    }
    deletePerson(trip!.id, personId)
  }

  function handleDeleteExpense(expenseId: string) {
    if (!confirm('Delete this expense?')) return
    deleteExpense(trip!.id, expenseId)
  }

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'expenses', label: 'Expenses', badge: trip.expenses.length },
    { id: 'people', label: 'People', badge: trip.people.length },
  ]

  const sortedExpenses = trip.expenses
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0 p-1 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-gray-900 truncate">{trip.name}</h1>
              {trip.description && (
                <p className="text-xs text-gray-400 truncate">{trip.description}</p>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setShowEditTrip(true)}
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
                onClick={handleDeleteTrip}
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

          {/* Tabs */}
          <div className="flex mt-4">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  tab === t.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.label}
                {t.badge !== undefined && t.badge > 0 && (
                  <span
                    className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                      tab === t.id
                        ? 'bg-indigo-100 text-indigo-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <div className="text-xl font-bold text-gray-900 tabular-nums">
                  {formatAmount(totalSpent, trip.currency)}
                </div>
                <div className="text-xs text-gray-400 mt-1">Total spent</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <div className="text-xl font-bold text-gray-900">{trip.people.length}</div>
                <div className="text-xs text-gray-400 mt-1">People</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <div className="text-xl font-bold text-gray-900">{trip.expenses.length}</div>
                <div className="text-xs text-gray-400 mt-1">Expenses</div>
              </div>
            </div>

            {trip.people.length === 0 && (
              <div className="text-center py-10 text-gray-400 text-sm">
                <p>
                  Start by{' '}
                  <button onClick={() => setTab('people')} className="text-indigo-600 hover:underline">
                    adding people
                  </button>{' '}
                  to the trip.
                </p>
              </div>
            )}

            {/* Balances */}
            {trip.people.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h2 className="text-sm font-semibold text-gray-900">Balances</h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {trip.people.map((person) => {
                    const balance = netBalances[person.id] ?? 0
                    const isPositive = balance > 0.005
                    const isNegative = balance < -0.005
                    return (
                      <div key={person.id} className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-indigo-600">
                              {person.name[0].toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm text-gray-800">{person.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isPositive && (
                            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              gets back
                            </span>
                          )}
                          {isNegative && (
                            <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                              owes
                            </span>
                          )}
                          <span
                            className={`text-sm font-semibold tabular-nums ${
                              isPositive
                                ? 'text-emerald-600'
                                : isNegative
                                ? 'text-red-500'
                                : 'text-gray-400'
                            }`}
                          >
                            {isNegative ? '−' : ''}
                            {formatAmount(Math.abs(balance), trip.currency)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Settlements */}
            {settlements.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h2 className="text-sm font-semibold text-gray-900">Who pays who</h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {settlements.map((s, i) => (
                    <div key={i} className="px-4 py-3 flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-red-500">
                          {getPersonName(s.from)[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 text-sm text-gray-700">
                        <span className="font-medium">{getPersonName(s.from)}</span>
                        <span className="text-gray-400 mx-2">→</span>
                        <span className="font-medium">{getPersonName(s.to)}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 tabular-nums">
                        {formatAmount(s.amount, trip.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {settlements.length === 0 && trip.expenses.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <p className="text-emerald-700 text-sm font-medium">All settled up!</p>
              </div>
            )}

            {trip.expenses.length === 0 && trip.people.length > 0 && (
              <div className="text-center py-6 text-sm text-gray-400">
                No expenses yet.{' '}
                <button
                  onClick={() => setTab('expenses')}
                  className="text-indigo-600 hover:underline"
                >
                  Add the first one
                </button>
              </div>
            )}
          </div>
        )}

        {/* EXPENSES TAB */}
        {tab === 'expenses' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddExpense(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add expense
              </button>
            </div>

            {sortedExpenses.length === 0 ? (
              <div className="text-center py-14 text-gray-400">
                <div className="text-4xl mb-3">🧾</div>
                <p className="text-sm">No expenses yet</p>
                {trip.people.length === 0 && (
                  <p className="text-xs mt-1 text-gray-400">
                    Add people first in the People tab
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {sortedExpenses.map((expense) => {
                  const splitCount = expense.splitBetweenIds.length
                  const splitLabel =
                    splitCount === trip.people.length
                      ? 'all'
                      : expense.splitBetweenIds
                          .map(getPersonName)
                          .join(', ')
                  return (
                    <div
                      key={expense.id}
                      className="bg-white rounded-xl border border-gray-200 px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {expense.description}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Paid by{' '}
                            <span className="text-gray-600 font-medium">
                              {getPersonName(expense.paidById)}
                            </span>
                            {' · '}Split between{' '}
                            <span className="text-gray-600">{splitLabel}</span>
                            {' · '}
                            {new Date(expense.date).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="text-sm font-semibold text-gray-900 tabular-nums mr-1">
                            {formatAmount(expense.amount, expense.currency)}
                          </span>
                          <button
                            onClick={() => setEditingExpense(expense)}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          </div>
        )}

        {/* PEOPLE TAB */}
        {tab === 'people' && (
          <div className="space-y-4">
            <form onSubmit={handleAddPerson} className="flex gap-2">
              <input
                type="text"
                value={newPersonName}
                onChange={(e) => setNewPersonName(e.target.value)}
                placeholder="Person's name"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!newPersonName.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
              >
                Add
              </button>
            </form>

            {trip.people.length === 0 ? (
              <div className="text-center py-14 text-gray-400">
                <div className="text-4xl mb-3">👥</div>
                <p className="text-sm">No people added yet</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50 overflow-hidden">
                {trip.people.map((person) => {
                  const balance = netBalances[person.id] ?? 0
                  const used = isPersonUsed(person.id)
                  return (
                    <div key={person.id} className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-indigo-600">
                            {person.name[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{person.name}</p>
                          {trip.expenses.length > 0 && (
                            <p
                              className={`text-xs ${
                                balance > 0.005
                                  ? 'text-emerald-600'
                                  : balance < -0.005
                                  ? 'text-red-500'
                                  : 'text-gray-400'
                              }`}
                            >
                              {balance > 0.005
                                ? `Gets back ${formatAmount(Math.abs(balance), trip.currency)}`
                                : balance < -0.005
                                ? `Owes ${formatAmount(Math.abs(balance), trip.currency)}`
                                : 'Settled up'}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePerson(person.id)}
                        disabled={used}
                        title={used ? 'Person is part of expenses' : 'Remove person'}
                        className={`p-1.5 rounded-lg transition-colors ${
                          used
                            ? 'text-gray-200 cursor-not-allowed'
                            : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {showEditTrip && (
        <TripModal
          trip={trip}
          onSave={(name, description, currency) => {
            updateTrip(trip.id, name, description, currency)
            setShowEditTrip(false)
          }}
          onClose={() => setShowEditTrip(false)}
        />
      )}

      {(showAddExpense || editingExpense !== null) && (
        <ExpenseModal
          trip={trip}
          expense={editingExpense ?? undefined}
          onSave={(data) => {
            if (editingExpense) {
              updateExpense(trip.id, { ...data, id: editingExpense.id })
              setEditingExpense(null)
            } else {
              addExpense(trip.id, data)
              setShowAddExpense(false)
            }
          }}
          onClose={() => {
            setShowAddExpense(false)
            setEditingExpense(null)
          }}
        />
      )}
    </div>
  )
}

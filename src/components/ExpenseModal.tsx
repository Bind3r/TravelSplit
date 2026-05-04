import { useState } from 'react'
import Modal from './Modal'
import { CURRENCIES, getCurrencySymbol } from '../utils/currencies'
import type { Trip, Expense } from '../types'

interface Props {
  trip: Trip
  expense?: Expense
  onSave: (expense: Omit<Expense, 'id'>) => void
  onClose: () => void
}

export default function ExpenseModal({ trip, expense, onSave, onClose }: Props) {
  const [description, setDescription] = useState(expense?.description ?? '')
  const [amount, setAmount] = useState(expense?.amount.toString() ?? '')
  const [currency, setCurrency] = useState(expense?.currency ?? trip.currency)
  const [paidById, setPaidById] = useState(expense?.paidById ?? (trip.people[0]?.id ?? ''))
  const [splitBetweenIds, setSplitBetweenIds] = useState<string[]>(
    expense?.splitBetweenIds ?? trip.people.map((p) => p.id),
  )
  const [date, setDate] = useState(expense?.date ?? new Date().toISOString().split('T')[0])

  if (trip.people.length === 0) {
    return (
      <Modal title="Add Expense" onClose={onClose}>
        <p className="text-gray-500 text-sm mb-4">Add people to the trip before adding expenses.</p>
        <button
          onClick={onClose}
          className="w-full bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-medium"
        >
          Got it
        </button>
      </Modal>
    )
  }

  function toggleSplit(id: string) {
    setSplitBetweenIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function selectAll() {
    setSplitBetweenIds(trip.people.map((p) => p.id))
  }

  const parsedAmount = parseFloat(amount)
  const shareAmount =
    !isNaN(parsedAmount) && parsedAmount > 0 && splitBetweenIds.length > 0
      ? parsedAmount / splitBetweenIds.length
      : null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (
      !description.trim() ||
      isNaN(parsedAmount) ||
      parsedAmount <= 0 ||
      !paidById ||
      splitBetweenIds.length === 0
    )
      return
    onSave({ description: description.trim(), amount: parsedAmount, currency, paidById, splitBetweenIds, date })
  }

  const isValid =
    description.trim() &&
    !isNaN(parsedAmount) &&
    parsedAmount > 0 &&
    paidById &&
    splitBetweenIds.length > 0

  return (
    <Modal title={expense ? 'Edit Expense' : 'Add Expense'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Restaurant dinner"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            autoFocus
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="w-28">
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Paid by <span className="text-red-400">*</span>
          </label>
          <select
            value={paidById}
            onChange={(e) => setPaidById(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {trip.people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Split between <span className="text-red-400">*</span>
            </label>
            <button
              type="button"
              onClick={selectAll}
              className="text-xs text-indigo-600 hover:underline"
            >
              Select all
            </button>
          </div>
          <div className="space-y-1.5 bg-gray-50 rounded-lg p-3">
            {trip.people.map((p) => {
              const checked = splitBetweenIds.includes(p.id)
              return (
                <label key={p.id} className="flex items-center gap-3 cursor-pointer py-0.5">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSplit(p.id)}
                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="flex-1 text-sm text-gray-700">{p.name}</span>
                  {checked && shareAmount !== null && (
                    <span className="text-xs text-gray-400 font-medium">
                      {getCurrencySymbol(currency)}
                      {shareAmount.toFixed(2)}
                    </span>
                  )}
                </label>
              )
            })}
          </div>
          {splitBetweenIds.length === 0 && (
            <p className="text-xs text-red-500 mt-1">Select at least one person</p>
          )}
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            {expense ? 'Save changes' : 'Add expense'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

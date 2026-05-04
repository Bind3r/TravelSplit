import type { Trip, Settlement } from '../types'

export function calculateBalances(trip: Trip): {
  netBalances: Record<string, number>
  settlements: Settlement[]
  totalSpent: number
} {
  const netBalances: Record<string, number> = {}

  for (const person of trip.people) {
    netBalances[person.id] = 0
  }

  for (const expense of trip.expenses) {
    if (!expense.splitBetweenIds.length) continue

    const share = expense.amount / expense.splitBetweenIds.length

    if (netBalances[expense.paidById] !== undefined) {
      netBalances[expense.paidById] += expense.amount
    }

    for (const id of expense.splitBetweenIds) {
      if (netBalances[id] !== undefined) {
        netBalances[id] -= share
      }
    }
  }

  const totalSpent = trip.expenses.reduce((sum, e) => sum + e.amount, 0)

  // Greedy minimum-transaction settlement
  const creditors = Object.entries(netBalances)
    .filter(([, v]) => v > 0.005)
    .map(([id, amount]) => ({ id, amount }))
    .sort((a, b) => b.amount - a.amount)

  const debtors = Object.entries(netBalances)
    .filter(([, v]) => v < -0.005)
    .map(([id, amount]) => ({ id, amount: -amount }))
    .sort((a, b) => b.amount - a.amount)

  const settlements: Settlement[] = []
  let i = 0
  let j = 0

  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].amount, creditors[j].amount)

    settlements.push({
      from: debtors[i].id,
      to: creditors[j].id,
      amount: Math.round(amount * 100) / 100,
    })

    debtors[i].amount -= amount
    creditors[j].amount -= amount

    if (debtors[i].amount < 0.005) i++
    if (creditors[j].amount < 0.005) j++
  }

  return { netBalances, settlements, totalSpent }
}

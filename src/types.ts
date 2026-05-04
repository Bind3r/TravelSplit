export interface Person {
  id: string
  name: string
}

export interface Expense {
  id: string
  description: string
  amount: number
  currency: string
  paidById: string
  splitBetweenIds: string[]
  date: string
}

export interface Trip {
  id: string
  name: string
  description: string
  currency: string
  people: Person[]
  expenses: Expense[]
  createdAt: string
}

export interface Settlement {
  from: string
  to: string
  amount: number
}

import type { User } from 'generated/prisma'
import { create } from 'zustand'

const userStore = create((set) => ({
  user: null,
  setUser: (user: User) => set({ user }),
}))

export { userStore }

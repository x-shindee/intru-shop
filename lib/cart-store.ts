import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  title: string
  price: number
  quantity: number
  size?: string
  image_url?: string
  stock: number
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string, size?: string) => void
  updateQuantity: (id: string, quantity: number, size?: string) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) =>
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) =>
              item.id === newItem.id &&
              (newItem.size ? item.size === newItem.size : true)
          )

          if (existingItemIndex > -1) {
            // Update quantity if item exists
            const updatedItems = [...state.items]
            const existingItem = updatedItems[existingItemIndex]
            const newQuantity = existingItem.quantity + newItem.quantity

            // Check stock limit
            if (newQuantity > newItem.stock) {
              alert('Cannot add more items. Stock limit reached.')
              return state
            }

            updatedItems[existingItemIndex] = {
              ...existingItem,
              quantity: newQuantity
            }
            return { items: updatedItems }
          }

          // Add new item
          return { items: [...state.items, newItem] }
        }),

      removeItem: (id, size) =>
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(item.id === id && (size ? item.size === size : true))
          )
        })),

      updateQuantity: (id, quantity, size) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter(
                (item) =>
                  !(item.id === id && (size ? item.size === size : true))
              )
            }
          }

          return {
            items: state.items.map((item) =>
              item.id === id && (size ? item.size === size : true)
                ? { ...item, quantity: Math.min(quantity, item.stock) }
                : item
            )
          }
        }),

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        const state = get()
        return state.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        )
      },

      getItemCount: () => {
        const state = get()
        return state.items.reduce((count, item) => count + item.quantity, 0)
      }
    }),
    {
      name: 'intru-cart-storage',
      skipHydration: true
    }
  )
)

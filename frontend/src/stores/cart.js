import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] 
  }),
  getters: {
    totalQty: (s) => s.items.reduce((a, b) => a + b.qty, 0),
    totalPrice: (s) => s.items.reduce((a, b) => a + b.qty * b.price, 0)
  },
  actions: {
    add(product) {
      const e = this.items.find(i => i.id === product.id)
      if (e) e.qty++
      else this.items.push({ ...product, qty: 1 })
    },
    updateQty(id, qty) {
      const i = this.items.find(x => x.id === id)
      if (i) i.qty = qty < 1 ? 1 : qty
    },
    remove(id) {
      this.items = this.items.filter(i => i.id !== id)
    },
    clear() {
      this.items = []
    }
  }
})

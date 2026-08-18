import { useState, useRef, useEffect } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface GroceryItem {
  id: string; name: string; brand: string; category: string
  quantity: number; unit: string; price: number; checked: boolean
  barcode: string; imageColor: string
}

interface PriceRecord { date: string; price: number; store: string }

interface TrackedItem {
  id: string; name: string; brand: string; barcode: string
  category: string; unit: string; currentPrice: number
  lowestPrice: number; highestPrice: number; priceHistory: PriceRecord[]
  imageColor: string; alertPrice: number | null
}

interface ScannedItem {
  id: string; name: string; brand: string; barcode: string
  price: number; store: string; timestamp: Date; imageColor: string
}

interface StorePrice { store: string; price: number; inStock: boolean; distance: string }
interface StoreComparison { itemId: string; name: string; brand: string; unit: string; prices: StorePrice[] }

interface PantryItem {
  id: string; name: string; brand: string; category: string
  quantity: number; unit: string; expiryDate: string; imageColor: string
  minStock: number
}

interface Meal { id: string; name: string; day: string; servings: number; ingredients: { name: string; qty: number; unit: string; price: number; category: string }[] }

interface BudgetState { tripBudget: number; weeklyBudget: number; weeklySpent: number; savedThisMonth: number }

// ─── Seed Data ─────────────────────────────────────────────────────────────────

const INITIAL_LIST: GroceryItem[] = [
  { id: 'g1', name: 'Whole Milk', brand: 'Organic Valley', category: 'Dairy', quantity: 2, unit: 'gal', price: 5.49, checked: false, barcode: '070852951097', imageColor: '#D4E8F0' },
  { id: 'g2', name: 'Greek Yogurt', brand: 'Chobani', category: 'Dairy', quantity: 3, unit: 'cup', price: 1.89, checked: false, barcode: '818290011242', imageColor: '#F0ECD4' },
  { id: 'g3', name: 'Free Range Eggs', brand: "Pete & Gerry's", category: 'Dairy', quantity: 1, unit: 'doz', price: 6.99, checked: true, barcode: '078742367071', imageColor: '#F0D4D4' },
  { id: 'g4', name: 'Sourdough Bread', brand: 'Acme Bread', category: 'Bakery', quantity: 1, unit: 'loaf', price: 4.79, checked: false, barcode: '048001213567', imageColor: '#F0E4C4' },
  { id: 'g5', name: 'Avocados', brand: 'Fresh Organic', category: 'Produce', quantity: 4, unit: 'ea', price: 1.29, checked: false, barcode: '033383060016', imageColor: '#C4E8C4' },
  { id: 'g6', name: 'Baby Spinach', brand: 'Earthbound Farm', category: 'Produce', quantity: 1, unit: 'bag', price: 3.99, checked: true, barcode: '032601854019', imageColor: '#C4F0D4' },
  { id: 'g7', name: 'Atlantic Salmon', brand: "Trader Joe's", category: 'Seafood', quantity: 2, unit: 'lb', price: 9.99, checked: false, barcode: '00072036301083', imageColor: '#F0C4C4' },
  { id: 'g8', name: 'Olive Oil Extra Virgin', brand: 'CA Olive Ranch', category: 'Pantry', quantity: 1, unit: 'bottle', price: 12.49, checked: false, barcode: '099158000317', imageColor: '#F0ECC4' },
  { id: 'g9', name: 'Penne Rigate', brand: 'Barilla', category: 'Pantry', quantity: 2, unit: 'box', price: 1.79, checked: false, barcode: '076808001002', imageColor: '#E4C4F0' },
  { id: 'g10', name: 'Cherry Tomatoes', brand: 'Nature Sweet', category: 'Produce', quantity: 1, unit: 'pint', price: 4.49, checked: false, barcode: '811220013001', imageColor: '#F0C8C4' },
]

const INITIAL_TRACKED: TrackedItem[] = [
  { id: 't1', name: 'Whole Milk', brand: 'Organic Valley', barcode: '070852951097', category: 'Dairy', unit: '/gal', currentPrice: 5.49, lowestPrice: 4.89, highestPrice: 6.29, imageColor: '#D4E8F0', alertPrice: 5.00,
    priceHistory: [{ date: 'Jan', price: 5.19, store: 'Whole Foods' }, { date: 'Feb', price: 5.49, store: 'Safeway' }, { date: 'Mar', price: 6.29, store: 'Whole Foods' }, { date: 'Apr', price: 5.89, store: 'Kroger' }, { date: 'May', price: 5.29, store: 'Safeway' }, { date: 'Jun', price: 4.89, store: 'Kroger' }, { date: 'Jul', price: 5.49, store: 'Whole Foods' }] },
  { id: 't2', name: 'Greek Yogurt', brand: 'Chobani', barcode: '818290011242', category: 'Dairy', unit: '/cup', currentPrice: 1.89, lowestPrice: 1.49, highestPrice: 2.19, imageColor: '#F0ECD4', alertPrice: 1.60,
    priceHistory: [{ date: 'Jan', price: 1.79, store: 'Kroger' }, { date: 'Feb', price: 2.19, store: 'Whole Foods' }, { date: 'Mar', price: 1.99, store: 'Safeway' }, { date: 'Apr', price: 1.69, store: 'Kroger' }, { date: 'May', price: 1.49, store: 'Target' }, { date: 'Jun', price: 1.79, store: 'Safeway' }, { date: 'Jul', price: 1.89, store: 'Whole Foods' }] },
  { id: 't3', name: 'Sourdough Bread', brand: 'Acme Bread', barcode: '048001213567', category: 'Bakery', unit: '/loaf', currentPrice: 4.79, lowestPrice: 3.99, highestPrice: 5.49, imageColor: '#F0E4C4', alertPrice: null,
    priceHistory: [{ date: 'Jan', price: 4.29, store: 'Whole Foods' }, { date: 'Feb', price: 3.99, store: 'Safeway' }, { date: 'Mar', price: 4.49, store: 'Kroger' }, { date: 'Apr', price: 5.49, store: 'Whole Foods' }, { date: 'May', price: 4.99, store: 'Safeway' }, { date: 'Jun', price: 4.49, store: 'Kroger' }, { date: 'Jul', price: 4.79, store: 'Whole Foods' }] },
  { id: 't4', name: 'Atlantic Salmon', brand: "Trader Joe's", barcode: '00072036301083', category: 'Seafood', unit: '/lb', currentPrice: 9.99, lowestPrice: 7.99, highestPrice: 12.49, imageColor: '#F0C4C4', alertPrice: 8.50,
    priceHistory: [{ date: 'Jan', price: 11.99, store: "Trader Joe's" }, { date: 'Feb', price: 10.49, store: 'Whole Foods' }, { date: 'Mar', price: 12.49, store: 'Whole Foods' }, { date: 'Apr', price: 9.49, store: "Trader Joe's" }, { date: 'May', price: 7.99, store: 'Costco' }, { date: 'Jun', price: 8.99, store: "Trader Joe's" }, { date: 'Jul', price: 9.99, store: "Trader Joe's" }] },
  { id: 't5', name: 'Olive Oil Extra Virgin', brand: 'CA Olive Ranch', barcode: '099158000317', category: 'Pantry', unit: '/bottle', currentPrice: 12.49, lowestPrice: 9.99, highestPrice: 14.99, imageColor: '#F0ECC4', alertPrice: 10.00,
    priceHistory: [{ date: 'Jan', price: 11.49, store: 'Whole Foods' }, { date: 'Feb', price: 12.99, store: 'Safeway' }, { date: 'Mar', price: 14.99, store: 'Whole Foods' }, { date: 'Apr', price: 13.49, store: 'Safeway' }, { date: 'May', price: 11.99, store: 'Costco' }, { date: 'Jun', price: 9.99, store: 'Costco' }, { date: 'Jul', price: 12.49, store: 'Safeway' }] },
]

const STORE_COMPARISONS: StoreComparison[] = [
  { itemId: 'sc1', name: 'Whole Milk', brand: 'Organic Valley', unit: '/gal', prices: [{ store: 'Whole Foods', price: 5.49, inStock: true, distance: '0.8 mi' }, { store: 'Safeway', price: 5.19, inStock: true, distance: '1.2 mi' }, { store: 'Kroger', price: 4.89, inStock: true, distance: '2.1 mi' }, { store: 'Target', price: 5.29, inStock: false, distance: '1.5 mi' }, { store: 'Costco', price: 4.49, inStock: true, distance: '4.3 mi' }] },
  { itemId: 'sc2', name: 'Free Range Eggs', brand: "Pete & Gerry's", unit: '/doz', prices: [{ store: 'Whole Foods', price: 6.99, inStock: true, distance: '0.8 mi' }, { store: 'Safeway', price: 6.49, inStock: true, distance: '1.2 mi' }, { store: 'Kroger', price: 5.99, inStock: true, distance: '2.1 mi' }, { store: 'Target', price: 6.79, inStock: true, distance: '1.5 mi' }, { store: 'Costco', price: 5.49, inStock: true, distance: '4.3 mi' }] },
  { itemId: 'sc3', name: 'Greek Yogurt', brand: 'Chobani', unit: '/cup', prices: [{ store: 'Whole Foods', price: 2.19, inStock: true, distance: '0.8 mi' }, { store: 'Safeway', price: 1.89, inStock: true, distance: '1.2 mi' }, { store: 'Kroger', price: 1.69, inStock: true, distance: '2.1 mi' }, { store: 'Target', price: 1.79, inStock: true, distance: '1.5 mi' }, { store: 'Costco', price: 1.29, inStock: false, distance: '4.3 mi' }] },
]

const INITIAL_PANTRY: PantryItem[] = [
  { id: 'p1', name: 'Whole Milk', brand: 'Organic Valley', category: 'Dairy', quantity: 1, unit: 'gal', expiryDate: '2025-08-05', imageColor: '#D4E8F0', minStock: 1 },
  { id: 'p2', name: 'Greek Yogurt', brand: 'Chobani', category: 'Dairy', quantity: 4, unit: 'cups', expiryDate: '2025-08-12', imageColor: '#F0ECD4', minStock: 2 },
  { id: 'p3', name: 'Olive Oil', brand: 'CA Olive Ranch', category: 'Pantry', quantity: 1, unit: 'bottle', expiryDate: '2026-03-01', imageColor: '#F0ECC4', minStock: 1 },
  { id: 'p4', name: 'Penne Rigate', brand: 'Barilla', category: 'Pantry', quantity: 3, unit: 'boxes', expiryDate: '2026-08-01', imageColor: '#E4C4F0', minStock: 2 },
  { id: 'p5', name: 'Free Range Eggs', brand: "Pete & Gerry's", category: 'Dairy', quantity: 6, unit: 'eggs', expiryDate: '2025-08-10', imageColor: '#F0D4D4', minStock: 6 },
  { id: 'p6', name: 'Baby Spinach', brand: 'Earthbound Farm', category: 'Produce', quantity: 1, unit: 'bag', expiryDate: '2025-08-04', imageColor: '#C4F0D4', minStock: 1 },
  { id: 'p7', name: 'Cherry Tomatoes', brand: 'Nature Sweet', category: 'Produce', quantity: 1, unit: 'pint', expiryDate: '2025-08-06', imageColor: '#F0C8C4', minStock: 1 },
  { id: 'p8', name: 'Sourdough Bread', brand: 'Acme Bread', category: 'Bakery', quantity: 1, unit: 'loaf', expiryDate: '2025-08-03', imageColor: '#F0E4C4', minStock: 1 },
]

const MEALS: Meal[] = [
  { id: 'm1', name: 'Pasta Arrabbiata', day: 'Monday', servings: 4,
    ingredients: [{ name: 'Penne Rigate', qty: 1, unit: 'box', price: 1.79, category: 'Pantry' }, { name: 'Cherry Tomatoes', qty: 1, unit: 'pint', price: 4.49, category: 'Produce' }, { name: 'Olive Oil', qty: 1, unit: 'bottle', price: 12.49, category: 'Pantry' }, { name: 'Garlic', qty: 3, unit: 'cloves', price: 0.49, category: 'Produce' }] },
  { id: 'm2', name: 'Salmon & Greens', day: 'Tuesday', servings: 2,
    ingredients: [{ name: 'Atlantic Salmon', qty: 2, unit: 'lb', price: 9.99, category: 'Seafood' }, { name: 'Baby Spinach', qty: 1, unit: 'bag', price: 3.99, category: 'Produce' }, { name: 'Lemon', qty: 2, unit: 'ea', price: 0.69, category: 'Produce' }, { name: 'Olive Oil', qty: 1, unit: 'tbsp', price: 0.50, category: 'Pantry' }] },
  { id: 'm3', name: 'Avocado Toast', day: 'Wednesday', servings: 2,
    ingredients: [{ name: 'Sourdough Bread', qty: 1, unit: 'loaf', price: 4.79, category: 'Bakery' }, { name: 'Avocados', qty: 2, unit: 'ea', price: 1.29, category: 'Produce' }, { name: 'Free Range Eggs', qty: 2, unit: 'ea', price: 1.17, category: 'Dairy' }, { name: 'Cherry Tomatoes', qty: 0.5, unit: 'pint', price: 2.25, category: 'Produce' }] },
  { id: 'm4', name: 'Greek Yogurt Bowl', day: 'Thursday', servings: 1,
    ingredients: [{ name: 'Greek Yogurt', qty: 2, unit: 'cups', price: 1.89, category: 'Dairy' }, { name: 'Honey', qty: 1, unit: 'tbsp', price: 0.49, category: 'Pantry' }, { name: 'Mixed Berries', qty: 1, unit: 'cup', price: 3.49, category: 'Produce' }, { name: 'Granola', qty: 0.5, unit: 'cup', price: 1.25, category: 'Pantry' }] },
  { id: 'm5', name: 'Veggie Omelette', day: 'Friday', servings: 2,
    ingredients: [{ name: 'Free Range Eggs', qty: 4, unit: 'ea', price: 2.33, category: 'Dairy' }, { name: 'Baby Spinach', qty: 1, unit: 'cup', price: 0.99, category: 'Produce' }, { name: 'Cherry Tomatoes', qty: 0.5, unit: 'pint', price: 2.25, category: 'Produce' }, { name: 'Whole Milk', qty: 0.25, unit: 'cup', price: 0.34, category: 'Dairy' }] },
]

const SCAN_DATABASE: Record<string, ScannedItem> = {
  '012345678901': { id: 'sc1', name: 'Organic Honey', brand: "Nature's Promise", barcode: '012345678901', price: 8.99, store: 'Whole Foods', timestamp: new Date(), imageColor: '#F0D4A0' },
  '098765432109': { id: 'sc2', name: 'Cold Brew Coffee', brand: 'Chameleon', barcode: '098765432109', price: 5.49, store: 'Target', timestamp: new Date(), imageColor: '#C4C4D4' },
  '111222333444': { id: 'sc3', name: 'Almond Butter', brand: "Justin's", barcode: '111222333444', price: 11.99, store: 'Whole Foods', timestamp: new Date(), imageColor: '#D4C4A0' },
  '555666777888': { id: 'sc4', name: 'Sparkling Water', brand: 'LaCroix', barcode: '555666777888', price: 5.99, store: 'Safeway', timestamp: new Date(), imageColor: '#C4E0F0' },
}

const DEMO_BARCODES = Object.keys(SCAN_DATABASE)

// ─── Sparkline ─────────────────────────────────────────────────────────────────

function Sparkline({ data, color = '#1A6B3C', width = 120, height = 40 }: { data: number[]; color?: string; width?: number; height?: number }) {
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1, pad = 4
  const pts = data.map((v, i) => `${pad + (i / (data.length - 1)) * (width - pad * 2)},${pad + (1 - (v - min) / range) * (height - pad * 2)}`).join(' ')
  const area = [`${pad},${height - pad}`, ...data.map((v, i) => `${pad + (i / (data.length - 1)) * (width - pad * 2)},${pad + (1 - (v - min) / range) * (height - pad * 2)}`), `${width - pad},${height - pad}`].join(' ')
  const lx = pad + (width - pad * 2), ly = pad + (1 - (data[data.length - 1] - min) / range) * (height - pad * 2)
  return <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none"><polygon points={area} fill={color} opacity="0.1" /><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx={lx} cy={ly} r="2.5" fill={color} /></svg>
}

// ─── CategoryBadge ──────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = { Dairy: 'bg-blue-50 text-blue-700', Bakery: 'bg-amber-50 text-amber-700', Produce: 'bg-green-50 text-green-700', Seafood: 'bg-red-50 text-red-700', Pantry: 'bg-purple-50 text-purple-700' }
function CategoryBadge({ category }: { category: string }) {
  return <span className={`text-xs px-2 py-0.5 rounded font-medium ${CATEGORY_COLORS[category] ?? 'bg-gray-100 text-gray-600'}`} style={{ fontFamily: 'var(--font-mono)' }}>{category}</span>
}

// ─── Mini stat card ─────────────────────────────────────────────────────────────

function Stat({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="rounded-xl p-3 flex flex-col gap-0.5" style={{ background: 'var(--color-muted)' }}>
      <div className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)', letterSpacing: '0.06em' }}>{label}</div>
      <div className="text-xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: color ?? 'var(--color-foreground)' }}>{value}</div>
      {sub && <div className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>{sub}</div>}
    </div>
  )
}

// ─── TAB: Shopping List ─────────────────────────────────────────────────────────

function ShoppingListTab({ items, setItems, budget }: { items: GroceryItem[]; setItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>; budget: BudgetState }) {
  const [activeCategory, setActiveCategory] = useState('All')
  const categories = ['All', ...Array.from(new Set(items.map(i => i.category)))]
  const filtered = activeCategory === 'All' ? items : items.filter(i => i.category === activeCategory)
  const uncheckedTotal = items.filter(i => !i.checked).reduce((s, i) => s + i.price * i.quantity, 0)
  const grandTotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const checkedCount = items.filter(i => i.checked).length
  const budgetPct = Math.min((uncheckedTotal / budget.tripBudget) * 100, 100)
  const overBudget = uncheckedTotal > budget.tripBudget

  const toggle = (id: string) => setItems(p => p.map(i => i.id === id ? { ...i, checked: !i.checked } : i))
  const changeQty = (id: string, d: number) => setItems(p => p.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + d) } : i))
  const remove = (id: string) => setItems(p => p.filter(i => i.id !== id))

  return (
    <div className="flex flex-col h-full">
      {/* Budget bar */}
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between mb-1.5">
          <div>
            <div className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>{checkedCount}/{items.length} checked · remaining</div>
            <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: overBudget ? '#C0392B' : 'var(--color-foreground)' }}>${uncheckedTotal.toFixed(2)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>trip budget</div>
            <div className="text-lg font-semibold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>${budget.tripBudget.toFixed(0)}</div>
          </div>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-muted)' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${budgetPct}%`, background: overBudget ? '#C0392B' : budgetPct > 80 ? '#F59E0B' : 'var(--color-primary)' }} />
        </div>
        {overBudget && <div className="text-xs mt-1" style={{ fontFamily: 'var(--font-mono)', color: '#C0392B' }}>⚠ ${(uncheckedTotal - budget.tripBudget).toFixed(2)} over budget</div>}
      </div>

      <div className="flex gap-2 px-4 py-2 overflow-x-auto shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} className="shrink-0 text-xs px-3 py-1.5 rounded-full transition-all" style={{ fontFamily: 'var(--font-mono)', fontWeight: activeCategory === cat ? '600' : '400', background: activeCategory === cat ? 'var(--color-primary)' : 'var(--color-muted)', color: activeCategory === cat ? 'white' : 'var(--color-muted-foreground)' }}>{cat}</button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
        {filtered.map((item, idx) => (
          <div key={item.id} className="fade-in-up rounded-lg border flex items-center gap-3 px-3 py-3 transition-all" style={{ animationDelay: `${idx * 25}ms`, borderColor: 'var(--color-border)', background: item.checked ? 'var(--color-muted)' : 'var(--color-card)', opacity: item.checked ? 0.6 : 1 }}>
            <button onClick={() => toggle(item.id)} className="w-5 h-5 shrink-0 rounded border-2 flex items-center justify-center transition-all" style={{ borderColor: item.checked ? 'var(--color-primary)' : 'var(--color-border)', background: item.checked ? 'var(--color-primary)' : 'transparent' }}>
              {item.checked && <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </button>
            <div className="w-8 h-8 shrink-0 rounded flex items-center justify-center text-xs font-bold" style={{ background: item.imageColor, fontFamily: 'var(--font-mono)' }}>{item.name[0]}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap"><span className="text-sm font-medium truncate" style={{ textDecoration: item.checked ? 'line-through' : 'none' }}>{item.name}</span><CategoryBadge category={item.category} /></div>
              <div className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>{item.brand} · ${item.price.toFixed(2)}/{item.unit}</div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button onClick={() => changeQty(item.id, -1)} className="w-6 h-6 rounded flex items-center justify-center text-sm" style={{ background: 'var(--color-muted)', color: 'var(--color-muted-foreground)' }}>−</button>
              <span className="w-5 text-center text-sm font-medium" style={{ fontFamily: 'var(--font-mono)' }}>{item.quantity}</span>
              <button onClick={() => changeQty(item.id, 1)} className="w-6 h-6 rounded flex items-center justify-center text-sm" style={{ background: 'var(--color-muted)', color: 'var(--color-muted-foreground)' }}>+</button>
            </div>
            <div className="text-sm font-semibold shrink-0 w-14 text-right" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>${(item.price * item.quantity).toFixed(2)}</div>
            <button onClick={() => remove(item.id)} className="w-6 h-6 shrink-0 flex items-center justify-center rounded opacity-40 hover:opacity-100" style={{ color: '#C0392B' }}>
              <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── TAB: Scanner ────────────────────────────────────────────────────────────────

function ScannerTab({ onAddItem }: { onAddItem: (item: GroceryItem) => void }) {
  const [scanning, setScanning] = useState(false)
  const [recentScans, setRecentScans] = useState<ScannedItem[]>([])
  const [scanResult, setScanResult] = useState<ScannedItem | null>(null)
  const [manualBarcode, setManualBarcode] = useState('')
  const [error, setError] = useState('')
  const barcodeIdx = useRef(0)

  const doScan = (barcode?: string) => {
    setError(''); setScanResult(null); setScanning(true)
    setTimeout(() => {
      setScanning(false)
      const code = barcode ?? DEMO_BARCODES[barcodeIdx.current % DEMO_BARCODES.length]
      barcodeIdx.current++
      const item = SCAN_DATABASE[code]
      if (item) { const r = { ...item, timestamp: new Date() }; setScanResult(r); setRecentScans(p => [r, ...p.slice(0, 4)]) }
      else setError(`No product found for barcode ${code}`)
    }, 1800)
  }

  const addToList = (s: ScannedItem) => {
    onAddItem({ id: `added-${Date.now()}`, name: s.name, brand: s.brand, category: 'Pantry', quantity: 1, unit: 'ea', price: s.price, checked: false, barcode: s.barcode, imageColor: s.imageColor })
    setScanResult(null)
  }

  return (
    <div className="flex flex-col items-center gap-5 px-4 py-5">
      <div className="relative w-full max-w-xs" style={{ aspectRatio: '1 / 0.72' }}>
        <div className="relative w-full h-full rounded-xl overflow-hidden flex items-center justify-center" style={{ background: '#0E1A14' }}>
          {[['top-3 left-3', 'border-t border-l'], ['top-3 right-3', 'border-t border-r'], ['bottom-3 left-3', 'border-b border-l'], ['bottom-3 right-3', 'border-b border-r']].map(([pos, border]) => (
            <div key={pos} className={`absolute w-5 h-5 ${pos} ${border}`} style={{ borderColor: '#5BB87A', borderWidth: '2px' }} />
          ))}
          <div className="relative w-4/5 h-3/5 rounded" style={{ border: '1px solid rgba(91,184,122,0.3)' }}>
            {scanning && <><div className="scan-line absolute left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #5BB87A, transparent)', boxShadow: '0 0 6px #5BB87A' }} /><div className="pulse-ring absolute inset-0 rounded border" style={{ borderColor: 'rgba(91,184,122,0.5)' }} /></>}
          </div>
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <span className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: scanning ? '#5BB87A' : 'rgba(255,255,255,0.4)' }}>{scanning ? '◉ SCANNING...' : '○ READY TO SCAN'}</span>
          </div>
        </div>
        {!scanning && <button onClick={() => doScan()} className="absolute inset-0 w-full h-full rounded-xl flex items-center justify-center"><div className="flex flex-col items-center gap-2 px-6 py-4 rounded-xl" style={{ background: 'rgba(26,107,60,0.9)', backdropFilter: 'blur(8px)' }}><svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9V6a3 3 0 013-3h3M3 15v3a3 3 0 003 3h3M15 3h3a3 3 0 013 3v3M15 21h3a3 3 0 003-3v-3" strokeLinecap="round" /><path d="M7 12h10" strokeLinecap="round" /></svg><span className="text-sm font-medium text-white" style={{ fontFamily: 'var(--font-mono)' }}>TAP TO SCAN</span></div></button>}
      </div>

      <form onSubmit={e => { e.preventDefault(); if (manualBarcode.trim()) { doScan(manualBarcode.trim()); setManualBarcode('') } }} className="flex gap-2 w-full max-w-xs">
        <input type="text" value={manualBarcode} onChange={e => setManualBarcode(e.target.value)} placeholder="Enter barcode manually..." className="flex-1 text-sm px-3 py-2 rounded-lg border outline-none" style={{ fontFamily: 'var(--font-mono)', background: 'var(--color-card)', borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }} />
        <button type="submit" className="px-3 py-2 rounded-lg text-sm font-medium" style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'var(--font-mono)' }}>GO</button>
      </form>

      {error && <div className="w-full max-w-xs text-sm px-3 py-2 rounded-lg" style={{ background: '#FEE2E2', color: '#C0392B', fontFamily: 'var(--font-mono)' }}>{error}</div>}

      {scanResult && (
        <div className="slide-in w-full max-w-xs rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-accent)', background: 'var(--color-card)' }}>
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0" style={{ background: scanResult.imageColor, fontFamily: 'var(--font-mono)' }}>{scanResult.name[0]}</div>
            <div className="flex-1"><div className="font-medium text-sm">{scanResult.name}</div><div className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>{scanResult.brand} · {scanResult.store}</div></div>
            <div className="text-lg font-bold shrink-0" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>${scanResult.price.toFixed(2)}</div>
          </div>
          <div className="text-xs px-4 pb-2" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>▊▊▊ {scanResult.barcode}</div>
          <div className="flex border-t" style={{ borderColor: 'var(--color-border)' }}>
            <button onClick={() => setScanResult(null)} className="flex-1 py-2.5 text-sm" style={{ color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)' }}>DISMISS</button>
            <button onClick={() => addToList(scanResult)} className="flex-1 py-2.5 text-sm font-medium border-l" style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'var(--font-mono)', borderColor: 'var(--color-border)' }}>+ ADD TO LIST</button>
          </div>
        </div>
      )}

      {recentScans.length > 0 && (
        <div className="w-full max-w-xs">
          <div className="text-xs font-medium mb-2" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)', letterSpacing: '0.08em' }}>RECENT SCANS</div>
          <div className="flex flex-col gap-1.5">
            {recentScans.map((s, i) => (
              <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-lg" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
                <div className="w-6 h-6 rounded shrink-0 flex items-center justify-center text-xs font-bold" style={{ background: s.imageColor, fontFamily: 'var(--font-mono)' }}>{s.name[0]}</div>
                <div className="flex-1 min-w-0"><div className="text-xs font-medium truncate">{s.name}</div><div className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>{s.store}</div></div>
                <div className="text-xs font-semibold shrink-0" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>${s.price.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── TAB: Prices ─────────────────────────────────────────────────────────────────

function PricesTab({ tracked, setTracked }: { tracked: TrackedItem[]; setTracked: React.Dispatch<React.SetStateAction<TrackedItem[]>> }) {
  const [selected, setSelected] = useState<TrackedItem | null>(null)
  const [editAlert, setEditAlert] = useState<string>('')
  const [showAlertInput, setShowAlertInput] = useState(false)
  const alertCount = tracked.filter(t => t.alertPrice !== null && t.currentPrice <= t.alertPrice).length

  const saveAlert = (id: string) => {
    const val = parseFloat(editAlert)
    if (!isNaN(val)) {
      setTracked(p => p.map(t => t.id === id ? { ...t, alertPrice: val } : t))
      setSelected(p => p ? { ...p, alertPrice: val } : p)
    }
    setShowAlertInput(false); setEditAlert('')
  }

  if (selected) {
    const prices = selected.priceHistory.map(p => p.price)
    const change = prices[prices.length - 1] - prices[prices.length - 2]
    const isAlertHit = selected.alertPrice !== null && selected.currentPrice <= selected.alertPrice
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-4 py-3 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <button onClick={() => { setSelected(null); setShowAlertInput(false) }} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-muted)', color: 'var(--color-muted-foreground)' }}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <div className="w-8 h-8 rounded shrink-0 flex items-center justify-center text-sm font-bold" style={{ background: selected.imageColor, fontFamily: 'var(--font-mono)' }}>{selected.name[0]}</div>
          <div className="flex-1"><div className="text-sm font-medium">{selected.name}</div><div className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>{selected.brand}</div></div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            {[{ label: 'CURRENT', value: `$${selected.currentPrice.toFixed(2)}`, color: 'var(--color-foreground)' }, { label: 'LOWEST', value: `$${selected.lowestPrice.toFixed(2)}`, color: '#1A6B3C' }, { label: 'HIGHEST', value: `$${selected.highestPrice.toFixed(2)}`, color: '#C0392B' }].map(({ label, value, color }) => (
              <div key={label} className="rounded-lg p-3 text-center" style={{ background: 'var(--color-muted)' }}>
                <div className="text-xs mb-1" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)', letterSpacing: '0.06em' }}>{label}</div>
                <div className="text-lg font-bold" style={{ fontFamily: 'var(--font-mono)', color }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Price alert */}
          <div className="rounded-xl p-3 border" style={{ borderColor: isAlertHit ? '#86EFAC' : 'var(--color-border)', background: isAlertHit ? '#F0FDF4' : 'var(--color-card)' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)', letterSpacing: '0.06em' }}>PRICE ALERT</div>
              {isAlertHit && <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#DCFCE7', color: '#1A6B3C', fontFamily: 'var(--font-mono)' }}>🎯 HIT!</span>}
            </div>
            {showAlertInput ? (
              <div className="flex gap-2">
                <input type="number" step="0.01" value={editAlert} onChange={e => setEditAlert(e.target.value)} placeholder="e.g. 4.99" className="flex-1 text-sm px-2 py-1.5 rounded-lg border outline-none" style={{ fontFamily: 'var(--font-mono)', borderColor: 'var(--color-border)', background: 'var(--color-muted)' }} autoFocus />
                <button onClick={() => saveAlert(selected.id)} className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'var(--font-mono)' }}>SET</button>
                <button onClick={() => setShowAlertInput(false)} className="px-2 py-1.5 rounded-lg text-sm" style={{ background: 'var(--color-muted)', color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)' }}>✕</button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
                  {selected.alertPrice !== null ? <span>Alert at <strong>${selected.alertPrice.toFixed(2)}</strong>{selected.unit}</span> : <span style={{ color: 'var(--color-muted-foreground)' }}>No alert set</span>}
                </div>
                <button onClick={() => { setShowAlertInput(true); setEditAlert(selected.alertPrice?.toString() ?? '') }} className="text-xs px-2.5 py-1 rounded-lg" style={{ background: 'var(--color-secondary)', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>
                  {selected.alertPrice ? 'EDIT' : '+ SET'}
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: change > 0 ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${change > 0 ? '#FECACA' : '#BBF7D0'}` }}>
            <span className="text-sm" style={{ color: change > 0 ? '#C0392B' : '#1A6B3C' }}>{change > 0 ? '↑' : '↓'} ${Math.abs(change).toFixed(2)} ({Math.abs((change / prices[prices.length - 2]) * 100).toFixed(1)}%) vs last month</span>
          </div>

          {/* Chart */}
          <div>
            <div className="text-xs font-medium mb-3" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)', letterSpacing: '0.08em' }}>7-MONTH HISTORY</div>
            <div className="rounded-xl p-4" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
              <svg width="100%" viewBox="0 0 300 120" preserveAspectRatio="none" className="overflow-visible">
                {[0, 0.25, 0.5, 0.75, 1].map(t => {
                  const y = 10 + t * 80, val = Math.max(...prices) - t * (Math.max(...prices) - Math.min(...prices))
                  return <g key={t}><line x1="35" y1={y} x2="295" y2={y} stroke="var(--color-border)" strokeWidth="0.5" /><text x="30" y={y + 3} textAnchor="end" fontSize="8" fill="var(--color-muted-foreground)" fontFamily="var(--font-mono)">${val.toFixed(2)}</text></g>
                })}
                {/* Alert price line */}
                {selected.alertPrice !== null && (() => {
                  const minP = Math.min(...prices), maxP = Math.max(...prices), range = maxP - minP || 1
                  const ay = 10 + (1 - (selected.alertPrice - minP) / range) * 80
                  return ay >= 10 && ay <= 90 ? <line x1="35" y1={ay} x2="295" y2={ay} stroke="#F59E0B" strokeWidth="1" strokeDasharray="4,3" /> : null
                })()}
                {(() => {
                  const minP = Math.min(...prices), maxP = Math.max(...prices), range = maxP - minP || 1
                  const pts = prices.map((p, i) => ({ x: 35 + (i / (prices.length - 1)) * 260, y: 10 + (1 - (p - minP) / range) * 80 }))
                  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
                  const area = `${line} L${pts[pts.length - 1].x},90 L${pts[0].x},90 Z`
                  return <><path d={area} fill="var(--color-primary)" opacity="0.08" /><path d={line} fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />{pts.map((p, i) => <g key={i}><circle cx={p.x} cy={p.y} r="3" fill="var(--color-primary)" /><text x={p.x} y={108} textAnchor="middle" fontSize="7" fill="var(--color-muted-foreground)" fontFamily="var(--font-mono)">{selected.priceHistory[i].date}</text></g>)}</>
                })()}
              </svg>
              {selected.alertPrice !== null && <div className="text-xs mt-1" style={{ fontFamily: 'var(--font-mono)', color: '#F59E0B' }}>— alert threshold ${selected.alertPrice.toFixed(2)}</div>}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium mb-2" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)', letterSpacing: '0.08em' }}>PRICE RECORDS</div>
            <div className="flex flex-col gap-1.5">
              {selected.priceHistory.slice().reverse().map((rec, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
                  <div><div className="text-xs font-medium">{rec.store}</div><div className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>{rec.date} 2025</div></div>
                  <div className="text-sm font-semibold" style={{ fontFamily: 'var(--font-mono)', color: rec.price === selected.lowestPrice ? '#1A6B3C' : rec.price === selected.highestPrice ? '#C0392B' : 'var(--color-foreground)' }}>${rec.price.toFixed(2)}{rec.price === selected.lowestPrice && <span className="ml-1 text-xs">★</span>}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b flex items-center justify-between shrink-0" style={{ borderColor: 'var(--color-border)' }}>
        <div><div className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>TRACKING {tracked.length} ITEMS</div><div className="text-sm font-medium">Price History</div></div>
        {alertCount > 0 && <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: '#DCFCE7', color: '#1A6B3C' }}><span className="text-xs font-bold" style={{ fontFamily: 'var(--font-mono)' }}>🎯 {alertCount} alert{alertCount > 1 ? 's' : ''} hit</span></div>}
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
        {tracked.map((item, idx) => {
          const prices = item.priceHistory.map(p => p.price)
          const change = prices[prices.length - 1] - prices[prices.length - 2]
          const pct = ((change / prices[prices.length - 2]) * 100).toFixed(1)
          const isAlertHit = item.alertPrice !== null && item.currentPrice <= item.alertPrice
          return (
            <button key={item.id} onClick={() => setSelected(item)} className="fade-in-up w-full rounded-xl border p-4 text-left transition-all" style={{ animationDelay: `${idx * 40}ms`, background: isAlertHit ? '#F0FDF4' : 'var(--color-card)', borderColor: isAlertHit ? '#86EFAC' : 'var(--color-border)' }}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-sm font-bold" style={{ background: item.imageColor, fontFamily: 'var(--font-mono)' }}>{item.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <div><div className="text-sm font-medium truncate">{item.name}</div><div className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>{item.brand}</div></div>
                    <div className="text-right shrink-0">
                      <div className="text-base font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>${item.currentPrice.toFixed(2)}</div>
                      <div className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: change > 0 ? '#C0392B' : '#1A6B3C' }}>{change > 0 ? '↑' : '↓'}{Math.abs(parseFloat(pct))}%</div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-end justify-between">
                    <div className="flex flex-col gap-0.5">
                      <div className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>Low ${item.lowestPrice.toFixed(2)} · High ${item.highestPrice.toFixed(2)}</div>
                      {item.alertPrice !== null && <div className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: isAlertHit ? '#1A6B3C' : '#F59E0B' }}>{isAlertHit ? '🎯 Alert hit!' : `Alert: $${item.alertPrice.toFixed(2)}`}</div>}
                    </div>
                    <Sparkline data={prices} color={change > 0 ? '#C0392B' : '#1A6B3C'} width={80} height={32} />
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── TAB: Compare ────────────────────────────────────────────────────────────────

function CompareTab() {
  const [activeItem, setActiveItem] = useState(0)
  const item = STORE_COMPARISONS[activeItem]
  const sorted = [...item.prices].sort((a, b) => a.price - b.price)
  const cheapest = sorted[0].price, mostExpensive = sorted[sorted.length - 1].price

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
        <div className="text-xs mb-2" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)', letterSpacing: '0.08em' }}>COMPARE ITEM</div>
        <div className="flex gap-2 flex-wrap">
          {STORE_COMPARISONS.map((comp, i) => (
            <button key={comp.itemId} onClick={() => setActiveItem(i)} className="text-xs px-3 py-1.5 rounded-lg transition-all" style={{ fontFamily: 'var(--font-mono)', background: activeItem === i ? 'var(--color-primary)' : 'var(--color-muted)', color: activeItem === i ? 'white' : 'var(--color-muted-foreground)', fontWeight: activeItem === i ? '600' : '400' }}>{comp.name}</button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        <div className="rounded-xl p-4" style={{ background: 'var(--color-primary)', color: 'white' }}>
          <div className="text-xs mb-1 opacity-70" style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>MAX POTENTIAL SAVINGS</div>
          <div className="text-3xl font-bold" style={{ fontFamily: 'var(--font-mono)' }}>${(mostExpensive - cheapest).toFixed(2)}</div>
          <div className="text-xs opacity-70 mt-1" style={{ fontFamily: 'var(--font-mono)' }}>{sorted[sorted.length - 1].store} vs {sorted[0].store}</div>
        </div>
        <div>
          <div className="text-xs font-medium mb-3" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)', letterSpacing: '0.08em' }}>PRICE BY STORE</div>
          <div className="flex flex-col gap-2">
            {sorted.map((sp, i) => {
              const pct = ((sp.price - cheapest) / (mostExpensive - cheapest || 1)) * 100
              const isCheapest = sp.price === cheapest
              return (
                <div key={sp.store} className="fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2"><span className="text-sm font-medium">{sp.store}</span>{!sp.inStock && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#FEE2E2', color: '#C0392B', fontFamily: 'var(--font-mono)' }}>OUT OF STOCK</span>}{isCheapest && sp.inStock && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#DCFCE7', color: '#1A6B3C', fontFamily: 'var(--font-mono)' }}>BEST PRICE</span>}</div>
                    <div className="flex items-center gap-2"><span className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>{sp.distance}</span><span className="text-sm font-bold" style={{ fontFamily: 'var(--font-mono)', color: isCheapest ? '#1A6B3C' : 'var(--color-foreground)' }}>${sp.price.toFixed(2)}</span></div>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-muted)' }}><div className="h-full rounded-full transition-all" style={{ width: `${Math.max(isCheapest ? 15 : pct, 10)}%`, background: isCheapest ? 'var(--color-primary)' : !sp.inStock ? '#D1D5DB' : 'var(--color-accent)', opacity: !sp.inStock ? 0.4 : 1 }} /></div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
          <div className="grid grid-cols-4 px-3 py-2 text-xs font-medium" style={{ background: 'var(--color-muted)', fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)', letterSpacing: '0.06em' }}>
            <span>STORE</span><span className="text-center">PRICE</span><span className="text-center">VS BEST</span><span className="text-right">DIST</span>
          </div>
          {sorted.map((sp, i) => {
            const diff = sp.price - cheapest
            return (
              <div key={sp.store} className="grid grid-cols-4 px-3 py-3 items-center border-t" style={{ borderColor: 'var(--color-border)', background: i % 2 === 0 ? 'var(--color-card)' : 'transparent' }}>
                <span className="text-xs font-medium truncate">{sp.store}</span>
                <span className="text-center text-sm font-bold" style={{ fontFamily: 'var(--font-mono)', color: sp.price === cheapest ? '#1A6B3C' : 'var(--color-foreground)' }}>${sp.price.toFixed(2)}</span>
                <span className="text-center text-xs" style={{ fontFamily: 'var(--font-mono)', color: diff === 0 ? '#1A6B3C' : '#C0392B' }}>{diff === 0 ? '—' : `+$${diff.toFixed(2)}`}</span>
                <span className="text-right text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>{sp.distance}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── TAB: Pantry ─────────────────────────────────────────────────────────────────

function PantryTab({ pantry, setPantry, addToList }: { pantry: PantryItem[]; setPantry: React.Dispatch<React.SetStateAction<PantryItem[]>>; addToList: (item: GroceryItem) => void }) {
  const today = new Date('2025-08-01')
  const getDaysUntilExpiry = (d: string) => Math.ceil((new Date(d).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const getExpiryColor = (days: number) => days <= 2 ? '#C0392B' : days <= 5 ? '#F59E0B' : '#1A6B3C'
  const getExpiryBg = (days: number) => days <= 2 ? '#FEF2F2' : days <= 5 ? '#FFFBEB' : '#F0FDF4'

  const lowStock = pantry.filter(i => i.quantity <= i.minStock).length
  const expiringSoon = pantry.filter(i => getDaysUntilExpiry(i.expiryDate) <= 3).length

  const changeQty = (id: string, d: number) => setPantry(p => p.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + d) } : i))

  const addLowToList = (item: PantryItem) => {
    addToList({ id: `pantry-${Date.now()}`, name: item.name, brand: item.brand, category: item.category, quantity: item.minStock, unit: item.unit, price: 3.99, checked: false, barcode: '', imageColor: item.imageColor })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between mb-2">
          <div><div className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>{pantry.length} ITEMS IN PANTRY</div><div className="text-sm font-medium">Pantry Inventory</div></div>
        </div>
        <div className="flex gap-2">
          {lowStock > 0 && <div className="flex-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}><span className="text-xs font-medium" style={{ color: '#C0392B', fontFamily: 'var(--font-mono)' }}>⚠ {lowStock} low stock</span></div>}
          {expiringSoon > 0 && <div className="flex-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}><span className="text-xs font-medium" style={{ color: '#D97706', fontFamily: 'var(--font-mono)' }}>⏱ {expiringSoon} expiring</span></div>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
        {pantry.map((item, idx) => {
          const days = getDaysUntilExpiry(item.expiryDate)
          const isLow = item.quantity <= item.minStock
          const stockPct = Math.min((item.quantity / (item.minStock * 3)) * 100, 100)
          return (
            <div key={item.id} className="fade-in-up rounded-xl border p-3" style={{ animationDelay: `${idx * 25}ms`, background: 'var(--color-card)', borderColor: isLow ? '#FECACA' : 'var(--color-border)' }}>
              <div className="flex items-start gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-sm font-bold" style={{ background: item.imageColor, fontFamily: 'var(--font-mono)' }}>{item.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <div><div className="text-sm font-medium">{item.name}</div><div className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>{item.brand}</div></div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={() => changeQty(item.id, -1)} className="w-6 h-6 rounded flex items-center justify-center text-sm" style={{ background: 'var(--color-muted)', color: 'var(--color-muted-foreground)' }}>−</button>
                      <span className="w-8 text-center text-sm font-bold" style={{ fontFamily: 'var(--font-mono)' }}>{item.quantity}</span>
                      <button onClick={() => changeQty(item.id, 1)} className="w-6 h-6 rounded flex items-center justify-center text-sm" style={{ background: 'var(--color-muted)', color: 'var(--color-muted-foreground)' }}>+</button>
                    </div>
                  </div>
                </div>
              </div>
              {/* Stock bar */}
              <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: 'var(--color-muted)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${stockPct}%`, background: isLow ? '#C0392B' : 'var(--color-primary)' }} />
              </div>
              <div className="flex items-center justify-between">
                <div className="px-2 py-0.5 rounded text-xs font-medium" style={{ fontFamily: 'var(--font-mono)', background: getExpiryBg(days), color: getExpiryColor(days) }}>
                  {days <= 0 ? 'EXPIRED' : days === 1 ? 'Expires tomorrow' : `Expires in ${days}d`}
                </div>
                {isLow && <button onClick={() => addLowToList(item)} className="text-xs px-2.5 py-0.5 rounded-full font-medium transition-colors" style={{ background: 'var(--color-secondary)', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>+ Add to list</button>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── TAB: Meal Planner ────────────────────────────────────────────────────────────

function MealsTab({ addToList }: { addToList: (item: GroceryItem) => void }) {
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null)
  const [addedMeals, setAddedMeals] = useState<Set<string>>(new Set())

  const weekTotal = MEALS.reduce((s, m) => s + m.ingredients.reduce((is, i) => is + i.price * i.qty, 0), 0)

  const addMealToList = (meal: Meal) => {
    meal.ingredients.forEach((ing, idx) => {
      addToList({
        id: `meal-${meal.id}-${idx}-${Date.now()}`,
        name: ing.name, brand: meal.name, category: ing.category,
        quantity: Math.ceil(ing.qty), unit: ing.unit, price: ing.price,
        checked: false, barcode: '', imageColor: ['#C4E8C4', '#F0ECC4', '#D4E8F0', '#F0C8C4', '#E4C4F0'][idx % 5],
      })
    })
    setAddedMeals(p => new Set([...p, meal.id]))
    setSelectedMeal(null)
  }

  const addAllMeals = () => MEALS.forEach(m => { if (!addedMeals.has(m.id)) addMealToList(m) })

  if (selectedMeal) {
    const mealTotal = selectedMeal.ingredients.reduce((s, i) => s + i.price * i.qty, 0)
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-4 py-3 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <button onClick={() => setSelectedMeal(null)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-muted)', color: 'var(--color-muted-foreground)' }}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <div className="flex-1"><div className="text-sm font-medium">{selectedMeal.name}</div><div className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>{selectedMeal.day} · {selectedMeal.servings} servings</div></div>
          <div className="text-base font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>${mealTotal.toFixed(2)}</div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
          {selectedMeal.ingredients.map((ing, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-lg border" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
              <CategoryBadge category={ing.category} />
              <div className="flex-1"><div className="text-sm font-medium">{ing.name}</div><div className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>{ing.qty} {ing.unit}</div></div>
              <div className="text-sm font-semibold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>${(ing.price * ing.qty).toFixed(2)}</div>
            </div>
          ))}
        </div>
        <div className="px-4 py-4 border-t shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <button onClick={() => addMealToList(selectedMeal)} className="w-full py-3 rounded-xl text-sm font-semibold transition-colors" style={{ background: addedMeals.has(selectedMeal.id) ? 'var(--color-muted)' : 'var(--color-primary)', color: addedMeals.has(selectedMeal.id) ? 'var(--color-muted-foreground)' : 'white', fontFamily: 'var(--font-mono)' }}>
            {addedMeals.has(selectedMeal.id) ? '✓ ADDED TO LIST' : '+ ADD ALL INGREDIENTS TO LIST'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between">
          <div><div className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>THIS WEEK · 5 MEALS</div><div className="text-sm font-medium">Meal Planner</div></div>
          <div className="text-right"><div className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>weekly cost</div><div className="text-base font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>${weekTotal.toFixed(2)}</div></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
        {MEALS.map((meal, idx) => {
          const mealTotal = meal.ingredients.reduce((s, i) => s + i.price * i.qty, 0)
          const isAdded = addedMeals.has(meal.id)
          return (
            <button key={meal.id} onClick={() => setSelectedMeal(meal)} className="fade-in-up w-full rounded-xl border p-4 text-left transition-all" style={{ animationDelay: `${idx * 35}ms`, background: isAdded ? 'var(--color-secondary)' : 'var(--color-card)', borderColor: isAdded ? 'var(--color-accent)' : 'var(--color-border)' }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="text-sm font-semibold">{meal.name}</div>
                  <div className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>{meal.day} · {meal.servings} servings</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>${mealTotal.toFixed(2)}</div>
                  {isAdded && <div className="text-xs" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>✓ added</div>}
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {meal.ingredients.map(ing => <span key={ing.name} className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-muted)', fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>{ing.name}</span>)}
              </div>
            </button>
          )
        })}
      </div>
      <div className="px-4 py-4 border-t shrink-0" style={{ borderColor: 'var(--color-border)' }}>
        <button onClick={addAllMeals} className="w-full py-3 rounded-xl text-sm font-semibold" style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'var(--font-mono)' }}>+ ADD ALL 5 MEALS TO LIST</button>
      </div>
    </div>
  )
}

// ─── TAB: Receipt Scanner ─────────────────────────────────────────────────────────

function ReceiptTab() {
  const [receiptText, setReceiptText] = useState('')
  const [parsed, setParsed] = useState<{ name: string; price: number; store: string }[] | null>(null)
  const [store, setStore] = useState('Whole Foods')
  const [saved, setSaved] = useState(false)

  const DEMO_RECEIPT = `WHOLE FOODS MARKET
Date: 07/31/2025

Organic Whole Milk 2gal    10.98
Chobani Greek Yogurt x3     5.67
Sourdough Bread             4.79
Baby Spinach Bag            3.99
Cherry Tomatoes Pint        4.49
Avocado x4                  5.16
EVOO 500ml                 12.49
Penne Pasta x2              3.58

SUBTOTAL                   51.15
TAX                         4.09
TOTAL                      55.24`

  const parseReceipt = () => {
    const lines = receiptText.split('\n')
    const items: { name: string; price: number; store: string }[] = []
    const pricePattern = /^(.+?)\s+([\d]+\.[\d]{2})\s*$/
    for (const line of lines) {
      const match = line.trim().match(pricePattern)
      if (match) {
        const name = match[1].trim()
        const price = parseFloat(match[2])
        if (!['SUBTOTAL', 'TAX', 'TOTAL', 'DISCOUNT', 'SAVINGS'].some(k => name.toUpperCase().includes(k))) {
          items.push({ name, price, store })
        }
      }
    }
    setParsed(items.length > 0 ? items : null)
    setSaved(false)
  }

  const saveAll = () => {
    setSaved(true)
    setTimeout(() => { setParsed(null); setReceiptText('') }, 1500)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
        <div className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>IMPORT PRICES FROM RECEIPT</div>
        <div className="text-sm font-medium">Receipt Scanner</div>
      </div>

      {parsed ? (
        <div className="flex flex-col h-full">
          <div className="px-4 pt-3 flex items-center justify-between shrink-0">
            <div className="text-xs font-medium" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)', letterSpacing: '0.06em' }}>PARSED {parsed.length} ITEMS FROM {store.toUpperCase()}</div>
            <button onClick={() => setParsed(null)} className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>← BACK</button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
            {parsed.map((item, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-lg border" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
                <div>
                  <div className="text-sm font-medium">{item.name}</div>
                  <div className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>{item.store}</div>
                </div>
                <div className="text-sm font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>${item.price.toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div className="px-4 py-4 border-t shrink-0" style={{ borderColor: 'var(--color-border)' }}>
            <button onClick={saveAll} className="w-full py-3 rounded-xl text-sm font-semibold transition-all" style={{ background: saved ? 'var(--color-secondary)' : 'var(--color-primary)', color: saved ? 'var(--color-primary)' : 'white', fontFamily: 'var(--font-mono)' }}>
              {saved ? '✓ PRICES SAVED TO HISTORY' : `SAVE ${parsed.length} PRICES TO HISTORY`}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col px-4 py-4 gap-4 overflow-y-auto">
          <div className="flex gap-2">
            {['Whole Foods', 'Safeway', 'Kroger', 'Target', 'Costco'].map(s => (
              <button key={s} onClick={() => setStore(s)} className="text-xs px-2.5 py-1.5 rounded-lg shrink-0 transition-all" style={{ fontFamily: 'var(--font-mono)', background: store === s ? 'var(--color-primary)' : 'var(--color-muted)', color: store === s ? 'white' : 'var(--color-muted-foreground)', fontWeight: store === s ? '600' : '400' }}>{s}</button>
            ))}
          </div>

          <div>
            <div className="text-xs font-medium mb-2" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)', letterSpacing: '0.06em' }}>PASTE RECEIPT TEXT</div>
            <textarea
              value={receiptText}
              onChange={e => setReceiptText(e.target.value)}
              placeholder="Paste receipt text here, or tap 'Load Demo' to try it out..."
              rows={10}
              className="w-full text-xs px-3 py-2.5 rounded-xl border outline-none resize-none"
              style={{ fontFamily: 'var(--font-mono)', background: 'var(--color-muted)', borderColor: 'var(--color-border)', color: 'var(--color-foreground)', lineHeight: '1.7' }}
            />
          </div>

          <div className="flex gap-2">
            <button onClick={() => setReceiptText(DEMO_RECEIPT)} className="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors" style={{ borderColor: 'var(--color-border)', background: 'var(--color-card)', color: 'var(--color-foreground)', fontFamily: 'var(--font-mono)' }}>LOAD DEMO</button>
            <button onClick={parseReceipt} disabled={!receiptText.trim()} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors" style={{ background: receiptText.trim() ? 'var(--color-primary)' : 'var(--color-muted)', color: receiptText.trim() ? 'white' : 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)' }}>PARSE RECEIPT</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── TAB: Budget & Savings ───────────────────────────────────────────────────────

function BudgetTab({ budget, setBudget, items }: { budget: BudgetState; setBudget: React.Dispatch<React.SetStateAction<BudgetState>>; items: GroceryItem[] }) {
  const [editingTrip, setEditingTrip] = useState(false)
  const [editingWeekly, setEditingWeekly] = useState(false)
  const [tripInput, setTripInput] = useState('')
  const [weeklyInput, setWeeklyInput] = useState('')

  const currentTrip = items.filter(i => !i.checked).reduce((s, i) => s + i.price * i.quantity, 0)
  const weeklyPct = Math.min((budget.weeklySpent / budget.weeklyBudget) * 100, 100)
  const tripPct = Math.min((currentTrip / budget.tripBudget) * 100, 100)

  const MONTHLY_SAVINGS = [
    { month: 'Mar', saved: 18.40, spent: 210 },
    { month: 'Apr', saved: 22.10, spent: 195 },
    { month: 'May', saved: 15.80, spent: 228 },
    { month: 'Jun', saved: 31.20, spent: 187 },
    { month: 'Jul', saved: 28.90, spent: 201 },
    { month: 'Aug', saved: 12.40, spent: 94 },
  ]

  const totalSaved = MONTHLY_SAVINGS.reduce((s, m) => s + m.saved, 0)
  const bestMonth = MONTHLY_SAVINGS.reduce((best, m) => m.saved > best.saved ? m : best, MONTHLY_SAVINGS[0])
  const maxSpent = Math.max(...MONTHLY_SAVINGS.map(m => m.spent))

  const streak = 14

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 py-3 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
        <div className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>SPEND TRACKING</div>
        <div className="text-sm font-medium">Budget & Savings</div>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">
        {/* Budget cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Trip budget */}
          <div className="rounded-xl border p-3" style={{ background: 'var(--color-card)', borderColor: currentTrip > budget.tripBudget ? '#FECACA' : 'var(--color-border)' }}>
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)', letterSpacing: '0.05em' }}>THIS TRIP</div>
              <button onClick={() => { setEditingTrip(true); setTripInput(budget.tripBudget.toString()) }} className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-secondary)', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>EDIT</button>
            </div>
            {editingTrip ? (
              <div className="flex gap-1.5 mt-1">
                <input type="number" value={tripInput} onChange={e => setTripInput(e.target.value)} className="w-full text-sm px-2 py-1 rounded-lg border outline-none" style={{ fontFamily: 'var(--font-mono)', borderColor: 'var(--color-border)', background: 'var(--color-muted)' }} autoFocus />
                <button onClick={() => { const v = parseFloat(tripInput); if (!isNaN(v)) setBudget(p => ({ ...p, tripBudget: v })); setEditingTrip(false) }} className="text-xs px-2 py-1 rounded-lg font-medium" style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'var(--font-mono)' }}>✓</button>
              </div>
            ) : (
              <>
                <div className="text-xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: currentTrip > budget.tripBudget ? '#C0392B' : 'var(--color-foreground)' }}>${currentTrip.toFixed(0)}<span className="text-sm font-normal text-gray-400">/${budget.tripBudget.toFixed(0)}</span></div>
                <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-muted)' }}><div className="h-full rounded-full" style={{ width: `${tripPct}%`, background: currentTrip > budget.tripBudget ? '#C0392B' : tripPct > 80 ? '#F59E0B' : 'var(--color-primary)' }} /></div>
              </>
            )}
          </div>

          {/* Weekly budget */}
          <div className="rounded-xl border p-3" style={{ background: 'var(--color-card)', borderColor: budget.weeklySpent > budget.weeklyBudget ? '#FECACA' : 'var(--color-border)' }}>
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)', letterSpacing: '0.05em' }}>THIS WEEK</div>
              <button onClick={() => { setEditingWeekly(true); setWeeklyInput(budget.weeklyBudget.toString()) }} className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-secondary)', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>EDIT</button>
            </div>
            {editingWeekly ? (
              <div className="flex gap-1.5 mt-1">
                <input type="number" value={weeklyInput} onChange={e => setWeeklyInput(e.target.value)} className="w-full text-sm px-2 py-1 rounded-lg border outline-none" style={{ fontFamily: 'var(--font-mono)', borderColor: 'var(--color-border)', background: 'var(--color-muted)' }} autoFocus />
                <button onClick={() => { const v = parseFloat(weeklyInput); if (!isNaN(v)) setBudget(p => ({ ...p, weeklyBudget: v })); setEditingWeekly(false) }} className="text-xs px-2 py-1 rounded-lg font-medium" style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'var(--font-mono)' }}>✓</button>
              </div>
            ) : (
              <>
                <div className="text-xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: budget.weeklySpent > budget.weeklyBudget ? '#C0392B' : 'var(--color-foreground)' }}>${budget.weeklySpent.toFixed(0)}<span className="text-sm font-normal text-gray-400">/${budget.weeklyBudget.toFixed(0)}</span></div>
                <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-muted)' }}><div className="h-full rounded-full" style={{ width: `${weeklyPct}%`, background: budget.weeklySpent > budget.weeklyBudget ? '#C0392B' : weeklyPct > 80 ? '#F59E0B' : 'var(--color-primary)' }} /></div>
              </>
            )}
          </div>
        </div>

        {/* Streak + total saved */}
        <div className="grid grid-cols-3 gap-3">
          <Stat label="SAVED TOTAL" value={`$${totalSaved.toFixed(0)}`} sub="last 6 months" color="#1A6B3C" />
          <Stat label="BEST STREAK" value={`${streak}d`} sub="best-price buys" color="var(--color-foreground)" />
          <Stat label="BEST MONTH" value={`$${bestMonth.saved.toFixed(0)}`} sub={bestMonth.month} color="var(--color-foreground)" />
        </div>

        {/* Monthly savings chart */}
        <div className="rounded-xl border p-4" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <div className="text-xs font-medium mb-4" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)', letterSpacing: '0.08em' }}>MONTHLY SPEND & SAVINGS</div>
          <div className="flex items-end justify-between gap-2" style={{ height: '80px' }}>
            {MONTHLY_SAVINGS.map(m => {
              const spendH = (m.spent / maxSpent) * 72
              const saveH = (m.saved / maxSpent) * 72
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end gap-0.5" style={{ height: '72px' }}>
                    <div className="flex-1 rounded-t-sm" style={{ height: `${spendH}px`, background: 'var(--color-muted)' }} />
                    <div className="flex-1 rounded-t-sm" style={{ height: `${saveH}px`, background: 'var(--color-accent)' }} />
                  </div>
                  <div className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>{m.month}</div>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm" style={{ background: 'var(--color-muted)' }} /><span className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>Spent</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm" style={{ background: 'var(--color-accent)' }} /><span className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>Saved</span></div>
          </div>
        </div>

        {/* Monthly detail rows */}
        <div>
          <div className="text-xs font-medium mb-2" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)', letterSpacing: '0.08em' }}>MONTHLY BREAKDOWN</div>
          <div className="flex flex-col gap-1.5">
            {[...MONTHLY_SAVINGS].reverse().map((m, i) => (
              <div key={m.month} className="flex items-center justify-between px-3 py-2.5 rounded-lg" style={{ background: i === 0 ? 'var(--color-secondary)' : 'var(--color-card)', border: `1px solid ${i === 0 ? 'var(--color-accent)' : 'var(--color-border)'}` }}>
                <div className="flex items-center gap-2">
                  {i === 0 && <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'var(--color-primary)', color: 'white', fontFamily: 'var(--font-mono)' }}>NOW</span>}
                  <span className="text-sm font-medium">{m.month} 2025</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>spent</div>
                    <div className="text-sm font-bold" style={{ fontFamily: 'var(--font-mono)' }}>${m.spent}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>saved</div>
                    <div className="text-sm font-bold" style={{ fontFamily: 'var(--font-mono)', color: '#1A6B3C' }}>+${m.saved.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Root App ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'list', label: 'List', icon: (a: boolean) => <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={a ? 2 : 1.5}><path d="M4 5h12M4 10h12M4 15h7" strokeLinecap="round" /></svg> },
  { id: 'scan', label: 'Scan', icon: (a: boolean) => <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={a ? 2 : 1.5}><path d="M2 7V5a2 2 0 012-2h2M14 3h2a2 2 0 012 2v2M18 13v2a2 2 0 01-2 2h-2M6 17H4a2 2 0 01-2-2v-2" strokeLinecap="round" /><path d="M6 10h8" strokeLinecap="round" /></svg> },
  { id: 'prices', label: 'Prices', icon: (a: boolean) => <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={a ? 2 : 1.5}><path d="M3 14l4-5 3 3 4-6 3 4" strokeLinecap="round" strokeLinejoin="round" /></svg> },
  { id: 'compare', label: 'Compare', icon: (a: boolean) => <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={a ? 2 : 1.5}><rect x="2" y="10" width="5" height="7" rx="1" /><rect x="7.5" y="6" width="5" height="11" rx="1" /><rect x="13" y="3" width="5" height="14" rx="1" /></svg> },
  { id: 'pantry', label: 'Pantry', icon: (a: boolean) => <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={a ? 2 : 1.5}><rect x="3" y="3" width="14" height="14" rx="2" /><path d="M3 8h14M8 8v9" strokeLinecap="round" /></svg> },
  { id: 'meals', label: 'Meals', icon: (a: boolean) => <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={a ? 2 : 1.5}><path d="M6 3v5a3 3 0 006 0V3M6 10v7M13 3v14M3 17h14" strokeLinecap="round" strokeLinejoin="round" /></svg> },
  { id: 'receipt', label: 'Receipt', icon: (a: boolean) => <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={a ? 2 : 1.5}><path d="M5 3h10a1 1 0 011 1v13l-2-1.5L12 17l-2-1.5L8 17l-2 1.5L4 17V4a1 1 0 011-1z" strokeLinecap="round" strokeLinejoin="round" /><path d="M7 8h6M7 11h4" strokeLinecap="round" /></svg> },
  { id: 'budget', label: 'Budget', icon: (a: boolean) => <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={a ? 2 : 1.5}><circle cx="10" cy="10" r="7" /><path d="M10 6v1.5M10 13v.5M7.5 11.5c0 .83.67 1.5 1.5 1.5h2a1.5 1.5 0 000-3H9a1.5 1.5 0 010-3h2c.83 0 1.5.67 1.5 1.5" strokeLinecap="round" /></svg> },
]

// Split into two rows for bottom nav
const NAV_ROW1 = TABS.slice(0, 4)
const NAV_ROW2 = TABS.slice(4)

export default function App() {
  const [tab, setTab] = useState('list')
  const [items, setItems] = useState<GroceryItem[]>(INITIAL_LIST)
  const [tracked, setTracked] = useState<TrackedItem[]>(INITIAL_TRACKED)
  const [pantry, setPantry] = useState<PantryItem[]>(INITIAL_PANTRY)
  const [budget, setBudget] = useState<BudgetState>({ tripBudget: 120, weeklyBudget: 250, weeklySpent: 168.40, savedThisMonth: 12.40 })

  const addItem = (item: GroceryItem) => { setItems(p => [item, ...p]); setTab('list') }
  const unchecked = items.filter(i => !i.checked).length
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const alertCount = tracked.filter(t => t.alertPrice !== null && t.currentPrice <= t.alertPrice).length
  const expiringSoon = pantry.filter(i => {
    const days = Math.ceil((new Date(i.expiryDate).getTime() - new Date('2025-08-01').getTime()) / (1000 * 60 * 60 * 24))
    return days <= 3
  }).length

  return (
    <div className="flex items-center justify-center min-h-screen p-4" style={{ background: 'var(--color-background)' }}>
      <div className="relative flex flex-col overflow-hidden shadow-2xl" style={{ width: '100%', maxWidth: '390px', height: '844px', borderRadius: '44px', border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
        {/* Status bar */}
        <div className="flex items-center justify-between px-7 pt-4 pb-1 shrink-0">
          <span className="text-xs font-medium" style={{ fontFamily: 'var(--font-mono)' }}>9:41</span>
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-2.5" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="4" width="3" height="8" rx="0.5" /><rect x="5" y="2" width="3" height="10" rx="0.5" /><rect x="10" y="0" width="3" height="12" rx="0.5" /><rect x="15" y="0" width="3" height="12" rx="0.5" opacity="0.3" /></svg>
            <svg className="w-3.5 h-2.5" viewBox="0 0 20 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 3.5C13.5 3.5 16.5 5 18.5 7.5L10 14l-8.5-6.5C3.5 5 6.5 3.5 10 3.5z" /><path d="M10 8C11.5 8 12.8 8.8 13.5 10L10 14l-3.5-4C7.2 8.8 8.5 8 10 8z" fill="currentColor" stroke="none" /></svg>
            <div className="flex items-center gap-0.5"><div className="w-5 h-2.5 rounded-sm border" style={{ borderColor: 'var(--color-foreground)' }}><div className="h-full rounded-sm" style={{ width: '80%', background: 'var(--color-foreground)' }} /></div></div>
          </div>
        </div>

        {/* Header */}
        <div className="px-5 pt-2 pb-3 shrink-0" style={{ background: 'var(--color-card)', borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)', letterSpacing: '0.08em' }}>FRIDAY · AUG 1</div>
              <h1 className="text-xl font-bold leading-tight" style={{ fontFamily: 'var(--font-display)' }}>My Basket</h1>
            </div>
            <div className="flex items-center gap-2">
              {(alertCount > 0 || expiringSoon > 0) && (
                <div className="flex flex-col gap-0.5">
                  {alertCount > 0 && <div className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#DCFCE7', color: '#1A6B3C', fontFamily: 'var(--font-mono)' }}>🎯 {alertCount}</div>}
                  {expiringSoon > 0 && <div className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#FFFBEB', color: '#D97706', fontFamily: 'var(--font-mono)' }}>⏱ {expiringSoon}</div>}
                </div>
              )}
              <div className="text-right">
                <div className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>{unchecked} items</div>
                <div className="text-base font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>${total.toFixed(2)}</div>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--color-secondary)', color: 'var(--color-primary)' }}>
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 3h2l2.4 9.6a2 2 0 002 1.4h6.8a2 2 0 001.94-1.5L19 7H6" strokeLinecap="round" strokeLinejoin="round" /><circle cx="8" cy="17" r="1" fill="currentColor" stroke="none" /><circle cx="15" cy="17" r="1" fill="currentColor" stroke="none" /></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden" key={tab}>
          {tab === 'list' && <ShoppingListTab items={items} setItems={setItems} budget={budget} />}
          {tab === 'scan' && <ScannerTab onAddItem={addItem} />}
          {tab === 'prices' && <PricesTab tracked={tracked} setTracked={setTracked} />}
          {tab === 'compare' && <CompareTab />}
          {tab === 'pantry' && <PantryTab pantry={pantry} setPantry={setPantry} addToList={addItem} />}
          {tab === 'meals' && <MealsTab addToList={addItem} />}
          {tab === 'receipt' && <ReceiptTab />}
          {tab === 'budget' && <BudgetTab budget={budget} setBudget={setBudget} items={items} />}
        </div>

        {/* Bottom nav — two rows */}
        <div className="shrink-0" style={{ background: 'var(--color-card)', borderTop: '1px solid var(--color-border)' }}>
          {[NAV_ROW1, NAV_ROW2].map((row, rowIdx) => (
            <div key={rowIdx} className={`flex items-center px-2 ${rowIdx === 0 ? 'pt-2 pb-1' : 'pb-5 pt-1'}`}>
              {row.map(t => {
                const active = tab === t.id
                return (
                  <button key={t.id} onClick={() => setTab(t.id)} className="flex-1 flex flex-col items-center gap-0.5 py-1 rounded-xl transition-all" style={{ color: active ? 'var(--color-primary)' : 'var(--color-muted-foreground)', background: active ? 'var(--color-secondary)' : 'transparent' }}>
                    {t.icon(active)}
                    <span className="text-xs font-medium" style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.04em' }}>{t.label}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

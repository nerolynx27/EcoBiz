export type Weight = 1 | 3 | 5;
export type Fulfillment = 'pickup' | 'delivery';
export type CommerceOrder = { id: string; weight: Weight; priceSen: number; fulfillment: Fulfillment };
export const jobs = [
  { id: 'meal', title: 'Meal delivery', pickup: 'Cabin Vendor', dropoff: 'Amanah Lobby', feeSen: 300, icon: 'meals' },
  { id: 'fertilizer', title: 'Fertilizer delivery', pickup: 'EcoBiz Hub', dropoff: 'Cendekiawan', feeSen: 400, icon: 'leaf' },
] as const;
export type JobId = typeof jobs[number]['id'];
export type CommerceState = { version: 1; orders: CommerceOrder[]; online: boolean; activeJob: { id: JobId; stage: 'accepted' | 'picked-up' } | null; completedJobs: JobId[]; earningsSen: number; completedCount: number };
export type CommerceAction = { type: 'order'; id: string; weight: Weight; fulfillment: Fulfillment } | { type: 'online'; value: boolean } | { type: 'accept'; id: JobId } | { type: 'pickup' } | { type: 'complete'; code: string } | { type: 'restore'; state: CommerceState };
export const initialCommerceState: CommerceState = { version: 1, orders: [], online: true, activeJob: null, completedJobs: [], earningsSen: 1200, completedCount: 3 };
export function packPrice(weight: Weight) { return ({ 1: 800, 3: 2000, 5: 3000 })[weight]; }
export function rm(sen: number) { return `RM ${(sen / 100).toFixed(2)}`; }
export function commerceReducer(state: CommerceState, action: CommerceAction): CommerceState {
  switch (action.type) {
    case 'restore': return action.state;
    case 'order':
      if (![1, 3, 5].includes(action.weight) || !['pickup', 'delivery'].includes(action.fulfillment) || !action.id || state.orders.some(order => order.id === action.id)) return state;
      return { ...state, orders: [{ id: action.id, weight: action.weight, priceSen: packPrice(action.weight), fulfillment: action.fulfillment }, ...state.orders] };
    case 'online': return { ...state, online: action.value };
    case 'accept':
      if (!state.online || state.activeJob || state.completedJobs.includes(action.id) || !jobs.some(job => job.id === action.id)) return state;
      return { ...state, activeJob: { id: action.id, stage: 'accepted' } };
    case 'pickup': return state.activeJob?.stage === 'accepted' ? { ...state, activeJob: { ...state.activeJob, stage: 'picked-up' } } : state;
    case 'complete': {
      if (state.activeJob?.stage !== 'picked-up' || action.code !== '4821') return state;
      const job = jobs.find(job => job.id === state.activeJob?.id)!;
      return { ...state, activeJob: null, completedJobs: [...state.completedJobs, job.id], earningsSen: state.earningsSen + job.feeSen, completedCount: state.completedCount + 1 };
    }
  }
}
export function restoreCommerce(raw: string | null): CommerceState {
  if (!raw) return initialCommerceState;
  try {
    const parsed = JSON.parse(raw) as CommerceState;
    if (parsed.version !== 1 || typeof parsed.online !== 'boolean' || !Array.isArray(parsed.orders) || !Array.isArray(parsed.completedJobs)) return initialCommerceState;
    const validId = (id: unknown) => id === 'meal' || id === 'fertilizer';
    if (new Set(parsed.completedJobs).size !== parsed.completedJobs.length || !parsed.completedJobs.every(validId)) return initialCommerceState;
    if (parsed.activeJob !== null && (!parsed.activeJob || !validId(parsed.activeJob.id) || !['accepted', 'picked-up'].includes(parsed.activeJob.stage) || parsed.completedJobs.includes(parsed.activeJob.id))) return initialCommerceState;
    if (parsed.orders.some(order => !order || typeof order.id !== 'string' || !order.id || ![1, 3, 5].includes(order.weight) || order.priceSen !== packPrice(order.weight) || !['pickup', 'delivery'].includes(order.fulfillment)) || new Set(parsed.orders.map(order => order.id)).size !== parsed.orders.length) return initialCommerceState;
    if (parsed.completedCount !== 3 + parsed.completedJobs.length || parsed.earningsSen !== 1200 + jobs.filter(job => parsed.completedJobs.includes(job.id)).reduce((sum, job) => sum + job.feeSen, 0)) return initialCommerceState;
    return parsed;
  } catch { return initialCommerceState; }
}

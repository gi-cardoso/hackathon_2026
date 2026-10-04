import { http } from 'msw';

// TODO: conectar API para módulos que ainda não possuem endpoints no backend.
export const handlers = [
  http.get('/api/_mocks/health', () => new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } })),
];
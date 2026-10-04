# COCAPEC

Portal React + TypeScript + Vite para a operacao interna.

## Rodar

```bash
npm install
copy .env.example .env
npm run dev
```

`VITE_API_URL` usa `http://localhost:3000/api` por padrao. Defina `VITE_USE_MOCKS=true` apenas para habilitar handlers MSW de endpoints ainda ausentes.

## Comandos

- `npm run dev`: desenvolvimento
- `npm run build`: typecheck e build de producao
- `npm run lint`: Oxlint
- `npm run test`: Vitest com Testing Library

## Estrutura

- `src/components`: shell, navegacao e UI compartilhada
- `src/features/agendamentos`: fluxo de agendamentos
- `src/hooks`: queries tipadas por recurso
- `src/mocks`: handlers condicionais do MSW
- `src/providers`: React Query e Toaster
- `src/services`: cliente HTTP e normalizacao de erros
- `src/theme.css`: tokens visuais COCAPEC

A fila de agendamentos usa `/agendamentos/analise/compras`. Telas sem rota real permanecem sinalizadas como pendencia, sem endpoint inventado.

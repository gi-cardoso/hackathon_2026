# COCAPEC | Portal do Fornecedor

Portal React + TypeScript + Vite para autenticacao e agendamento de entregas.

## Rodar

```bash
npm install
copy .env.example .env
npm run dev
```

`VITE_API_URL` usa `http://localhost:3000/api` por padrao. `VITE_USE_MOCKS=true` habilita somente o mock do login de fornecedor, pois `/auth/fornecedor/login` ainda nao existe no backend.

## Comandos

- `npm run dev`: desenvolvimento
- `npm run build`: typecheck e build de producao
- `npm run lint`: Oxlint
- `npm run test`: Vitest com Testing Library

## Estrutura

- `src/components`: shell e UI compartilhada
- `src/features/agendamentos`: wizard e telas de agendamento
- `src/hooks`: queries tipadas por recurso
- `src/mocks`: handlers condicionais do MSW
- `src/providers`: React Query e Toaster
- `src/services/api.ts`: cliente HTTP, upload de NF, disponibilidade e criacao
- `src/theme.css`: tokens visuais COCAPEC

Disponibilidade, upload de NF e criacao usam as rotas reais. A listagem usa `/agendamentos/me`; o fallback local existente permanece marcado com TODO para compatibilidade.

# COCAPEC | Portal do Fornecedor

Portal React + TypeScript + Vite para login por CNPJ e agendamento de entregas.

## Rodar

```bash
npm install
npm run dev
```

Configure a API em `.env`:

```bash
VITE_API_URL=http://localhost:3000/api
```

## Comandos

- `npm run build`: typecheck e build de producao
- `npm run lint`: verificacao Oxlint

## Estrutura

- `src/components`: shell e componentes reutilizaveis
- `src/features/agendamentos`: wizard e telas de agendamento
- `src/pages`: login e dashboard
- `src/services/api.ts`: cliente HTTP, upload de NF, disponibilidade e criacao
- `src/theme.css`: tokens visuais COCAPEC

O wizard consulta disponibilidade e cria agendamentos pela API real. A listagem e o detalhe por fornecedor aguardam endpoints especificos no backend e permanecem sinalizados na interface.

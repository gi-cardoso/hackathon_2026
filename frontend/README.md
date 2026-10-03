# COCAPEC | Portal Interno

Portal React + TypeScript + Vite para Compras, Armazem, Boletim, BI, Usuarios e Configuracoes.

## Rodar

```bash
npm install
npm run dev
```

O portal abre na porta padrao do Vite. Configure a API em `.env`:

```bash
VITE_API_URL=http://localhost:3000/api
```

## Comandos

- `npm run build`: typecheck e build de producao
- `npm run lint`: verificacao Oxlint

## Estrutura

- `src/components`: shell, navegacao e componentes reutilizaveis
- `src/features/agendamentos`: lista, detalhe e agenda operacional
- `src/pages`: login e telas de modulos
- `src/services`: cliente HTTP e integracoes
- `src/theme.css`: tokens visuais COCAPEC

A fila de analise de agendamentos usa a API real. Modulos sem endpoint no backend exibem a pendencia explicitamente na interface.

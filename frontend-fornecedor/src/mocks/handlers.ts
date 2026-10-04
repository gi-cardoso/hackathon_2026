import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('*/auth/fornecedor/login', async () => {
    // TODO: conectar API quando o backend disponibilizar /auth/fornecedor/login.
    return HttpResponse.json({
      user: { id_fornecedor: 1, codigo_fornecedor_cocapec: 'MOCK-001', nome_fornecedor: 'Fornecedor de demonstração', cnpj: '12345678901234', contato: null, ativo: true },
      token: 'mock-fornecedor-token',
    });
  }),
];
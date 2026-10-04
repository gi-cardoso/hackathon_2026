import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de banco de dados...');

  // Limpando tabelas (cuidado em produção)
  await prisma.equipeDiaria.deleteMany();
  await prisma.itemBoletim.deleteMany();
  await prisma.boletimDiario.deleteMany();
  await prisma.descargaEquipamento.deleteMany();
  await prisma.descargaChapa.deleteMany();
  await prisma.descarga.deleteMany();
  await prisma.recebimento.deleteMany();
  await prisma.naoRecebimento.deleteMany();
  await prisma.itemCarga.deleteMany();
  await prisma.cargaDestino.deleteMany();
  await prisma.carga.deleteMany();
  await prisma.validacao.deleteMany();
  await prisma.agendamento.deleteMany();
  await prisma.notaFiscal.deleteMany();
  await prisma.equipamento.deleteMany();
  await prisma.chapa.deleteMany();
  await prisma.armazem.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.fornecedor.deleteMany();

  // 1. Armazéns
  console.log('Criando Armazéns...');
  const armazem1 = await prisma.armazem.create({
    data: {
      nome_armazem: 'Armazém Central',
      codigo_deposito: 'DEP-001',
      grupo: 'Silos',
      ativo: true,
    },
  });
  
  const armazem2 = await prisma.armazem.create({
    data: {
      nome_armazem: 'Armazém Sul',
      codigo_deposito: 'DEP-002',
      grupo: 'Sacaria',
      ativo: true,
    },
  });

  // 2. Fornecedores
  console.log('Criando Fornecedores...');
  const fornecedor1 = await prisma.fornecedor.create({
    data: {
      codigo_fornecedor_cocapec: 'FORN-100',
      nome_fornecedor: 'AgroFertilizantes S.A.',
      cnpj: '11.111.111/0001-11',
      contato: 'João Silva',
      ativo: true,
    },
  });

  const fornecedor2 = await prisma.fornecedor.create({
    data: {
      codigo_fornecedor_cocapec: 'FORN-101',
      nome_fornecedor: 'Sementes Brasil Ltda',
      cnpj: '22.222.222/0001-22',
      contato: 'Maria Souza',
      ativo: true,
    },
  });

  const fornecedor3 = await prisma.fornecedor.create({
    data: {
      codigo_fornecedor_cocapec: 'FORN-102',
      nome_fornecedor: 'Defensivos Paulista',
      cnpj: '33.333.333/0001-33',
      contato: 'Carlos Mendes',
      ativo: true,
    },
  });

  // 3. Usuários
  console.log('Criando Usuários...');
  const admin = await prisma.usuario.create({
    data: {
      nome: 'Administrador',
      matricula: 'ADM001',
      email: 'admin@cocapec.com.br',
      senha_hash: '$2b$10$xyz', // mock
      ativo: true,
      role: 'ADMIN',
    },
  });

  const analista = await prisma.usuario.create({
    data: {
      nome: 'Analista de Recepção',
      matricula: 'REC001',
      email: 'recepcao@cocapec.com.br',
      senha_hash: '$2b$10$xyz', // mock
      ativo: true,
      role: 'ANALISTA',
    },
  });

  // 4. Chapas e Equipamentos
  console.log('Criando Chapas e Equipamentos...');
  const chapa1 = await prisma.chapa.create({ data: { matricula_chapa: 'CH-001', nome: 'José Antônio', ativo: true } });
  const chapa2 = await prisma.chapa.create({ data: { matricula_chapa: 'CH-002', nome: 'Antônio Silva', ativo: true } });
  const chapa3 = await prisma.chapa.create({ data: { matricula_chapa: 'CH-003', nome: 'Roberto Souza', ativo: true } });
  const chapa4 = await prisma.chapa.create({ data: { matricula_chapa: 'CH-004', nome: 'Lucas Oliveira', ativo: true } });
  const chapa5 = await prisma.chapa.create({ data: { matricula_chapa: 'CH-005', nome: 'Felipe Santos', ativo: true } });

  const empilhadeira = await prisma.equipamento.create({ data: { nome: 'Empilhadeira', armazem_base: 'Armazém Central', quantidade_disponivel: 5, ativo: true } });
  const paleteira = await prisma.equipamento.create({ data: { nome: 'Paleteira Manual', armazem_base: 'Armazém Sul', quantidade_disponivel: 10, ativo: true } });

  // 5. Agendamentos e Recebimentos
  console.log('Criando Agendamentos, Cargas e Recebimentos...');
  const hoje = new Date();
  
  // Agendamento 1: Concluído com Sucesso
  const ag1 = await prisma.agendamento.create({
    data: {
      id_fornecedor: fornecedor1.id_fornecedor,
      numero_pedido_compra: 'PED-1000',
      data_agendada: hoje,
      horario_agendado: '08:00',
      tipo_acondicionamento: 'Paletizado',
      status_agendamento: 'CONCLUIDO',
      qtd_chapas_prevista: 2,
      regra_chapas_aplicada: 'Regra Padrão (2 Chapas)',
      cargas: {
        create: {
          peso_total: 12000,
          tipo_acondicionamento: 'Paletizado',
          destinos: { create: { id_armazem: armazem1.id_armazem } },
          itens: {
            create: { codigo_item_cocapec: 'FERT-01', descricao_item: 'Fertilizante NPK', quantidade: 240 }
          }
        }
      },
      recebimentos: {
        create: {
          hora_chegada: new Date(hoje.setHours(7, 50, 0, 0)),
          hora_entrada: new Date(hoje.setHours(8, 10, 0, 0)),
          hora_saida: new Date(hoje.setHours(9, 30, 0, 0)),
          status_recebimento: 'CONCLUIDO',
          descargas: {
            create: {
              id_armazem: armazem1.id_armazem,
              quantidade_movimentada: 12000,
              qtd_chapas_utilizados: 2,
              chapas: {
                create: [
                  { matricula_chapa: chapa1.matricula_chapa },
                  { matricula_chapa: chapa2.matricula_chapa }
                ]
              },
              equipamentos: {
                create: [{ id_tipo_equipamento: empilhadeira.id_tipo_equipamento, quantidade_utilizada: 1 }]
              }
            }
          }
        }
      }
    }
  });

  // Agendamento 2: Em processamento / Gargalo de Espera
  const ag2 = await prisma.agendamento.create({
    data: {
      id_fornecedor: fornecedor2.id_fornecedor,
      numero_pedido_compra: 'PED-1001',
      data_agendada: hoje,
      horario_agendado: '10:00',
      tipo_acondicionamento: 'Sacaria',
      status_agendamento: 'CONCLUIDO',
      qtd_chapas_prevista: 4,
      cargas: {
        create: {
          peso_total: 25000,
          tipo_acondicionamento: 'Sacaria',
          destinos: { create: { id_armazem: armazem2.id_armazem } },
        }
      },
      recebimentos: {
        create: {
          hora_chegada: new Date(hoje.setHours(9, 30, 0, 0)), // Chegou cedo
          hora_entrada: new Date(hoje.setHours(12, 0, 0, 0)), // Entrou tarde (Espera longa)
          hora_saida: new Date(hoje.setHours(16, 0, 0, 0)),
          status_recebimento: 'CONCLUIDO',
          descargas: {
            create: {
              id_armazem: armazem2.id_armazem,
              quantidade_movimentada: 25000,
              qtd_chapas_utilizados: 4,
            }
          }
        }
      }
    }
  });

  // Agendamento 3: Não Recebido (Atraso)
  const ag3 = await prisma.agendamento.create({
    data: {
      id_fornecedor: fornecedor3.id_fornecedor,
      numero_pedido_compra: 'PED-1002',
      data_agendada: hoje,
      horario_agendado: '14:00',
      tipo_acondicionamento: 'Granel',
      status_agendamento: 'NAO_RECEBIDO',
      qtd_chapas_prevista: 0,
      nao_recebimentos: {
        create: {
          motivo_padronizado: 'NO SHOW',
          observacao: 'Caminhão não compareceu até o fechamento da balança'
        }
      }
    }
  });

  // 6. Boletim Diário
  console.log('Criando Boletim Diário...');
  await prisma.boletimDiario.create({
    data: {
      id_armazem: armazem1.id_armazem,
      data: hoje,
      responsavel_id: analista.id_usuario,
      diarias_equivalentes_total: 2.0, // Dois chapas o dia todo
      valor_produzido_total: 150.00,
      complemento_diaria_pago: 30.34, // Para atingir os 180,34 (2 * 90,17) - Sobra
      itens: {
        create: {
          tipo_servico: 'SACARIA_FARDO_50',
          qtd_descarga: 500,
          quantidade: 500,
          preco_unitario: 0.30,
          valor_producao: 150.00
        }
      },
      equipes: {
        create: [
          { matricula_chapa: chapa1.matricula_chapa, tipo_jornada: 'COMPLETA' },
          { matricula_chapa: chapa2.matricula_chapa, tipo_jornada: 'COMPLETA' }
        ]
      }
    }
  });

  await prisma.boletimDiario.create({
    data: {
      id_armazem: armazem2.id_armazem,
      data: hoje,
      responsavel_id: analista.id_usuario,
      diarias_equivalentes_total: 4.0, 
      valor_produzido_total: 450.00, // Passou da garantia de 360,68
      complemento_diaria_pago: 0, // Sem complemento, a equipe se pagou
      itens: {
        create: {
          tipo_servico: 'SACARIA_FARDO_500',
          qtd_descarga: 50,
          quantidade: 50,
          preco_unitario: 9.00,
          valor_producao: 450.00
        }
      },
      equipes: {
        create: [
          { matricula_chapa: chapa2.matricula_chapa, tipo_jornada: 'COMPLETA' },
          { matricula_chapa: chapa3.matricula_chapa, tipo_jornada: 'COMPLETA' },
          { matricula_chapa: chapa4.matricula_chapa, tipo_jornada: 'COMPLETA' },
          { matricula_chapa: chapa5.matricula_chapa, tipo_jornada: 'COMPLETA' }
        ]
      }
    }
  });

  // --- NOVOS DADOS: Agosto (Falta) e Setembro (Sobra) ---
  console.log('Criando dados para Agosto (Falta) e Setembro (Sobra)...');
  const agosto = new Date('2026-08-15T00:00:00-03:00');
  const setembro = new Date('2026-09-15T00:00:00-03:00');

  // Agosto: Falta (Tempo de espera de 4 horas)
  const agAgosto = await prisma.agendamento.create({
    data: {
      id_fornecedor: fornecedor1.id_fornecedor,
      numero_pedido_compra: 'PED-AGO',
      data_agendada: agosto,
      horario_agendado: '08:00',
      tipo_acondicionamento: 'Sacaria',
      status_agendamento: 'CONCLUIDO',
      qtd_chapas_prevista: 4,
      cargas: {
        create: {
          peso_total: 30000,
          tipo_acondicionamento: 'Sacaria',
          destinos: { create: { id_armazem: armazem1.id_armazem } }
        }
      },
      recebimentos: {
        create: {
          hora_chegada: new Date('2026-08-15T08:00:00-03:00'),
          hora_entrada: new Date('2026-08-15T12:00:00-03:00'), // 4 horas de espera -> Falta de chapa
          hora_saida: new Date('2026-08-15T16:00:00-03:00'),
          status_recebimento: 'CONCLUIDO',
          descargas: {
            create: {
              id_armazem: armazem1.id_armazem,
              quantidade_movimentada: 30000,
              qtd_chapas_utilizados: 4
            }
          }
        }
      }
    }
  });

  await prisma.boletimDiario.create({
    data: {
      id_armazem: armazem1.id_armazem,
      data: agosto,
      responsavel_id: analista.id_usuario,
      diarias_equivalentes_total: 4.0,
      valor_produzido_total: 600.00, // Equipe se pagou, mas houve gargalo
      complemento_diaria_pago: 0,
      itens: {
        create: {
          tipo_servico: 'SACARIA_FARDO_50',
          qtd_descarga: 1000,
          quantidade: 1000,
          preco_unitario: 0.60,
          valor_producao: 600.00
        }
      },
      equipes: {
        create: [
          { matricula_chapa: chapa1.matricula_chapa, tipo_jornada: 'COMPLETA' },
          { matricula_chapa: chapa2.matricula_chapa, tipo_jornada: 'COMPLETA' },
          { matricula_chapa: chapa3.matricula_chapa, tipo_jornada: 'COMPLETA' },
          { matricula_chapa: chapa4.matricula_chapa, tipo_jornada: 'COMPLETA' }
        ]
      }
    }
  });

  // Setembro: Sobra (Pouca produção, complemento alto)
  const agSetembro = await prisma.agendamento.create({
    data: {
      id_fornecedor: fornecedor2.id_fornecedor,
      numero_pedido_compra: 'PED-SET',
      data_agendada: setembro,
      horario_agendado: '10:00',
      tipo_acondicionamento: 'Paletizado',
      status_agendamento: 'CONCLUIDO',
      qtd_chapas_prevista: 2,
      cargas: {
        create: {
          peso_total: 5000,
          tipo_acondicionamento: 'Paletizado',
          destinos: { create: { id_armazem: armazem2.id_armazem } }
        }
      },
      recebimentos: {
        create: {
          hora_chegada: new Date('2026-09-15T09:30:00-03:00'),
          hora_entrada: new Date('2026-09-15T10:00:00-03:00'), // Entrou normal, sem espera
          hora_saida: new Date('2026-09-15T11:00:00-03:00'),
          status_recebimento: 'CONCLUIDO',
          descargas: {
            create: {
              id_armazem: armazem2.id_armazem,
              quantidade_movimentada: 5000,
              qtd_chapas_utilizados: 2
            }
          }
        }
      }
    }
  });

  await prisma.boletimDiario.create({
    data: {
      id_armazem: armazem2.id_armazem,
      data: setembro,
      responsavel_id: analista.id_usuario,
      diarias_equivalentes_total: 2.0, // 2 chapas (2 * 90,17 = 180,34)
      valor_produzido_total: 50.00, // Produção muito baixa -> Ociosidade / Sobra
      complemento_diaria_pago: 130.34, // Paga complemento -> Gera sobra
      itens: {
        create: {
          tipo_servico: 'PALETIZADO',
          qtd_descarga: 5000,
          quantidade: 5000,
          preco_unitario: 0.01,
          valor_producao: 50.00
        }
      },
      equipes: {
        create: [
          { matricula_chapa: chapa1.matricula_chapa, tipo_jornada: 'COMPLETA' },
          { matricula_chapa: chapa5.matricula_chapa, tipo_jornada: 'COMPLETA' }
        ]
      }
    }
  });

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

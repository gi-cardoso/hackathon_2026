import { PRECOS_ITENS, TipoItemBoletim } from "./precos";
import { TipoJornada } from "./calculos";

interface ItemProducao {
  tipoItem: TipoItemBoletim;
  descarga: number;
  remocao: number;
  transferencia: number;
}

interface MembroEquipe {
  matricula: string;
  id_chapeiro?: string;
  jornada: TipoJornada;
}

interface DadosBoletim {
  data: string;
  responsavelId?: number;
  producao: ItemProducao[];
  equipe: MembroEquipe[];
}

export function validarBoletim(dados: DadosBoletim) {
  if (!Array.isArray(dados.equipe)) {
    throw new Error(
      "O boletim precisa possuir pelo menos um chapa."
    );
  }

  dados.equipe = dados.equipe.map((membro) => ({
    ...membro,
    matricula: membro.matricula || membro.id_chapeiro || "",
  }));

  if (!dados.data) {
    throw new Error("A data do boletim é obrigatória.");
  }

  const dataConvertida = new Date(dados.data);

  if (Number.isNaN(dataConvertida.getTime())) {
    throw new Error("A data informada é inválida.");
  }

  if (!Array.isArray(dados.producao) || dados.producao.length === 0) {
    throw new Error(
      "O boletim precisa possuir pelo menos um item de produção."
    );
  }

  if (!Array.isArray(dados.equipe) || dados.equipe.length === 0) {
    throw new Error(
      "O boletim precisa possuir pelo menos um chapa."
    );
  }

  if (dados.equipe.length > 20) {
    throw new Error(
      "O boletim não pode possuir mais de 20 chapas."
    );
  }

  for (const item of dados.producao) {
    if (!(item.tipoItem in PRECOS_ITENS)) {
      throw new Error(
        `Tipo de serviço inválido: ${item.tipoItem}.`
      );
    }

    const quantidades = [
      item.descarga,
      item.remocao,
      item.transferencia,
    ];

    for (const quantidade of quantidades) {
      if (
        typeof quantidade !== "number" ||
        !Number.isFinite(quantidade) ||
        quantidade < 0
      ) {
        throw new Error(
          `As quantidades do item ${item.tipoItem} devem ser números maiores ou iguais a zero.`
        );
      }
    }

    if (
      item.descarga === 0 &&
      item.remocao === 0 &&
      item.transferencia === 0
    ) {
      throw new Error(
        `O item ${item.tipoItem} precisa possuir alguma movimentação.`
      );
    }
  }

  const matriculas = new Set<string>();

  for (const membro of dados.equipe) {
    if (
      !membro.matricula ||
      typeof membro.matricula !== "string"
    ) {
      throw new Error(
        "A matrícula do chapa é obrigatória."
      );
    }

    if (
      membro.jornada !== "COMPLETA" &&
      membro.jornada !== "MEIA"
    ) {
      throw new Error(
        `Jornada inválida para o chapa ${membro.matricula}.`
      );
    }

    if (matriculas.has(membro.matricula)) {
      throw new Error(
        `O chapa ${membro.matricula} foi informado mais de uma vez.`
      );
    }

    matriculas.add(membro.matricula);
  }

  if (
    dados.responsavelId !== undefined &&
    (!Number.isInteger(dados.responsavelId) ||
      dados.responsavelId <= 0)
  ) {
    throw new Error(
      "O responsável informado é inválido."
    );
  }

  return {
    ...dados,
    dataConvertida,
  };
}
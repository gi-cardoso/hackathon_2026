import {
  PRECOS_ITENS,
  TipoItemBoletim,
  VALOR_DIARIA_COMPLETA,
} from "./precos";

export type TipoJornada = "COMPLETA" | "MEIA";

function arredondar4(valor: number) {
  return Math.round((valor + Number.EPSILON) * 10000) / 10000;
}

export function calcularItemBoletim(
  tipoItem: TipoItemBoletim,
  descarga: number,
  remocao: number,
  transferencia: number
) {
  const precoUnitario = PRECOS_ITENS[tipoItem];

  const quantidadeTotal =
    descarga + remocao + transferencia;

  const valorProducao = arredondar4(
    quantidadeTotal * precoUnitario
  );

  return {
    tipoItem,
    descarga,
    remocao,
    transferencia,
    quantidadeTotal,
    precoUnitario,
    valorProducao,
  };
}

export function calcularDiariasEquivalentes(
  jornadas: TipoJornada[]
) {
  return jornadas.reduce((total, jornada) => {
    if (jornada === "COMPLETA") {
      return total + 1;
    }

    return total + 0.5;
  }, 0);
}

export function calcularTotalProducao(
  valores: number[]
) {
  return arredondar4(
    valores.reduce((total, valor) => total + valor, 0)
  );
}

export function calcularBoletim(
  producaoTotal: number,
  diariasEquivalentes: number
) {
  if (diariasEquivalentes <= 0) {
    throw new Error(
      "O boletim precisa ter pelo menos uma diária equivalente."
    );
  }

  const valorPorDiaria =
    producaoTotal / diariasEquivalentes;

  const pisoTotal =
    VALOR_DIARIA_COMPLETA * diariasEquivalentes;

  let complemento = 0;
  let totalPagar = producaoTotal;

  if (valorPorDiaria < VALOR_DIARIA_COMPLETA) {
    complemento = pisoTotal - producaoTotal;
    totalPagar = pisoTotal;
  }

  return {
    producaoTotal: arredondar4(producaoTotal),
    diariasEquivalentes,
    valorPorDiaria: arredondar4(valorPorDiaria),
    complemento: arredondar4(complemento),
    totalPagar: arredondar4(totalPagar),
  };
}
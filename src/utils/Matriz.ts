/**
 * Utilidades para cálculo de matrices modulares
 */

/**
 * Calcula el MCD de dos números usando el algoritmo de Euclides
 */
export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

/**
 * Verifica si dos números son coprimos (gcd = 1)
 */
export function sonCoprimos(a: number, b: number): boolean {
  return gcd(a, b) === 1;
}

/**
 * Calcula el inverso modular de a mod n usando el algoritmo extendido de Euclides
 * Retorna el inverso modular tal que (a * inverso) % n = 1
 */
export function inversoModular(a: number, n: number): number {
  let m0 = n;
  let t: number;
  let q: number;
  let x0 = 1;
  let x1 = 0;

  a = ((a % n) + n) % n;

  if (a === 0) {
    throw new Error("No existe inverso modular para 0");
  }

  if (n === 1) {
    return 0;
  }

  while (n > 0) {
    q = Math.floor(a / n);
    t = n;
    n = a % n;
    a = t;

    t = x0 - q * x1;
    x0 = x1;
    x1 = t;
  }

  if (x0 < 0) {
    x0 += m0;
  }

  return x0;
}

/**
 * Ajusta un número para que esteja en el rango [0, mod-1]
 */
export function aplicarModulo(valor: number, mod: number): number {
  const resultado = ((valor % mod) + mod) % mod;
  return resultado;
}

/**
 * Calcula el determinante de una matriz 2x2
 */
export function determinante2x2(matriz: number[][]): number {
  return matriz[0][0] * matriz[1][1] - matriz[0][1] * matriz[1][0];
}

/**
 * Calcula el determinante de una matriz 3x3 usando la regla de Sarrus
 */
export function determinante3x3(matriz: number[][]): number {
  const a = matriz;
  return (
    a[0][0] * a[1][1] * a[2][2] +
    a[0][1] * a[1][2] * a[2][0] +
    a[0][2] * a[1][0] * a[2][1] -
    a[0][2] * a[1][1] * a[2][0] -
    a[0][0] * a[1][2] * a[2][1] -
    a[0][1] * a[1][0] * a[2][2]
  );
}

/**
 * Calcula el determinante de una matriz 2x2 o 3x3 aplicando módulo al resultado
 */
export function determinanteModular(matriz: number[][], mod: number): number {
  const tamano = matriz.length;

  if (tamano === 2) {
    return aplicarModulo(determinante2x2(matriz), mod);
  }

  if (tamano === 3) {
    return aplicarModulo(determinante3x3(matriz), mod);
  }

  throw new Error(
    "Solo se admiten matrices 2x2 o 3x3 para determinante modular",
  );
}

/**
 * Calcula la matriz cofactor para matrices 2x2
 */
export function matrizCofactor2x2(matriz: number[][]): number[][] {
  return [
    [matriz[1][1], -matriz[1][0]],
    [-matriz[0][1], matriz[0][0]],
  ];
}

/**
 * Calcula la matriz cofactor para matrices 3x3
 */
export function matrizCofactor3x3(matriz: number[][]): number[][] {
  const resultado: number[][] = [];

  for (let i = 0; i < 3; i++) {
    resultado[i] = [];
    for (let j = 0; j < 3; j++) {
      // Crear submatriz eliminando fila i y columna j
      const submatriz: number[][] = [];
      for (let row = 0; row < 3; row++) {
        if (row !== i) {
          const nuevaFila: number[] = [];
          for (let col = 0; col < 3; col++) {
            if (col !== j) {
              nuevaFila.push(matriz[row][col]);
            }
          }
          submatriz.push(nuevaFila);
        }
      }
      // Calcular cofactor con signo
      const signs = [
        [+1, -1, +1],
        [-1, +1, -1],
        [+1, -1, +1],
      ];
      const cofactor = signs[i][j] * determinante2x2(submatriz);
      resultado[i][j] = cofactor;
    }
  }

  return resultado;
}

/**
 * Calcula la transpuesta de una matriz
 */
export function transponerMatriz(matriz: number[][]): number[][] {
  const filas = matriz.length;
  const columnas = matriz[0].length;
  const resultado: number[][] = [];

  for (let j = 0; j < columnas; j++) {
    resultado[j] = [];
    for (let i = 0; i < filas; i++) {
      resultado[j][i] = matriz[i][j];
    }
  }

  return resultado;
}

/**
 * Calcula la matriz adjunta (transpuesta de la matriz de cofactores)
 */
export function matrizAdjunta(matriz: number[][]): number[][] {
  const cofactores =
    matriz.length === 2 ? matrizCofactor2x2(matriz) : matrizCofactor3x3(matriz);
  return transponerMatriz(cofactores);
}

/**
 * Suma dos matrices y aplica módulo al resultado
 */
export function sumarMatrices(
  a: number[][],
  b: number[][],
  mod?: number,
): number[][] {
  const filas = a.length;
  const cols = a[0].length;
  const resultado: number[][] = [];

  for (let i = 0; i < filas; i++) {
    resultado[i] = [];
    for (let j = 0; j < cols; j++) {
      const suma = a[i][j] + b[i][j];
      resultado[i][j] = mod !== undefined ? aplicarModulo(suma, mod) : suma;
    }
  }

  return resultado;
}

/**
 * Multiplica dos matrices
 * @param a - Primera matriz
 * @param b - Segunda matriz
 * @param mod - Módulo opcional. Si se proporciona, aplica módulo a cada resultado
 */
export function multiplicarMatrices(
  a: number[][],
  b: number[][],
  mod?: number,
): number[][] {
  if (!a || !b || a.length === 0 || b.length === 0) return [];
  if (!a[0] || !b[0] || a[0].length === 0 || b[0].length === 0) return [];

  const filasA = a.length;
  const colsA = a[0].length;
  const colsB = b[0].length;
  const resultado: number[][] = [];

  for (let i = 0; i < filasA; i++) {
    resultado[i] = [];
    if (!a[i]) {
      resultado[i] = new Array(colsB).fill(0);
      continue;
    }
    for (let j = 0; j < colsB; j++) {
      let suma = 0;
      for (let k = 0; k < colsA; k++) {
        const aVal = a[i]?.[k] ?? 0;
        const bVal = b[k]?.[j] ?? 0;
        suma += aVal * bVal;
      }
      resultado[i][j] = mod !== undefined ? aplicarModulo(suma, mod) : suma;
    }
  }

  return resultado;
}

/**
 * Multiplica dos matrices aplicando módulo (alias para uso explícito)
 */
export function multiplicarMatricesMod(
  a: number[][],
  b: number[][],
  mod: number,
): number[][] {
  return multiplicarMatrices(a, b, mod);
}

/**
 * Multiplica una matriz por un escalar
 */
export function multiplicarPorEscalar(
  matriz: number[][],
  escalar: number,
): number[][] {
  return matriz.map((fila) => fila.map((valor) => valor * escalar));
}

/**
 * Aplica módulo a cada elemento de una matriz
 */
export function aplicarModuloMatriz(
  matriz: number[][],
  mod: number,
): number[][] {
  return matriz.map((fila) => fila.map((valor) => aplicarModulo(valor, mod)));
}

/**
 * Crea una matriz identidad del tamaño especificado
 */
export function matrizIdentidad(tamano: number): number[][] {
  const identidad: number[][] = [];
  for (let i = 0; i < tamano; i++) {
    identidad[i] = [];
    for (let j = 0; j < tamano; j++) {
      identidad[i][j] = i === j ? 1 : 0;
    }
  }
  return identidad;
}

/**
 * Verifica si dos matrices son iguales
 */
export function sonMatricesIguales(
  a: number[][],
  b: number[][],
  mod: number,
): boolean {
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a[0].length; j++) {
      if (aplicarModulo(a[i][j], mod) !== aplicarModulo(b[i][j], mod)) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Estructura para el resultado del cálculo de inversa modular
 */
export interface ResultadoInversaModular {
  exitosa: boolean;
  error?: string;
  matrizOriginal: number[][];
  determinante: number;
  n: number;
  coprimos: boolean;
  factorEscala: number;
  invertible: boolean;
  matrizInversa: number[][];
  matrizVerificacion: number[][];
  esIdentidad: boolean;
  pasos: string[];
}

/**
 * Calcula la inversa modular de una matriz 2x2 o 3x3
 */
export function calcularInversaModular(
  matriz: number[][],
  n: number,
): ResultadoInversaModular {
  const pasos: string[] = [];
  const tamano = matriz.length;

  // Validar que sea matriz 2x2 o 3x3
  if (tamano !== 2 && tamano !== 3) {
    return {
      exitosa: false,
      error: "Solo se admiten matrices 2x2 o 3x3",
      matrizOriginal: matriz,
      determinante: 0,
      n,
      coprimos: false,
      factorEscala: 0,
      invertible: false,
      matrizInversa: [],
      matrizVerificacion: [],
      esIdentidad: false,
      pasos: [],
    };
  }

  // Validar que sea matriz cuadrada
  for (let i = 0; i < tamano; i++) {
    if (matriz[i].length !== tamano) {
      return {
        exitosa: false,
        error: "La matriz debe ser cuadrada",
        matrizOriginal: matriz,
        determinante: 0,
        n,
        coprimos: false,
        factorEscala: 0,
        invertible: false,
        matrizInversa: [],
        matrizVerificacion: [],
        esIdentidad: false,
        pasos: [],
      };
    }
  }

  pasos.push(`Matriz original (${tamano}x${tamano}):`);
  pasos.push(JSON.stringify(matriz));
  pasos.push("");

  // Calcular determinante
  let determinante: number;
  if (tamano === 2) {
    determinante = determinante2x2(matriz);
  } else {
    determinante = determinante3x3(matriz);
  }
  pasos.push(`Determinante: ${determinante}`);
  pasos.push(`n: ${n}`);
  pasos.push("");

  // Verificar coprimos
  const coprimos = sonCoprimos(determinante, n);
  pasos.push(`gcd(${determinante}, ${n}) = ${gcd(determinante, n)}`);
  pasos.push(`¿Son coprimos? ${coprimos ? "Sí" : "No"}`);
  pasos.push("");

  if (!coprimos) {
    return {
      exitosa: false,
      error: `El determinante (${determinante}) y n (${n}) no son coprimos. No existe inversa modular.`,
      matrizOriginal: matriz,
      determinante,
      n,
      coprimos: false,
      factorEscala: 0,
      invertible: false,
      matrizInversa: [],
      matrizVerificacion: [],
      esIdentidad: false,
      pasos,
    };
  }

  // Calcular inverso modular del determinante
  const inversoDet = inversoModular(determinante, n);
  pasos.push(`Inverso modular del determinante: ${inversoDet}`);
  pasos.push(
    `(${determinante} * ${inversoDet}) % ${n} = ${aplicarModulo(determinante * inversoDet, n)}`,
  );
  pasos.push("");

  // Calcular matriz adjunta
  const adjunta = matrizAdjunta(matriz);
  pasos.push("Matriz adjunta (transpuesta de cofactores):");
  pasos.push(JSON.stringify(adjunta));
  pasos.push("");

  // Multiplicar adjunta por inverso del determinante (factor de escala)
  const factorEscala = inversoDet;
  let matrizInversaPreModulo = multiplicarPorEscalar(adjunta, factorEscala);
  pasos.push(`Factor de escala (inverso del determinante): ${factorEscala}`);
  pasos.push("Matriz escalda (adjunta × factor):");
  pasos.push(JSON.stringify(matrizInversaPreModulo));
  pasos.push("");

  // Aplicar módulo a cada componente
  let matrizInversa = aplicarModuloMatriz(matrizInversaPreModulo, n);
  pasos.push("Aplicando módulo a cada componente:");
  pasos.push(JSON.stringify(matrizInversa));
  pasos.push("");

  // Verificación: multiplicar matriz original por inversa
  const verificacion = multiplicarMatrices(matriz, matrizInversa);
  const matrizVerificacion = aplicarModuloMatriz(verificacion, n);
  pasos.push("Verificación (A × A⁻¹):");
  pasos.push(JSON.stringify(verificacion));
  pasos.push("Con módulo:");
  pasos.push(JSON.stringify(matrizVerificacion));

  // Verificar si es identidad
  const identidad = matrizIdentidad(tamano);
  const esIdentidad = sonMatricesIguales(matrizVerificacion, identidad, n);
  pasos.push("");
  pasos.push(`¿Es matriz identidad? ${esIdentidad ? "Sí ✓" : "No ✗"}`);

  return {
    exitosa: esIdentidad,
    matrizOriginal: matriz,
    determinante,
    n,
    coprimos: true,
    factorEscala,
    invertible: true,
    matrizInversa,
    matrizVerificacion,
    esIdentidad,
    pasos,
  };
}

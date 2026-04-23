import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";
import { Card } from "../src/components/Card";
import { DimensionSelectorGroup } from "../src/components/DimensionSelector";
import { MatrixDisplay } from "../src/components/MatrixDisplay";
import { MatrixInput } from "../src/components/MatrixInput";
import { OperationSelector } from "../src/components/OperationSelector";
import {
  calcularInversaModular,
  determinanteModular,
  multiplicarMatricesMod,
  sumarMatrices,
} from "../src/utils/Matriz";

type Dimension = 2 | 3;
type Operation = "inversa" | "suma" | "multiplicacion" | "determinante";

const colors = {
  light: {
    bg: "#ffffff",
    surface: "#fafafa",
    border: "#e4e4e7",
    text: "#18181b",
    textMuted: "#71717a",
    accent: "#5b76fe",
    success: "#00b473",
  },
  dark: {
    bg: "#09090b",
    surface: "#18181b",
    border: "#27272a",
    text: "#fafafa",
    textMuted: "#a1a1aa",
    accent: "#7c92fe",
    success: "#00b473",
  },
};

interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  type?: "error" | "warning" | "info";
  onClose: () => void;
  isDark: boolean;
  cols: typeof colors.light;
}

function AlertModal({
  visible,
  title,
  message,
  type = "error",
  onClose,
  isDark,
  cols,
}: AlertModalProps) {
  const typeColors = {
    error: { bg: "#fef2f2", border: "#ef4444", text: "#dc2626" },
    warning: { bg: "#fffbeb", border: "#f59e0b", text: "#d97706" },
    info: { bg: "#eff6ff", border: "#3b82f6", text: "#2563eb" },
  };

  const tc = typeColors[type];
  const darkTypeColors = {
    error: { bg: "#450a0a", border: "#ef4444", text: "#fca5a5" },
    warning: { bg: "#451a03", border: "#f59e0b", text: "#fcd34d" },
    info: { bg: "#172554", border: "#3b82f6", text: "#93c5fd" },
  };
  const darkTc = isDark ? darkTypeColors[type] : tc;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-black/50">
        <View
          className="mx-8 w-64 rounded-2xl border p-5"
          style={{
            backgroundColor: isDark ? "#18181b" : "#ffffff",
            borderColor: darkTc.border,
          }}
        >
          <View className="mb-4 flex-row items-center">
            <View
              className="mr-3 h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: darkTc.bg }}
            >
              <Ionicons
                name={
                  type === "error"
                    ? "close"
                    : type === "warning"
                      ? "warning"
                      : "information-circle"
                }
                size={22}
                color={darkTc.text}
              />
            </View>
            <Text
              className="text-xl font-semibold"
              style={{ color: isDark ? "#fafafa" : "#18181b" }}
            >
              {title}
            </Text>
          </View>

          <Text
            className="mb-6 text-base"
            style={{ color: isDark ? "#a1a1aa" : "#52525b" }}
          >
            {message}
          </Text>

          <TouchableOpacity
            onPress={onClose}
            className="w-full rounded-xl py-3"
            style={{ backgroundColor: cols.accent }}
          >
            <View className="flex-row items-center justify-center gap-2">
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color="#ffffff"
              />
              <Text className="text-center text-base font-semibold text-white">
                Aceptar
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function Index() {
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const isDark = colorScheme === "dark";
  const isWide = width >= 1024;
  const cols = isDark ? colors.dark : colors.light;

  const [dimension, setDimension] = useState<Dimension>(2);
  const [dimensionB, setDimensionB] = useState<Dimension>(2);
  const [operation, setOperation] = useState<Operation>("inversa");
  const [n, setN] = useState("");
  const [matriz, setMatriz] = useState<string[][]>([
    ["", "", "", ""],
    ["", "", "", ""],
  ]);
  const [matrizB, setMatrizB] = useState<string[][]>([
    ["", "", "", ""],
    ["", "", "", ""],
  ]);
  const [resultado, setResultado] = useState<{
    exitosa: boolean;
    matrizInversa?: number[][];
    matrizSuma?: number[][];
    matrizProducto?: number[][];
    matrizVerificacion?: number[][];
    factorEscala?: number;
    esIdentidad?: boolean;
    coprimos?: boolean;
    determinante?: number;
    determinanteSimple?: number;
    n?: number;
    matrizOriginal?: number[][];
    pasos?: string[];
  } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [alertModal, setAlertModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "error" | "warning" | "info";
  }>({ visible: false, title: "", message: "", type: "error" });
  const showSidePanel = isWide && !!resultado;
  const refsMatriz = useRef<Array<Array<TextInput | null>>>([]);
  const refsMatrizB = useRef<Array<Array<TextInput | null>>>([]);

  const parsearMatrizSerializada = (texto: string): number[][] | null => {
    const normalizado = texto.trim();
    if (!normalizado.startsWith("[[") || !normalizado.endsWith("]]")) {
      return null;
    }

    try {
      const parsed = JSON.parse(normalizado) as unknown;
      if (
        Array.isArray(parsed) &&
        parsed.every(
          (fila) =>
            Array.isArray(fila) &&
            fila.every((valor) => typeof valor === "number"),
        )
      ) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  };

  const datosProceso = useMemo(() => {
    if (!resultado || !resultado.pasos) {
      return {
        adjunta: null as number[][] | null,
        escalada: null as number[][] | null,
        verificacionSinModulo: null as number[][] | null,
        gcdTexto: "",
        inversoDet: null as number | null,
      };
    }

    const pasos = resultado.pasos;

    const buscarMatrizDespuesDe = (textoPaso: string): number[][] | null => {
      const idx = pasos.findIndex((p) => p.includes(textoPaso));
      if (idx === -1 || idx + 1 >= pasos.length) {
        return null;
      }
      return parsearMatrizSerializada(pasos[idx + 1]);
    };

    const gcdTexto =
      pasos.find((p) => p.startsWith("gcd(")) ||
      `gcd(${resultado.determinante}, ${resultado.n}) = ?`;

    const inversoPaso = pasos.find((p) =>
      p.startsWith("Inverso modular del determinante:"),
    );
    const inversoDet = inversoPaso
      ? Number.parseInt(inversoPaso.split(":")[1]?.trim() || "", 10)
      : null;

    return {
      adjunta: buscarMatrizDespuesDe("Matriz adjunta"),
      escalada: buscarMatrizDespuesDe("Matriz escalda"),
      verificacionSinModulo: buscarMatrizDespuesDe("Verificación (A × A⁻¹)"),
      gcdTexto,
      inversoDet: Number.isNaN(inversoDet) ? null : inversoDet,
    };
  }, [resultado]);

  const iniciarMatriz = (dim: Dimension) => {
    setDimension(dim);
    const matrizAInputs = crearMatrizVacia(dim);
    const matrizBInputs = crearMatrizVacia(dim);
    setMatriz(matrizAInputs);
    setMatrizB(matrizBInputs);
    setDimensionB(dim);
    refsMatriz.current = [];
    refsMatrizB.current = [];
    setResultado(null);
  };

  const crearMatrizVacia = (dim: Dimension): string[][] => {
    return Array.from({ length: dim }).map(() =>
      Array.from({ length: dim }).map(() => ""),
    );
  };

  const limpiarMatrizA = () => {
    setMatriz(crearMatrizVacia(dimension));
    refsMatriz.current = [];
    setResultado(null);
    setModalVisible(false);
  };

  const limpiarMatrizB = () => {
    setMatrizB(crearMatrizVacia(dimensionB));
    refsMatrizB.current = [];
    setResultado(null);
    setModalVisible(false);
  };

  const actualizarCelda = (fila: number, col: number, valor: string) => {
    setMatriz((prev) => {
      const nuevaMatriz = prev.map((filaArr) => [...filaArr]);
      nuevaMatriz[fila][col] = valor;
      return nuevaMatriz;
    });
  };

  const actualizarCeldaB = (fila: number, col: number, valor: string) => {
    setMatrizB((prev) => {
      if (!prev[fila]) return prev;
      const nuevaMatriz = prev.map((filaArr) => [...filaArr]);
      nuevaMatriz[fila][col] = valor;
      return nuevaMatriz;
    });
  };

  const obtenerMatrizNumerica = (): number[][] => {
    return matriz.map((fila) =>
      fila.map((valor) => (valor === "" ? 0 : parseInt(valor, 10))),
    );
  };

  const obtenerMatrizBNumerica = (): number[][] => {
    if (!matrizB || matrizB.length === 0) return [];
    return matrizB.map((fila) =>
      (fila || []).map((valor) =>
        valor === "" ? 0 : parseInt(valor, 10) || 0,
      ),
    );
  };

  const calcularInversa = () => {
    if (!n) {
      setAlertModal({
        visible: true,
        title: "Error",
        message: "Ingrese el valor de n",
        type: "error",
      });
      return;
    }

    const nVal = parseInt(n, 10);
    if (isNaN(nVal) || nVal <= 0) {
      setAlertModal({
        visible: true,
        title: "Error",
        message: "n debe ser un número positivo",
        type: "error",
      });
      return;
    }

    for (let i = 0; i < dimension; i++) {
      for (let j = 0; j < dimension; j++) {
        const celda = matriz[i]?.[j];
        if (celda === undefined || celda === "") {
          setAlertModal({
            visible: true,
            title: "Error",
            message: "Complete todas las celdas de la Matriz A",
            type: "error",
          });
          return;
        }
        const val = parseInt(celda, 10);
        if (isNaN(val)) {
          setAlertModal({
            visible: true,
            title: "Error",
            message: "Todos los valores deben ser números enteros",
            type: "error",
          });
          return;
        }
      }
    }

    const matrizNumerica = obtenerMatrizNumerica();
    const res = calcularInversaModular(matrizNumerica, nVal);
    setResultado({
      exitosa: res.exitosa,
      matrizInversa: res.matrizInversa,
      matrizVerificacion: res.matrizVerificacion,
      factorEscala: res.factorEscala,
      esIdentidad: res.esIdentidad,
      coprimos: res.coprimos,
      determinante: res.determinante,
      n: res.n,
      matrizOriginal: res.matrizOriginal,
      pasos: res.pasos,
    });

    if (!res.exitosa) {
      setAlertModal({
        visible: true,
        title: "No invertible",
        message: res.error || "No se pudo calcular la inversa",
        type: "warning",
      });
    }
  };

  const calcularOperacion = () => {
    if (!n) {
      setAlertModal({
        visible: true,
        title: "Error",
        message: "Ingrese el valor de n",
        type: "error",
      });
      return;
    }

    const nVal = parseInt(n, 10);
    if (isNaN(nVal) || nVal <= 0) {
      setAlertModal({
        visible: true,
        title: "Error",
        message: "n debe ser un número positivo",
        type: "error",
      });
      return;
    }

    const matrizA = obtenerMatrizNumerica();
    const matrizBNum = obtenerMatrizBNumerica();
    if (operation === "inversa") {
      calcularInversa();
      return;
    }

    const validarMatriz = (matriz: number[][], nombre: string) => {
      if (
        !matriz ||
        matriz.length === 0 ||
        !matriz[0] ||
        matriz[0].length === 0
      ) {
        setAlertModal({
          visible: true,
          title: "Error",
          message: `La ${nombre} está vacía o mal configurada`,
          type: "error",
        });
        return false;
      }
      return true;
    };

    if (!validarMatriz(matrizA, "Matriz A")) return;
    if (!validarMatriz(matrizBNum, "Matriz B")) return;

    if (operation === "suma") {
      if (dimension !== dimensionB) {
        setAlertModal({
          visible: true,
          title: "Error",
          message: "Para sumar, ambas matrices deben tener la misma dimensión",
          type: "error",
        });
        return;
      }
      const suma = sumarMatrices(matrizA, matrizBNum, nVal);
      setResultado({
        exitosa: true,
        matrizSuma: suma,
      });
    } else if (operation === "multiplicacion") {
      if (dimension !== dimensionB) {
        setAlertModal({
          visible: true,
          title: "Info",
          message: `Multiplicando matrices de ${dimension}×${dimension} × ${dimensionB}×${dimensionB}`,
          type: "info",
        });
      }
      const producto = multiplicarMatricesMod(matrizA, matrizBNum, nVal);
      setResultado({
        exitosa: true,
        matrizProducto: producto,
      });
    } else if (operation === "determinante") {
      if (matrizA.length === 0 || matrizA[0].length === 0) {
        setAlertModal({
          visible: true,
          title: "Error",
          message: "La Matriz A está vacía",
          type: "error",
        });
        return;
      }
      const detSimple =
        dimension === 2
          ? matrizA[0][0] * matrizA[1][1] - matrizA[0][1] * matrizA[1][0]
          : matrizA[0][0] * matrizA[1][1] * matrizA[2][2] +
            matrizA[0][1] * matrizA[1][2] * matrizA[2][0] +
            matrizA[0][2] * matrizA[1][0] * matrizA[2][1] -
            matrizA[0][2] * matrizA[1][1] * matrizA[2][0] -
            matrizA[0][0] * matrizA[1][2] * matrizA[2][1] -
            matrizA[0][1] * matrizA[1][0] * matrizA[2][2];
      const detMod = determinanteModular(matrizA, nVal);
      setResultado({
        exitosa: true,
        determinanteSimple: detSimple,
        determinante: detMod,
        n: nVal,
        matrizOriginal: matrizA,
      });
    }
  };

  const cambiarDimensionB = (dim: Dimension) => {
    setDimensionB(dim);
    setMatrizB(crearMatrizVacia(dim));
    refsMatrizB.current = [];
  };

  const renderizarProceso = () => {
    if (
      !resultado ||
      !resultado.matrizOriginal ||
      resultado.determinante === undefined ||
      resultado.determinante === null
    )
      return null;

    const matrizA = resultado.matrizOriginal;
    const renderizarMatriz = (matrizRender: number[][], titulo: string) => (
      <View className="my-3">
        <Text
          className="mb-2 text-base font-medium"
          style={{ color: cols.text }}
        >
          {titulo}
        </Text>
        <View className="flex flex-col">
          {matrizRender.map((fila, filaIdx) => (
            <View
              key={filaIdx}
              className="flex flex-row items-center justify-center"
            >
              <Text
                className="pr-2 text-2xl font-medium"
                style={{ color: cols.text }}
              >
                [
              </Text>
              {fila.map((valor, colIdx) => (
                <Text
                  key={colIdx}
                  className="min-w-12 text-center text-xl font-medium"
                  style={{ color: cols.accent }}
                >
                  {valor}
                </Text>
              ))}
              <Text
                className="pl-2 text-2xl font-medium"
                style={{ color: cols.text }}
              >
                ]
              </Text>
            </View>
          ))}
        </View>
      </View>
    );

    const detalleDeterminante =
      matrizA.length === 2
        ? `${matrizA[0][0]}×${matrizA[1][1]} - ${matrizA[0][1]}×${matrizA[1][0]} = ${resultado.determinante}`
        : `${matrizA[0][0]}×${matrizA[1][1]}×${matrizA[2][2]} + ${matrizA[0][1]}×${matrizA[1][2]}×${matrizA[2][0]} + ${matrizA[0][2]}×${matrizA[1][0]}×${matrizA[2][1]} - ${matrizA[0][2]}×${matrizA[1][1]}×${matrizA[2][0]} - ${matrizA[0][0]}×${matrizA[1][2]}×${matrizA[2][1]} - ${matrizA[0][1]}×${matrizA[1][0]}×${matrizA[2][2]} = ${resultado.determinante}`;

    return (
      <View>
        <View
          className="mb-5 rounded-xl border p-4"
          style={{ borderColor: cols.border, backgroundColor: cols.surface }}
        >
          <Text className="text-base font-bold" style={{ color: cols.accent }}>
            1. Matriz Original A
          </Text>
          <Text className="mt-2 text-sm" style={{ color: cols.textMuted }}>
            Esta es la matriz ingresada, sobre la cual se calcula la inversa
            modular.
          </Text>
          {renderizarMatriz(matrizA, "A =")}
        </View>

        <View
          className="mb-5 rounded-xl border p-4"
          style={{ borderColor: cols.border, backgroundColor: cols.surface }}
        >
          <Text className="text-base font-bold" style={{ color: cols.accent }}>
            2. Determinante de A
          </Text>
          <Text className="mt-2 text-sm" style={{ color: cols.text }}>
            det(A) = {resultado.determinante}
          </Text>
          <Text className="mt-1 text-sm" style={{ color: cols.textMuted }}>
            {detalleDeterminante}
          </Text>
        </View>

        <View
          className="mb-5 rounded-xl border p-4"
          style={{ borderColor: cols.border, backgroundColor: cols.surface }}
        >
          <Text className="text-base font-bold" style={{ color: cols.accent }}>
            3. Condición de Invertibilidad
          </Text>
          <Text className="mt-2 text-sm" style={{ color: cols.text }}>
            {datosProceso.gcdTexto}
          </Text>
          <Text className="mt-1 text-sm" style={{ color: cols.text }}>
            {resultado.coprimos
              ? "Como gcd(det(A), n) = 1, sí existe inversa modular."
              : "Como gcd(det(A), n) ≠ 1, la matriz no es invertible módulo n."}
          </Text>
        </View>

        {resultado.coprimos && (
          <View
            className="mb-5 rounded-xl border p-4"
            style={{ borderColor: cols.border, backgroundColor: cols.surface }}
          >
            <Text
              className="text-base font-bold"
              style={{ color: cols.accent }}
            >
              4. Inverso Modular del Determinante
            </Text>
            <Text className="mt-2 text-sm" style={{ color: cols.text }}>
              k = det(A)^-1 mod n ={" "}
              {datosProceso.inversoDet ?? resultado.factorEscala}
            </Text>
            <Text className="mt-1 text-sm" style={{ color: cols.textMuted }}>
              Este valor es el factor escalar que multiplica a la adjunta.
            </Text>
          </View>
        )}

        {resultado.coprimos && datosProceso.adjunta && (
          <View
            className="mb-5 rounded-xl border p-4"
            style={{ borderColor: cols.border, backgroundColor: cols.surface }}
          >
            <Text
              className="text-base font-bold"
              style={{ color: cols.accent }}
            >
              5. Matriz Adjunta Adj(A)
            </Text>
            <Text className="mt-2 text-sm" style={{ color: cols.textMuted }}>
              Adj(A) es la transpuesta de la matriz de cofactores.
            </Text>
            {renderizarMatriz(datosProceso.adjunta, "Adj(A) =")}
          </View>
        )}

        {resultado.coprimos && datosProceso.escalada && (
          <View
            className="mb-5 rounded-xl border p-4"
            style={{ borderColor: cols.border, backgroundColor: cols.surface }}
          >
            <Text
              className="text-base font-bold"
              style={{ color: cols.accent }}
            >
              6. Multiplicación por el Factor k
            </Text>
            <Text className="mt-2 text-sm" style={{ color: cols.text }}>
              A^-1 preliminar = Adj(A) × k
            </Text>
            {renderizarMatriz(datosProceso.escalada, "Adj(A) × k =")}
          </View>
        )}

        {resultado.coprimos && (
          <View
            className="mb-5 rounded-xl border p-4"
            style={{ borderColor: cols.border, backgroundColor: cols.surface }}
          >
            <Text
              className="text-base font-bold"
              style={{ color: cols.accent }}
            >
              7. Aplicar Módulo n = {resultado.n}
            </Text>
            <Text className="mt-2 text-sm" style={{ color: cols.textMuted }}>
              Se reduce cada componente al rango [0, n-1].
            </Text>
            {resultado.matrizInversa &&
              renderizarMatriz(resultado.matrizInversa, "A^-1 (mod n) =")}
          </View>
        )}

        {resultado.coprimos && (
          <View
            className="mb-5 rounded-xl border p-4"
            style={{ borderColor: cols.border, backgroundColor: cols.surface }}
          >
            <Text
              className="text-base font-bold"
              style={{ color: cols.accent }}
            >
              8. Verificación Final
            </Text>
            <Text className="mt-2 text-sm" style={{ color: cols.text }}>
              Se calcula A × A^-1 y luego se aplica módulo {resultado.n}.
            </Text>
            {datosProceso.verificacionSinModulo &&
              renderizarMatriz(
                datosProceso.verificacionSinModulo,
                "A × A^-1 (sin módulo) =",
              )}
            {resultado.matrizVerificacion &&
              renderizarMatriz(
                resultado.matrizVerificacion,
                `A × A^-1 (mod ${resultado.n}) =`,
              )}
            <View
              className="mt-2 rounded-lg p-3"
              style={{ backgroundColor: isDark ? "#27272a" : "#f4f4f5" }}
            >
              <Text
                className="text-center text-base font-bold"
                style={{
                  color: resultado.esIdentidad ? cols.success : "#ef4444",
                }}
              >
                {resultado.esIdentidad
                  ? "✓ Resultado correcto: se obtiene la identidad"
                  : "✗ Verificación fallida: no se obtuvo la identidad"}
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  const operationTitles = {
    inversa: "de Inversas",
    suma: "de Suma",
    multiplicacion: "de Multiplicación",
    determinante: "de Determinantes",
  };

  const buttonLabels = {
    inversa: "Calcular Inversa",
    suma: "Sumar Matrices",
    multiplicacion: "Multiplicar Matrices",
    determinante: "Calcular Determinante",
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className={`flex-grow px-6 py-8 ${isDark ? "bg-zinc-900" : "bg-miro-white"}`}
      >
        <View
          className={`mb-8 items-center ${showSidePanel ? "" : "mx-auto w-full max-w-2xl"}`}
        >
          <Text
            className={`text-4xl font-medium tracking-tight -translate-x-1 ${
              isDark ? "text-zinc-100" : "text-miro-black"
            }`}
          >
            Calculadora
          </Text>
          <Text
            className={`text-2xl font-medium tracking-tight -translate-x-1 ${
              isDark ? "text-zinc-100" : "text-miro-black"
            }`}
          >
            {operationTitles[operation]}
          </Text>
          <Text
            className={`mt-2 text-lg ${isDark ? "text-zinc-400" : "text-neutral-slate"}`}
          >
            Matrices Modulares
          </Text>
        </View>

        <View
          className={`mx-auto w-full ${showSidePanel ? "max-w-6xl flex-row items-start gap-6" : "max-w-2xl"}`}
        >
          <View className={showSidePanel ? "flex-1" : "w-full"}>
            <Card title="Operación" isDark={isDark}>
              <OperationSelector
                operation={operation}
                onChange={setOperation}
                isDark={isDark}
              />
            </Card>

            <Card title="Dimensión" isDark={isDark}>
              <DimensionSelectorGroup
                dimension={dimension}
                onChange={iniciarMatriz}
                isDark={isDark}
              />

              <Text
                className={`mt-5 mb-2 text-lg font-medium text-center ${
                  isDark ? "text-zinc-100" : "text-miro-black"
                }`}
              >
                Módulo (n)
              </Text>
              <TextInput
                className={`h-14 w-full rounded-lg border px-4 py-3 text-center text-2xl font-medium shadow-ring ${
                  isDark
                    ? "bg-zinc-700 border-zinc-600 text-zinc-100 placeholder-zinc-500"
                    : "bg-miro-white border-neutral-border text-miro-black placeholder-zinc-400"
                }`}
                keyboardType="numeric"
                value={n}
                onChangeText={setN}
                placeholder="Ingrese n"
                placeholderTextColor={isDark ? "#71717a" : "#a5a8b5"}
              />
            </Card>

            <Card title={`Matriz A ${dimension}×${dimension}`} isDark={isDark}>
              <MatrixInput
                matriz={matriz}
                dimension={dimension}
                refs={refsMatriz}
                onCellChange={actualizarCelda}
                isDark={isDark}
              />
              <TouchableOpacity
                onPress={limpiarMatrizA}
                className={`mt-4 flex-row items-center justify-center gap-2 rounded-xl border px-4 py-3 ${
                  isDark
                    ? "border-zinc-600 bg-zinc-900/40"
                    : "border-neutral-border bg-miro-white"
                }`}
              >
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color={isDark ? "#fafafa" : "#18181b"}
                />
                <Text
                  className={`text-sm font-semibold ${
                    isDark ? "text-zinc-100" : "text-miro-black"
                  }`}
                >
                  Borrar Matriz A
                </Text>
              </TouchableOpacity>
            </Card>

            {operation === "multiplicacion" && (
              <Card title={`Dimensión Matriz B`} isDark={isDark}>
                <DimensionSelectorGroup
                  dimension={dimensionB}
                  onChange={cambiarDimensionB}
                  isDark={isDark}
                />
              </Card>
            )}

            {operation === "multiplicacion" && (
              <Card
                title={`Matriz B ${dimensionB}×${dimensionB}`}
                isDark={isDark}
              >
                <MatrixInput
                  matriz={matrizB}
                  dimension={dimensionB}
                  refs={refsMatrizB}
                  onCellChange={actualizarCeldaB}
                  isDark={isDark}
                />
                <TouchableOpacity
                  onPress={limpiarMatrizB}
                  className={`mt-4 flex-row items-center justify-center gap-2 rounded-xl border px-4 py-3 ${
                    isDark
                      ? "border-zinc-600 bg-zinc-900/40"
                      : "border-neutral-border bg-miro-white"
                  }`}
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={isDark ? "#fafafa" : "#18181b"}
                  />
                  <Text
                    className={`text-sm font-semibold ${
                      isDark ? "text-zinc-100" : "text-miro-black"
                    }`}
                  >
                    Borrar Matriz B
                  </Text>
                </TouchableOpacity>
              </Card>
            )}

            {operation === "suma" && (
              <Card
                title={`Matriz B ${dimension}×${dimension}`}
                isDark={isDark}
              >
                <MatrixInput
                  matriz={matrizB}
                  dimension={dimension}
                  refs={refsMatrizB}
                  onCellChange={actualizarCeldaB}
                  isDark={isDark}
                />
              </Card>
            )}

            <TouchableOpacity
              onPress={calcularOperacion}
              className="mb-6 w-full rounded-2xl border border-blue-400/30 bg-primary-blue px-6 py-4 shadow-lg shadow-blue-500/20 active:opacity-90"
            >
              <View className="flex-row items-center justify-center gap-2">
                <Ionicons
                  name="play-circle-outline"
                  size={20}
                  color="#ffffff"
                />
                <Text className="text-center text-lg font-semibold tracking-wide text-miro-white">
                  {buttonLabels[operation]}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View className={showSidePanel ? "flex-1" : "w-full"}>
            {resultado && resultado.exitosa && operation === "inversa" && (
              <>
                {resultado.matrizInversa && (
                  <MatrixDisplay
                    matriz={resultado.matrizInversa}
                    titulo="Matriz Inversa"
                    subtitulo={`Factor: ${resultado.factorEscala}`}
                    isDark={isDark}
                  />
                )}

                {resultado.matrizVerificacion && (
                  <View
                    className={`mb-6 w-full rounded-xl border p-5 ${
                      isDark
                        ? "bg-zinc-800 border-accent-moss-dark"
                        : "bg-accent-moss/30 border-accent-moss"
                    }`}
                  >
                    <Text
                      className={`mb-4 text-lg font-medium text-center ${
                        isDark ? "text-zinc-100" : "text-miro-black"
                      }`}
                    >
                      Verificación
                    </Text>
                    <Text
                      className={`mb-3 text-center text-base ${
                        isDark ? "text-zinc-400" : "text-neutral-slate"
                      }`}
                    >
                      A × A⁻¹ (mod {n})
                    </Text>
                    {resultado.matrizVerificacion && (
                      <View className="flex flex-col">
                        {resultado.matrizVerificacion.map((fila, filaIdx) => (
                          <View
                            key={filaIdx}
                            className="mb-3 flex flex-row justify-center gap-2"
                          >
                            {fila.map((valor, colIdx) => (
                              <View
                                key={colIdx}
                                className={`h-12 w-12 shrink-0 items-center justify-center rounded-lg border ${
                                  isDark
                                    ? "bg-zinc-700 border-zinc-600"
                                    : "bg-miro-white border-neutral-border"
                                }`}
                              >
                                <Text
                                  className={`text-center text-base font-medium ${
                                    isDark ? "text-zinc-100" : "text-miro-black"
                                  }`}
                                >
                                  {valor}
                                </Text>
                              </View>
                            ))}
                          </View>
                        ))}
                      </View>
                    )}
                    <Text
                      className={`mt-3 text-center text-base font-medium ${
                        isDark ? "text-zinc-100" : "text-miro-black"
                      }`}
                    >
                      ✓ Identidad
                    </Text>
                  </View>
                )}
              </>
            )}

            {resultado &&
              resultado.exitosa &&
              operation === "suma" &&
              resultado.matrizSuma && (
                <MatrixDisplay
                  matriz={resultado.matrizSuma}
                  titulo="Resultado de Suma"
                  subtitulo={`A + B (mod ${n})`}
                  isDark={isDark}
                />
              )}

            {resultado &&
              resultado.exitosa &&
              operation === "multiplicacion" &&
              resultado.matrizProducto && (
                <MatrixDisplay
                  matriz={resultado.matrizProducto}
                  titulo="Resultado de Multiplicación"
                  subtitulo={`A × B (mod ${n})`}
                  isDark={isDark}
                />
              )}

            {resultado && resultado.exitosa && operation === "determinante" && (
              <View
                className={`mb-6 w-full rounded-xl border p-5 ${
                  isDark
                    ? "bg-zinc-800 border-accent-teal-dark"
                    : "bg-accent-teal/30 border-accent-teal"
                }`}
              >
                <View className="mb-4 flex-row items-center justify-center gap-2">
                  <Ionicons
                    name="calculator-outline"
                    size={20}
                    color={isDark ? "#fafafa" : "#18181b"}
                  />
                  <Text
                    className={`text-xl font-medium text-center ${
                      isDark ? "text-zinc-100" : "text-miro-black"
                    }`}
                  >
                    Determinante
                  </Text>
                </View>
                <View className="items-center">
                  <View
                    className={`mb-4 rounded-lg border p-4 ${
                      isDark
                        ? "bg-zinc-700 border-zinc-600"
                        : "bg-miro-white border-neutral-border"
                    }`}
                  >
                    <View className="flex-row items-center justify-center gap-2">
                      <Ionicons
                        name="close-circle-outline"
                        size={18}
                        color={isDark ? "#93c5fd" : "#2563eb"}
                      />
                      <Text
                        className={`text-center text-3xl font-bold ${
                          isDark
                            ? "text-primary-blue-light"
                            : "text-primary-blue"
                        }`}
                      >
                        {resultado.determinanteSimple}
                      </Text>
                    </View>
                  </View>
                  <Text
                    className={`text-center text-base ${
                      isDark ? "text-zinc-400" : "text-neutral-slate"
                    }`}
                  >
                    Determinante sin módulo
                  </Text>
                </View>
                {resultado.determinante !== undefined &&
                  resultado.n !== undefined && (
                    <View className="mt-6 items-center">
                      <View
                        className={`mb-4 rounded-lg border p-4 ${
                          isDark
                            ? "bg-zinc-700 border-zinc-600"
                            : "bg-miro-white border-neutral-border"
                        }`}
                      >
                        <View className="flex-row items-center justify-center gap-2">
                          <Ionicons
                            name="calculator-outline"
                            size={18}
                            color={isDark ? "#93c5fd" : "#2563eb"}
                          />
                          <Text
                            className={`text-center text-3xl font-bold ${
                              isDark
                                ? "text-primary-blue-light"
                                : "text-primary-blue"
                            }`}
                          >
                            {resultado.determinante}
                          </Text>
                        </View>
                      </View>
                      <Text
                        className={`text-center text-base ${
                          isDark ? "text-zinc-400" : "text-neutral-slate"
                        }`}
                      >
                        Determinante (mod {resultado.n})
                      </Text>
                    </View>
                  )}
              </View>
            )}

            {resultado && resultado.exitosa && operation === "inversa" && (
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                className={`mb-6 w-full rounded-lg border py-4 px-6 ${
                  isDark ? "border-zinc-600" : "border-neutral-border"
                }`}
              >
                <Text
                  className={`text-center text-lg font-medium ${
                    isDark ? "text-zinc-100" : "text-miro-black"
                  }`}
                >
                  Ver Proceso Detallado
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1">
          <View
            className="h-full w-full"
            style={{
              backgroundColor: isDark ? "#09090b" : "#ffffff",
            }}
          >
            <View
              className={`flex flex-row items-center justify-between border-b px-4 py-4 ${
                isDark ? "border-zinc-700" : "border-neutral-border"
              }`}
            >
              <Text
                className="text-xl font-bold"
                style={{ color: isDark ? "#fafafa" : "#18181b" }}
              >
                Proceso Detallado
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="rounded-lg px-4 py-2"
                style={{
                  backgroundColor: isDark ? "#27272a" : "#f4f4f5",
                }}
              >
                <Text
                  className="text-base font-medium"
                  style={{ color: isDark ? "#fafafa" : "#18181b" }}
                >
                  Cerrar
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4">
              {resultado && renderizarProceso()}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <AlertModal
        visible={alertModal.visible}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal((prev) => ({ ...prev, visible: false }))}
        isDark={isDark}
        cols={cols}
      />
    </KeyboardAvoidingView>
  );
}

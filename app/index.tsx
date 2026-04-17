import React, { useMemo, useRef, useState } from "react";
import {
  Keyboard,
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
import { calcularInversaModular } from "../src/utils/Matriz";

type Dimension = 2 | 3;

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
              <Text className="text-2xl" style={{ color: darkTc.text }}>
                {type === "error" ? "✕" : type === "warning" ? "!" : "i"}
              </Text>
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
            className="w-full rounded-lg py-3"
            style={{ backgroundColor: cols.accent }}
          >
            <Text className="text-center text-base font-medium text-white">
              Aceptar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

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

export default function Index() {
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const isDark = colorScheme === "dark";
  const isWide = width >= 1024;
  const cols = isDark ? colors.dark : colors.light;

  const [dimension, setDimension] = useState<Dimension>(2);
  const [n, setN] = useState("");
  const [matriz, setMatriz] = useState<string[][]>([
    ["", "", "", ""],
    ["", "", "", ""],
  ]);
  const [resultado, setResultado] = useState<ReturnType<
    typeof calcularInversaModular
  > | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [alertModal, setAlertModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "error" | "warning" | "info";
  }>({ visible: false, title: "", message: "", type: "error" });
  const showSidePanel = isWide && !!resultado;
  const refsMatriz = useRef<Array<Array<TextInput | null>>>([]);

  const enfocarSiguienteCelda = (fila: number, col: number) => {
    const siguienteCol = col + 1;
    if (siguienteCol < dimension) {
      refsMatriz.current[fila]?.[siguienteCol]?.focus();
      return;
    }

    const siguienteFila = fila + 1;
    if (siguienteFila < dimension) {
      refsMatriz.current[siguienteFila]?.[0]?.focus();
      return;
    }

    Keyboard.dismiss();
  };

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
    if (!resultado) {
      return {
        adjunta: null as number[][] | null,
        escalada: null as number[][] | null,
        verificacionSinModulo: null as number[][] | null,
        gcdTexto: "",
        inversoDet: null as number | null,
      };
    }

    const buscarMatrizDespuesDe = (textoPaso: string): number[][] | null => {
      const idx = resultado.pasos.findIndex((p) => p.includes(textoPaso));
      if (idx === -1 || idx + 1 >= resultado.pasos.length) {
        return null;
      }
      return parsearMatrizSerializada(resultado.pasos[idx + 1]);
    };

    const gcdTexto =
      resultado.pasos.find((p) => p.startsWith("gcd(")) ||
      `gcd(${resultado.determinante}, ${resultado.n}) = ?`;

    const inversoPaso = resultado.pasos.find((p) =>
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
    const nuevosInputs =
      dim === 2
        ? [
            ["", "", "", ""],
            ["", "", "", ""],
          ]
        : [
            ["", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", ""],
          ];
    setMatriz(nuevosInputs);
    refsMatriz.current = [];
    setResultado(null);
  };

  const actualizarCelda = (fila: number, col: number, valor: string) => {
    const nuevaMatriz = [...matriz];
    if (!nuevaMatriz[fila]) {
      nuevaMatriz[fila] = [];
    }
    nuevaMatriz[fila][col] = valor;
    setMatriz(nuevaMatriz);
  };

  const obtenerMatrizNumerica = (): number[][] => {
    const resultado: number[][] = [];

    for (let i = 0; i < dimension; i++) {
      resultado[i] = [];
      for (let j = 0; j < dimension; j++) {
        const valor = matriz[i][j];
        resultado[i][j] = valor === "" ? 0 : parseInt(valor, 10);
      }
    }

    return resultado;
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
        if (!matriz[i] || matriz[i][j] === "") {
          setAlertModal({
            visible: true,
            title: "Error",
            message: "Complete todas las celdas de la matriz",
            type: "error",
          });
          return;
        }
        const val = parseInt(matriz[i][j], 10);
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
    setResultado(res);

    if (!res.exitosa) {
      setAlertModal({
        visible: true,
        title: "No invertible",
        message: res.error || "No se pudo calcular la inversa",
        type: "warning",
      });
    }
  };

  const renderizarMatrizEnProceso = (
    matrizRender: number[][],
    titulo: string,
  ) => {
    return (
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
                <View key={colIdx}>
                  <Text
                    className="min-w-12 text-center text-xl font-medium"
                    style={{ color: cols.accent }}
                  >
                    {valor}
                  </Text>
                </View>
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
  };

  const renderizarProceso = () => {
    if (!resultado) return null;

    const matrizA = resultado.matrizOriginal;
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
          {renderizarMatrizEnProceso(resultado.matrizOriginal, "A =")}
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
            {renderizarMatrizEnProceso(datosProceso.adjunta, "Adj(A) =")}
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
            {renderizarMatrizEnProceso(datosProceso.escalada, "Adj(A) × k =")}
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
            {renderizarMatrizEnProceso(
              resultado.matrizInversa,
              "A^-1 (mod n) =",
            )}
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
              renderizarMatrizEnProceso(
                datosProceso.verificacionSinModulo,
                "A × A^-1 (sin módulo) =",
              )}
            {renderizarMatrizEnProceso(
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

  const renderizarInputs = () => {
    const filas = [];
    for (let i = 0; i < dimension; i++) {
      const filaInputs = [];
      for (let j = 0; j < dimension; j++) {
        filaInputs.push(
          <TextInput
            key={`${i}-${j}`}
            ref={(ref) => {
              if (!refsMatriz.current[i]) {
                refsMatriz.current[i] = [];
              }
              refsMatriz.current[i][j] = ref;
            }}
            className={`h-14 w-14 shrink-0 rounded-lg border px-2 py-3 text-center text-xl font-medium shadow-ring md:w-16 md:text-2xl ${
              isDark
                ? "bg-zinc-700 border-zinc-600 text-zinc-100 placeholder-zinc-500"
                : "bg-miro-white border-neutral-border text-miro-black placeholder-zinc-400"
            }`}
            keyboardType="numeric"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => enfocarSiguienteCelda(i, j)}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === "Enter") {
                enfocarSiguienteCelda(i, j);
              }
            }}
            value={matriz[i]?.[j] || ""}
            onChangeText={(text) => actualizarCelda(i, j, text)}
            placeholder="0"
            placeholderTextColor={isDark ? "#71717a" : "#a5a8b5"}
          />,
        );
      }
      filas.push(
        <View
          key={`fila-${i}`}
          className="mb-3 flex flex-row items-center justify-center self-center gap-2"
          style={{ alignSelf: "center" }}
        >
          {filaInputs}
        </View>,
      );
    }
    return filas;
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
            de Inversas
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
            <View
              className={`mb-6 w-full rounded-xl border p-5 shadow-ring ${
                isDark
                  ? "bg-zinc-800 border-zinc-700"
                  : "bg-miro-white border-neutral-border"
              }`}
            >
              <Text
                className={`mb-4 text-lg font-medium text-center ${
                  isDark ? "text-zinc-100" : "text-miro-black"
                }`}
              >
                Dimensión
              </Text>
              <View className="flex flex-row justify-center gap-3">
                <TouchableOpacity
                  onPress={() => iniciarMatriz(2)}
                  className={`flex-1 rounded-lg py-3 px-4 border ${
                    dimension === 2
                      ? "bg-primary-blue border-primary-blue"
                      : `border-neutral-border bg-transparent ${
                          isDark ? "border-zinc-600" : ""
                        }`
                  }`}
                >
                  <Text
                    className={`text-center text-lg font-medium ${
                      dimension === 2
                        ? "text-miro-white"
                        : isDark
                          ? "text-zinc-100"
                          : "text-miro-black"
                    }`}
                  >
                    2×2
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => iniciarMatriz(3)}
                  className={`flex-1 rounded-lg py-3 px-4 border ${
                    dimension === 3
                      ? "bg-primary-blue border-primary-blue"
                      : `border-neutral-border bg-transparent ${
                          isDark ? "border-zinc-600" : ""
                        }`
                  }`}
                >
                  <Text
                    className={`text-center text-lg font-medium ${
                      dimension === 3
                        ? "text-miro-white"
                        : isDark
                          ? "text-zinc-100"
                          : "text-miro-black"
                    }`}
                  >
                    3×3
                  </Text>
                </TouchableOpacity>
              </View>

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
            </View>

            <View
              className={`mb-6 w-full rounded-xl border p-5 shadow-ring ${
                isDark
                  ? "bg-zinc-800 border-zinc-700"
                  : "bg-miro-white border-neutral-border"
              }`}
            >
              <Text
                className={`mb-4 text-lg font-medium text-center ${
                  isDark ? "text-zinc-100" : "text-miro-black"
                }`}
              >
                Matriz {dimension}×{dimension}
              </Text>
              <View className="flex flex-col items-center">
                {renderizarInputs()}
              </View>
            </View>

            <TouchableOpacity
              onPress={calcularInversa}
              className="mb-6 w-full rounded-lg bg-primary-blue py-4 px-6"
            >
              <Text className="text-center text-lg font-medium text-miro-white tracking-wide">
                Calcular Inversa
              </Text>
            </TouchableOpacity>
          </View>

          <View className={showSidePanel ? "flex-1" : "w-full"}>
            {resultado && resultado.exitosa && (
              <View
                className={`mb-6 w-full rounded-xl border p-5 ${
                  isDark
                    ? "bg-zinc-800 border-accent-teal-dark"
                    : "bg-accent-teal/30 border-accent-teal"
                }`}
              >
                <Text
                  className={`mb-4 text-xl font-medium text-center ${
                    isDark ? "text-zinc-100" : "text-miro-black"
                  }`}
                >
                  Matriz Inversa
                </Text>
                <View className="flex flex-col">
                  {resultado.matrizInversa.map((fila, filaIdx) => (
                    <View
                      key={filaIdx}
                      className="mb-3 flex flex-row items-center justify-center gap-2"
                    >
                      {fila.map((valor, colIdx) => (
                        <View
                          key={colIdx}
                          className={`h-14 w-16 items-center justify-center rounded-lg border ${
                            isDark
                              ? "bg-zinc-700 border-primary-blue-light"
                              : "bg-miro-white border-primary-blue"
                          }`}
                        >
                          <Text
                            className={`text-center text-xl font-medium ${
                              isDark
                                ? "text-primary-blue-light"
                                : "text-primary-blue"
                            }`}
                          >
                            {valor}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
                <Text
                  className={`mt-3 text-center text-base ${
                    isDark ? "text-zinc-400" : "text-neutral-slate"
                  }`}
                >
                  Factor: {resultado.factorEscala}
                </Text>
              </View>
            )}

            {resultado && resultado.exitosa && (
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
                <View className="flex flex-col">
                  {resultado.matrizVerificacion.map((fila, filaIdx) => (
                    <View
                      key={filaIdx}
                      className="mb-3 flex flex-row justify-center gap-2"
                    >
                      {fila.map((valor, colIdx) => (
                        <View
                          key={colIdx}
                          className={`h-14 w-16 items-center justify-center rounded-lg border ${
                            isDark
                              ? "bg-zinc-700 border-zinc-600"
                              : "bg-miro-white border-neutral-border"
                          }`}
                        >
                          <Text
                            className={`text-center text-xl font-medium ${
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
                <Text
                  className={`mt-3 text-center text-lg font-medium ${
                    resultado.esIdentidad
                      ? "text-semantic-success"
                      : "text-semantic-error"
                  }`}
                >
                  {resultado.esIdentidad ? "✓ Identidad" : "✗ Error"}
                </Text>
              </View>
            )}

            {resultado && (
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

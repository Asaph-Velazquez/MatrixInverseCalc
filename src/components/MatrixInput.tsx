import React, { MutableRefObject } from "react";
import { TextInput, View } from "react-native";

interface MatrixInputProps {
  matriz: string[][];
  dimension: number;
  refs: MutableRefObject<Array<Array<TextInput | null>>>;
  onCellChange: (fila: number, col: number, valor: string) => void;
  isDark: boolean;
}

export function MatrixInput({
  matriz,
  dimension,
  refs,
  onCellChange,
  isDark,
}: MatrixInputProps) {
  const enfocarSiguienteCelda = (fila: number, col: number) => {
    const siguienteCol = col + 1;
    if (siguienteCol < dimension) {
      refs.current[fila]?.[siguienteCol]?.focus();
      return true;
    }

    const siguienteFila = fila + 1;
    if (siguienteFila < dimension) {
      refs.current[siguienteFila]?.[0]?.focus();
      return true;
    }

    refs.current[fila]?.[col]?.blur();
    return false;
  };

  return (
    <View className="flex flex-col items-center">
      {Array.from({ length: dimension }).map((_, i) => (
        <View
          key={`fila-${i}`}
          className="mb-3 flex flex-row items-center justify-center gap-2"
        >
          {Array.from({ length: dimension }).map((_, j) => (
            <TextInput
              key={`${i}-${j}`}
              ref={(ref) => {
                if (!refs.current[i]) {
                  refs.current[i] = [];
                }
                refs.current[i][j] = ref;
              }}
              className={`h-12 w-12 shrink-0 rounded-lg border px-1 py-2 text-center text-base font-medium shadow-ring ${
                isDark
                  ? "bg-zinc-700 border-zinc-600 text-zinc-100 placeholder-zinc-500"
                  : "bg-miro-white border-neutral-border text-miro-black placeholder-zinc-400"
              }`}
              keyboardType="numeric"
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => enfocarSiguienteCelda(i, j)}
              value={matriz[i]?.[j] || ""}
              onChangeText={(text) => onCellChange(i, j, text)}
              placeholder="0"
              placeholderTextColor={isDark ? "#71717a" : "#a5a8b5"}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
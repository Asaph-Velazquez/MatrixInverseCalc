import React from "react";
import { Text, View } from "react-native";

interface MatrixDisplayProps {
  matriz: number[][];
  titulo: string;
  subtitulo?: string;
  isDark: boolean;
  borderColor?: string;
  accentColor?: string;
}

export function MatrixDisplay({
  matriz,
  titulo,
  subtitulo,
  isDark,
  borderColor,
  accentColor,
}: MatrixDisplayProps) {
  return (
    <View
      className={`mb-6 w-full rounded-xl border p-5 ${
        borderColor ? "" : isDark ? "border-accent-teal-dark" : "border-accent-teal"
      } ${isDark ? "bg-zinc-800" : "bg-accent-teal/30"}`}
      style={borderColor ? { borderColor, backgroundColor: isDark ? "#18181b" : "#ffffff" } : undefined}
    >
      <Text
        className={`mb-4 text-xl font-medium text-center ${
          isDark ? "text-zinc-100" : "text-miro-black"
        }`}
      >
        {titulo}
      </Text>
      {subtitulo && (
        <Text
          className={`mb-3 text-center text-base ${
            isDark ? "text-zinc-400" : "text-neutral-slate"
          }`}
        >
          {subtitulo}
        </Text>
      )}
      <View className="flex flex-col">
        {matriz.map((fila, filaIdx) => (
          <View
            key={filaIdx}
            className="mb-3 flex flex-row items-center justify-center gap-2"
          >
            {fila.map((valor, colIdx) => (
              <View
                key={colIdx}
                className={`h-12 w-12 shrink-0 items-center justify-center rounded-lg border ${
                  isDark
                    ? `bg-zinc-700 ${accentColor || "border-primary-blue-light"}`
                    : `bg-miro-white ${accentColor || "border-primary-blue"}`
                }`}
                style={accentColor ? { borderColor } : undefined}
              >
                <Text
                  className={`text-center text-base font-medium ${
                    isDark
                      ? accentColor || "text-primary-blue-light"
                      : accentColor || "text-primary-blue"
                  }`}
                >
                  {valor}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}
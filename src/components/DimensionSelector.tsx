import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface DimensionSelectorProps {
  dimension: 2 | 3;
  onChange: (dim: 2 | 3) => void;
  isDark: boolean;
}

export function DimensionSelector({
  dimension,
  onChange,
  isDark,
}: DimensionSelectorProps) {
  return (
    <TouchableOpacity
      onPress={() => onChange(2)}
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
  );
}

interface DimensionSelectorGroupProps {
  dimension: 2 | 3;
  onChange: (dim: 2 | 3) => void;
  isDark: boolean;
  disabled?: boolean;
}

export function DimensionSelectorGroup({
  dimension,
  onChange,
  isDark,
  disabled = false,
}: DimensionSelectorGroupProps) {
  const renderButton = (dim: 2 | 3) => (
    <TouchableOpacity
      key={dim}
      onPress={() => !disabled && onChange(dim)}
      className={`flex-1 rounded-lg py-3 px-4 border ${
        dimension === dim
          ? "bg-primary-blue border-primary-blue"
          : `border-neutral-border bg-transparent ${
              isDark ? "border-zinc-600" : ""
            } ${disabled ? "opacity-50" : ""}`
      }`}
      disabled={disabled}
    >
      <Text
        className={`text-center text-lg font-medium ${
          dimension === dim
            ? "text-miro-white"
            : isDark
              ? "text-zinc-100"
              : "text-miro-black"
        }`}
      >
        {dim}×{dim}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex flex-row justify-center gap-3">
      {renderButton(2)}
      {renderButton(3)}
    </View>
  );
}
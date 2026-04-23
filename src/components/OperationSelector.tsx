import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";

type Operation = "inversa" | "suma" | "multiplicacion" | "determinante";

interface OperationSelectorProps {
  operation: Operation;
  onChange: (op: Operation) => void;
  isDark: boolean;
}

const operations: {
  key: Operation;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: "inversa", label: "Inversa", icon: "swap-horizontal-outline" },
  { key: "suma", label: "Suma", icon: "add-circle-outline" },
  {
    key: "multiplicacion",
    label: "Multiplicación",
    icon: "close-circle-outline",
  },
  { key: "determinante", label: "Determinante", icon: "calculator-outline" },
];

export function OperationSelector({
  operation,
  onChange,
  isDark,
}: OperationSelectorProps) {
  return (
    <View className="flex flex-row justify-center gap-2">
      {operations.map(({ key, label, icon }) => (
        <TouchableOpacity
          key={key}
          onPress={() => onChange(key)}
          className={`flex-1 rounded-xl border px-2 py-3 ${
            operation === key
              ? "bg-primary-blue border-primary-blue"
              : `border-neutral-border bg-transparent ${
                  isDark ? "border-zinc-600" : ""
                }`
          }`}
        >
          <View className="items-center">
            <Ionicons
              name={icon}
              size={22}
              color={
                operation === key ? "#ffffff" : isDark ? "#fafafa" : "#18181b"
              }
            />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

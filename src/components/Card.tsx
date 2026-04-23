import React from "react";
import { Text, View } from "react-native";

interface CardProps {
  children: React.ReactNode;
  title?: string;
  isDark: boolean;
}

export function Card({ children, title, isDark }: CardProps) {
  return (
    <View
      className={`mb-6 w-full rounded-xl border p-5 shadow-ring ${
        isDark ? "bg-zinc-800 border-zinc-700" : "bg-miro-white border-neutral-border"
      }`}
    >
      {title && (
        <Text
          className={`mb-4 text-lg font-medium text-center ${
            isDark ? "text-zinc-100" : "text-miro-black"
          }`}
        >
          {title}
        </Text>
      )}
      {children}
    </View>
  );
}
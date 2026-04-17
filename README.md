# Calculadora de Inversas de Matrices Modulares

Calculadora para obtener la inversa modular de matrices 2x2 y 3x3.

##usage

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Iniciar la app:
   ```bash
   npx expo start
   ```

## Características

- Soporte para matrices 2×2 y 3×3
- Cálculo de determinante
- Verificación de coprimalidad (gcd = 1)
- Cálculo de inversa modular usando matriz adjunta
- Verificación: A × A⁻¹ = I (mod n)
- Modal con proceso detallado paso a paso
- Tema claro/oscuro automático

## Tech Stack

- Expo (React Native)
- TypeScript
- NativeWind + Tailwind CSS
- Diseño inspirado en Miro

## Teoría

Para que una matriz tenga inversa modular:
1. det(A) y n deben ser coprimos (gcd(det(A), n) = 1
2. A⁻¹ = Adj(A) × det(A)⁻¹ (mod n)
3. Verificación: A × A⁻¹ ≡ I (mod n)# MatrixInverseCalc

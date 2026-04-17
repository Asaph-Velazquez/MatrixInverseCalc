# 📐 Modular Matrix Inverse Calculator

If you just want to try the app, please check the **[Releases](../../releases)** section and download the latest APK.  
For development and contribution, follow the instructions below.

---

## 🚀 Usage

1. Install dependencies:
```bash
   npm install
```
2. Start the app:
```bash
   npx expo start
```

---

## ✨ Features

- Support for 2×2 and 3×3 matrices  
- Determinant calculation  
- Coprimality check (gcd = 1)  
- Modular inverse calculation using the adjugate matrix  
- Verification: A × A⁻¹ ≡ I (mod n)  
- Modal with detailed step‑by‑step process  
- Automatic light/dark theme  

---

## 🛠️ Tech Stack

- Expo (React Native)  
- TypeScript  
- NativeWind + Tailwind CSS  
- Design inspired by Miro  

---

## 📖 Theory

For a matrix to have a modular inverse:

1. det(A) and n must be coprime → gcd(det(A), n) = 1  
2. The inverse is calculated as:  
   $$A^{-1} = \text{Adj}(A) \times \det(A)^{-1} \pmod{n}$$
3. Verification:  
   $$A \times A^{-1} \equiv I \pmod{n}$$

---

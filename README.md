# Fraction Calculator

A React Native mobile app that evaluates mathematical expressions with fractions and returns results in both fraction and decimal form.

## Features

- ✅ **Fraction Operations**: Add, subtract, multiply, and divide fractions
- ✅ **Order of Operations**: Respects PEMDAS (parentheses, exponents, multiplication/division, addition/subtraction)
- ✅ **Simplified Results**: Automatically reduces fractions to lowest terms
- ✅ **Dual Output**: Shows results as both simplified fractions and decimals
- ✅ **Built-in Keypad**: Easy input interface for fractions and operators

## Examples

| Expression | Fraction Result | Decimal Result |
|------------|-----------------|----------------|
| `2/6 + 1/3` | `2/3` | `0.666...` |
| `1/2 + 1/3 * 1/2` | `2/3` | `0.666...` |
| `(1/2 + 1/3) * 1/2` | `5/12` | `0.4166...` |
| `3/4 - 1/8` | `5/8` | `0.625` |
| `2/3 / 4/5` | `5/6` | `0.833...` |

## How It Works

### 1. Fraction Class
The app uses a `Fraction` class that:
- Stores numerator and denominator
- Automatically simplifies using the greatest common divisor (GCD)
- Supports arithmetic operations (add, subtract, multiply, divide)
- Converts to decimal representation

### 2. Expression Parser
The parser uses:
- **Tokenization**: Breaks the input into numbers and operators
- **Shunting-yard Algorithm**: Converts infix notation to postfix (RPN) for proper operator precedence
- **Postfix Evaluator**: Computes the result using a stack-based approach

### 3. Order of Operations
The calculator follows standard mathematical precedence:
1. Parentheses `( )`
2. Multiplication `*` and Division `/`
3. Addition `+` and Subtraction `-`

## Installation & Running

### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- Expo Go app on your phone (iOS or Android)

### Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. On your phone:
   - Open the **Expo Go** app
   - Scan the QR code shown in your terminal

### Running on iOS Simulator

```bash
npm run ios
```

### Running on Android Emulator

```bash
npm run android
```

## Usage

1. Enter your expression using the on-screen keypad or your keyboard
2. Use `/` for fractions (e.g., `2/3` for two-thirds)
3. Use parentheses to group operations
4. Press **Calculate** to see the result in both fraction and decimal form

## Project Structure

```
fraction_calculator/
├── App.js           # Main app with Fraction class and evaluator
├── package.json     # Dependencies
├── app.json         # Expo configuration
└── babel.config.js  # Babel configuration
```

## Technical Details

### Fraction Simplification
Uses the Euclidean algorithm to find the GCD:
```
gcd(a, b):
  while b ≠ 0:
    temp = b
    b = a % b
    a = temp
  return a
```

### Expression Evaluation
The Shunting-yard algorithm converts infix to postfix:
- Input: `2/6 + 1/3 * 1/2`
- Postfix: `2/6 1/3 1/2 * +`
- Evaluated: Proper order of operations maintained

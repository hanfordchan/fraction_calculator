import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Keyboard, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import iconImage from './icon.png';

/**
 * Fraction class to handle fraction operations
 */
class Fraction {
  constructor(numerator, denominator = 1) {
    if (denominator === 0) {
      throw new Error('Denominator cannot be zero');
    }
    this.numerator = numerator;
    this.denominator = denominator;
    this.simplify();
  }

  // Greatest common divisor using Euclidean algorithm
  static gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  }

  // Simplify the fraction to lowest terms
  simplify() {
    const divisor = Fraction.gcd(this.numerator, this.denominator);
    this.numerator = this.numerator / divisor;
    this.denominator = this.denominator / divisor;

    // Ensure negative sign is in numerator only
    if (this.denominator < 0) {
      this.numerator = -this.numerator;
      this.denominator = -this.denominator;
    }
  }

  // Convert to decimal with proper precision
  toDecimal() {
    // Divide and round to 20 decimal places to avoid floating point errors
    const decimal = this.numerator / this.denominator;
    return Math.round(decimal * 1e20) / 1e20;
  }

  // Convert to mixed number (proper fraction)
  toMixedNumber() {
    if (this.denominator === 1) {
      return this.numerator.toString();
    }

    const wholeNumber = Math.floor(Math.abs(this.numerator) / this.denominator);
    const remainder = Math.abs(this.numerator) % this.denominator;
    const isNegative = this.numerator < 0;

    if (wholeNumber > 0 && remainder > 0) {
      return `${isNegative ? '-' : ''}${wholeNumber} ${remainder}/${this.denominator}`;
    } else if (wholeNumber > 0) {
      return `${isNegative ? '-' : ''}${wholeNumber}`;
    } else {
      return `${this.numerator}/${this.denominator}`;
    }
  }

  // String representation (as mixed number)
  toString() {
    return this.toMixedNumber();
  }

  // Addition
  add(other) {
    const newNumerator = this.numerator * other.denominator + other.numerator * this.denominator;
    const newDenominator = this.denominator * other.denominator;
    return new Fraction(newNumerator, newDenominator);
  }

  // Subtraction
  subtract(other) {
    const newNumerator = this.numerator * other.denominator - other.numerator * this.denominator;
    const newDenominator = this.denominator * other.denominator;
    return new Fraction(newNumerator, newDenominator);
  }

  // Multiplication
  multiply(other) {
    return new Fraction(
      this.numerator * other.numerator,
      this.denominator * other.denominator
    );
  }

  // Division
  divide(other) {
    return new Fraction(
      this.numerator * other.denominator,
      this.denominator * other.numerator
    );
  }
}

/**
 * Tokenizer for mathematical expressions
 */
function tokenize(expression) {
  const tokens = [];
  let i = 0;

  while (i < expression.length) {
    const char = expression[i];

    // Skip whitespace
    if (/\s/.test(char)) {
      i++;
      continue;
    }

    // Numbers (including fractions like 2/3, mixed numbers like 5 1/3, decimals, and negative numbers)
    if (/[\d.-]/.test(char)) {
      let num = '';
      // First, capture the whole/fraction/decimal part
      while (i < expression.length && /[\d./-]/.test(expression[i]) && expression[i] !== ' ') {
        num += expression[i];
        i++;
      }

      // Check if this might be a mixed number (whole number followed by space and fraction)
      // Save current position
      let savedI = i;
      // Skip whitespace
      while (i < expression.length && /\s/.test(expression[i])) {
        i++;
      }
      // Check if next is a fraction (digit(s) followed by / followed by digit(s))
      let hasFraction = false;
      let fractionPart = '';
      if (i < expression.length && /\d/.test(expression[i])) {
        let j = i;
        while (j < expression.length && /[\d/]/.test(expression[j])) {
          fractionPart += expression[j];
          j++;
        }
        // Validate it's a proper fraction (has exactly one /)
        const slashes = (fractionPart.match(/\//g) || []).length;
        if (slashes === 1) {
          hasFraction = true;
          num += ' ' + fractionPart;
          i = j;
        }
      }

      if (!hasFraction) {
        i = savedI;
      }

      tokens.push({ type: 'NUMBER', value: num });
      continue;
    }

    // Operators
    if (['+', '-', '*', '/', '(', ')'].includes(char)) {
      tokens.push({ type: 'OPERATOR', value: char });
      i++;
      continue;
    }

    i++;
  }

  return tokens;
}

/**
 * Parse a number token (which could be a fraction, integer, mixed number, or decimal)
 */
function parseNumber(numStr) {
  // Check if it's a mixed number (contains space and a fraction)
  if (numStr.includes(' ') && numStr.includes('/')) {
    const parts = numStr.split(' ');
    if (parts.length === 2) {
      const whole = parseInt(parts[0]);
      const fractionParts = parts[1].split('/');
      if (fractionParts.length === 2) {
        const numerator = parseInt(fractionParts[0]);
        const denominator = parseInt(fractionParts[1]);
        // Convert mixed number to improper fraction
        // e.g., 5 1/3 = (5 * 3 + 1) / 3 = 16/3
        return new Fraction(whole * denominator + numerator, denominator);
      }
    }
  }
  // Check if it's a simple fraction
  if (numStr.includes('/')) {
    const parts = numStr.split('/');
    if (parts.length === 2) {
      const numerator = parseInt(parts[0]);
      const denominator = parseInt(parts[1]);
      return new Fraction(numerator, denominator);
    }
  }
  // Check if it's a decimal number
  if (numStr.includes('.')) {
    const decimal = parseFloat(numStr);
    // Convert decimal to fraction
    // Count decimal places to determine denominator
    const decimalStr = numStr.split('.')[1] || '';
    const denominator = Math.pow(10, decimalStr.length);
    const numerator = Math.round(decimal * denominator);
    return new Fraction(numerator, denominator);
  }
  // Regular integer
  const num = parseInt(numStr);
  return new Fraction(num, 1);
}

/**
 * Convert tokens to postfix notation (Reverse Polish Notation)
 * using Shunting-yard algorithm
 */
function toPostfix(tokens) {
  const output = [];
  const operators = [];

  const precedence = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2
  };

  for (const token of tokens) {
    if (token.type === 'NUMBER') {
      output.push(token);
    } else if (token.type === 'OPERATOR') {
      if (token.value === '(') {
        operators.push(token);
      } else if (token.value === ')') {
        while (operators.length > 0 && operators[operators.length - 1].value !== '(') {
          output.push(operators.pop());
        }
        operators.pop(); // Remove '('
      } else {
        while (
          operators.length > 0 &&
          operators[operators.length - 1].value !== '(' &&
          precedence[operators[operators.length - 1].value] >= precedence[token.value]
        ) {
          output.push(operators.pop());
        }
        operators.push(token);
      }
    }
  }

  while (operators.length > 0) {
    output.push(operators.pop());
  }

  return output;
}

/**
 * Evaluate postfix expression
 */
function evaluatePostfix(postfix) {
  const stack = [];

  for (const token of postfix) {
    if (token.type === 'NUMBER') {
      stack.push(parseNumber(token.value));
    } else if (token.type === 'OPERATOR') {
      const b = stack.pop();
      const a = stack.pop();
      let result;

      switch (token.value) {
        case '+':
          result = a.add(b);
          break;
        case '-':
          result = a.subtract(b);
          break;
        case '*':
          result = a.multiply(b);
          break;
        case '/':
          result = a.divide(b);
          break;
      }

      stack.push(result);
    }
  }

  return stack[0];
}

/**
 * Main evaluation function
 */
function evaluateExpression(expression) {
  if (!expression || expression.trim() === '') {
    return null;
  }

  try {
    const tokens = tokenize(expression);
    const postfix = toPostfix(tokens);
    return evaluatePostfix(postfix);
  } catch (error) {
    throw new Error('Invalid expression: ' + error.message);
  }
}

/**
 * Component to display fraction in proper mathematical format
 */
function FractionDisplay({ fraction }) {
  if (!fraction) return null;

  // If it's a whole number (denominator = 1), display it normally
  if (fraction.denominator === 1) {
    return (
      <Text style={styles.resultValue}>
        {fraction.numerator.toString()}
      </Text>
    );
  }

  // Convert improper fraction to mixed number
  const absNumerator = Math.abs(fraction.numerator);
  const wholeNumber = Math.floor(absNumerator / fraction.denominator);
  const remainder = absNumerator % fraction.denominator;
  const isNegative = fraction.numerator < 0;

  // If it's a proper fraction (no whole number part), display as simple fraction
  if (wholeNumber === 0) {
    const lineWidth = Math.max(fraction.numerator.toString().length, fraction.denominator.toString().length) * 20 + 20;
    return (
      <View style={styles.fractionContainer}>
        <Text style={styles.numerator}>
          {fraction.numerator.toString()}
        </Text>
        <View style={[styles.fractionBar, { width: lineWidth }]} />
        <Text style={styles.denominator}>
          {fraction.denominator.toString()}
        </Text>
      </View>
    );
  }

  // For improper fractions, display as mixed number with proper fraction styling
  const prefix = isNegative ? '-' : '';
  const numerator = remainder;
  const denominator = fraction.denominator;
  const lineWidth = Math.max(numerator.toString().length, denominator.toString().length) * 20 + 20;

  return (
    <View style={styles.mixedNumberContainer}>
      <Text style={styles.wholeNumber}>
        {prefix}{wholeNumber.toString()}
      </Text>
      <View style={styles.fractionContainer}>
        <Text style={styles.numerator}>
          {numerator.toString()}
        </Text>
        <View style={[styles.fractionBar, { width: lineWidth }]} />
        <Text style={styles.denominator}>
          {denominator.toString()}
        </Text>
      </View>
    </View>
  );
}

export default function App() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showDecimal, setShowDecimal] = useState(false);

  const handleEvaluate = () => {
    Keyboard.dismiss();
    setError('');

    try {
      const fractionResult = evaluateExpression(expression);
      if (fractionResult) {
        setResult(fractionResult);
      } else {
        setResult(null);
        setError('Please enter an expression');
      }
    } catch (err) {
      setError(err.message);
      setResult(null);
    }
  };

  const handleClear = () => {
    setExpression('');
    setResult(null);
    setError('');
    Keyboard.dismiss();
  };

  const insertCharacter = (char) => {
    setExpression(prev => prev + char);
  };

  const handleBackspace = () => {
    setExpression(prev => prev.slice(0, -1));
  };

  const copyToClipboard = async () => {
    const text = showDecimal ? result.toDecimal().toFixed(19) : result.toString();
    await Clipboard.setStringAsync(text);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <StatusBar style="auto" />

        <ScrollView contentContainerStyle={styles.scrollContent} scrollEnabled={false}>
        <View style={styles.titleContainer}>
          <Image source={iconImage} style={styles.titleIcon} />
          <Text style={styles.title}>Fraction Calculator</Text>
        </View>

        {/* Input Field */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputIconContainer}>
            <Text style={styles.inputIcon}>🧮</Text>
          </View>
          <TextInput
            style={styles.input}
            value={expression}
            onChangeText={setExpression}
            onSubmitEditing={handleEvaluate}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === 'Escape' || nativeEvent.key === 'Esc') {
                handleClear();
              }
            }}
            returnKeyType="done"
            placeholder="Enter expression (e.g., 2/6 + 1/3)"
            placeholderTextColor="#999"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {expression.length > 0 && (
            <TouchableOpacity style={styles.inputClearButton} onPress={() => setExpression('')}>
              <Text style={styles.inputClearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Result Display */}
        <View style={styles.resultContainer}>
          {error ? (
            <Text style={styles.error}>{error}</Text>
          ) : result ? (
            showDecimal ? (
              <Text style={styles.resultValue} numberOfLines={1}>
                {result.toDecimal().toFixed(19)}
              </Text>
            ) : (
              <FractionDisplay fraction={result} />
            )
          ) : null}

          {/* Icon buttons at bottom right */}
          <View style={styles.resultActionButtons}>
            <TouchableOpacity
              style={[styles.resultIconButton, !result && styles.buttonDisabled]}
              onPress={() => setShowDecimal(!showDecimal)}
              disabled={!result}
            >
              {showDecimal ? (
                <View style={styles.decimalIcon}>
                  <Text style={styles.decimalIconText}>1.23</Text>
                </View>
              ) : (
                <View style={styles.fractionIcon}>
                  <Text style={styles.fractionIconTop}>x</Text>
                  <View style={styles.fractionIconLine} />
                  <Text style={styles.fractionIconBottom}>y</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.resultIconButton, !result && styles.buttonDisabled]}
              onPress={copyToClipboard}
              disabled={!result}
            >
              <Text style={styles.resultIcon}>📋</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.resultIconButton}
              onPress={handleClear}
            >
              <Text style={styles.resultIcon}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Keypad */}
        <View style={styles.keypad}>
          <View style={styles.keypadRow}>
            <TouchableOpacity style={styles.keyButton} onPress={() => insertCharacter('7')}>
              <Text style={styles.keyButtonText}>7</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.keyButton} onPress={() => insertCharacter('8')}>
              <Text style={styles.keyButtonText}>8</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.keyButton} onPress={() => insertCharacter('9')}>
              <Text style={styles.keyButtonText}>9</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.keyButton} onPress={() => insertCharacter('+')}>
              <Text style={styles.keyButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.keypadRow}>
            <TouchableOpacity style={styles.keyButton} onPress={() => insertCharacter('4')}>
              <Text style={styles.keyButtonText}>4</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.keyButton} onPress={() => insertCharacter('5')}>
              <Text style={styles.keyButtonText}>5</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.keyButton} onPress={() => insertCharacter('6')}>
              <Text style={styles.keyButtonText}>6</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.keyButton} onPress={() => insertCharacter('-')}>
              <Text style={styles.keyButtonText}>−</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.keypadRow}>
            <TouchableOpacity style={styles.keyButton} onPress={() => insertCharacter('1')}>
              <Text style={styles.keyButtonText}>1</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.keyButton} onPress={() => insertCharacter('2')}>
              <Text style={styles.keyButtonText}>2</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.keyButton} onPress={() => insertCharacter('3')}>
              <Text style={styles.keyButtonText}>3</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.keyButton} onPress={() => insertCharacter('*')}>
              <Text style={styles.keyButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.keypadRow}>
            <TouchableOpacity style={styles.keyButton} onPress={() => insertCharacter('0')}>
              <Text style={styles.keyButtonText}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.keyButton} onPress={() => insertCharacter('(')}>
              <Text style={styles.keyButtonText}>(</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.keyButton} onPress={() => insertCharacter(')')}>
              <Text style={styles.keyButtonText}>)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.keyButton} onPress={() => insertCharacter('/')}>
              <Text style={styles.keyButtonText}>/</Text>
            </TouchableOpacity>
          </View>
          {/* Space, backspace and equals row */}
          <View style={styles.keypadRow}>
            <TouchableOpacity style={styles.spaceButton} onPress={() => insertCharacter(' ')}>
              <Text style={styles.keyButtonText}>␣</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backspaceButton} onPress={handleBackspace}>
              <Text style={styles.backspaceButtonText}>⌫</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.equalsButton} onPress={handleEvaluate}>
              <Text style={styles.equalsButtonText}>=</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 20,
    gap: 12,
  },
  titleIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  inputWrapper: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
    elevation: 4,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    overflow: 'hidden',
    height: 50,
  },
  inputIconContainer: {
    paddingLeft: 10,
    paddingRight: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: 'rgba(0, 122, 255, 0.3)',
  },
  inputIcon: {
    fontSize: 18,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
    backgroundColor: '#fff',
  },
  inputClearButton: {
    width: 40,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 59, 48, 0.2)',
  },
  inputClearIcon: {
    fontSize: 18,
    color: '#FF3B30',
    fontWeight: 'bold',
  },
  resultContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    height: 140,
    alignItems: 'flex-end',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    position: 'relative',
  },
  resultActionButtons: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    gap: 6,
  },
  resultIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultIcon: {
    fontSize: 16,
  },
  fractionIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
  },
  fractionIconTop: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
    lineHeight: 10,
  },
  fractionIconBottom: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
    lineHeight: 10,
  },
  fractionIconLine: {
    height: 2,
    width: 14,
    backgroundColor: '#fff',
    marginVertical: 1,
  },
  decimalIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  decimalIconText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
    lineHeight: 16,
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  resultValue: {
    fontSize: 28,
    color: '#00ff00',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: 'bold',
    flexShrink: 1,
    textShadowColor: '#00ff00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    letterSpacing: 2,
  },
  mixedNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  wholeNumber: {
    fontSize: 36,
    color: '#00ff00',
    fontWeight: 'bold',
    textShadowColor: '#00ff00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  fractionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  numerator: {
    fontSize: 36,
    color: '#00ff00',
    fontWeight: 'bold',
    textShadowColor: '#00ff00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    marginBottom: 2,
  },
  denominator: {
    fontSize: 36,
    color: '#00ff00',
    fontWeight: 'bold',
    textShadowColor: '#00ff00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    marginTop: 2,
  },
  fractionBar: {
    height: 3,
    backgroundColor: '#00ff00',
    shadowColor: '#00ff00',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    elevation: 4,
  },
  error: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    textShadowColor: '#ff4444',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  placeholder: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  keypadRow: {
    flexDirection: 'row',
    gap: 10,
  },
  keyButton: {
    flex: 1,
    aspectRatio: 1.4,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  keyButtonText: {
    fontSize: 20,
    color: '#333',
    fontWeight: '600',
  },
  spaceButton: {
    flex: 1,
    aspectRatio: 1.4,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backspaceButton: {
    flex: 1,
    aspectRatio: 1.4,
    backgroundColor: '#FF9500',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backspaceButtonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  keypad: {
    gap: 10,
  },
  equalsButton: {
    flex: 2,
    aspectRatio: 1.4,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  equalsButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

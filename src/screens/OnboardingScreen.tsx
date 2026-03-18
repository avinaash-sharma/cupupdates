import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { saveUserPreferences } from '../utils/storage';
import { CategorySelector } from '../components/CategorySelector';

const MIN_CATEGORIES = 5;

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleNameContinue = () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length < 2) {
      setNameError('Please enter at least 2 characters.');
      return;
    }
    setNameError('');
    setStep(2);
  };

  const handleCategoriesContinue = async () => {
    if (selectedCategories.length < MIN_CATEGORIES) return;
    await saveUserPreferences({
      name: name.trim(),
      selectedCategories,
      hasOnboarded: true,
    });
    onComplete();
  };

  const canContinue = selectedCategories.length >= MIN_CATEGORIES;

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.gradient}>
      {step === 1 ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inner}
        >
          {/* Logo */}
          <View style={styles.logoSection}>
            <Text style={styles.logoEmoji}>☕</Text>
            <Text style={styles.logoName}>CupUpdates</Text>
            <Text style={styles.tagline}>Your daily news, brewed fresh</Text>
          </View>

          {/* Step indicator */}
          <View style={styles.steps}>
            <View style={[styles.stepDot, styles.stepDotActive]} />
            <View style={styles.stepLine} />
            <View style={styles.stepDot} />
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.question}>{"What's your name?"}</Text>
            <Text style={styles.hint}>{"We'll use this to personalise your experience."}</Text>

            <TextInput
              style={[styles.input, nameError ? styles.inputError : null]}
              value={name}
              onChangeText={(t) => { setName(t); setNameError(''); }}
              placeholder="Enter your name"
              placeholderTextColor="rgba(255,255,255,0.38)"
              autoFocus
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleNameContinue}
            />
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

            <TouchableOpacity
              style={[styles.btn, !name.trim() && styles.btnDisabled]}
              onPress={handleNameContinue}
              activeOpacity={0.82}
            >
              <Text style={styles.btnText}>Continue →</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>Stay informed. Stay ahead.</Text>
        </KeyboardAvoidingView>
      ) : (
        <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
          {/* Step indicator */}
          <View style={styles.steps}>
            <View style={[styles.stepDot, styles.stepDotDone]}>
              <Text style={styles.stepDotDoneText}>✓</Text>
            </View>
            <View style={[styles.stepLine, styles.stepLineDone]} />
            <View style={[styles.stepDot, styles.stepDotActive]} />
          </View>

          <View style={styles.form}>
            <Text style={styles.question}>Pick your topics</Text>
            <Text style={styles.hint}>
              Select at least {MIN_CATEGORIES} categories.{' '}
              <Text style={styles.hintCount}>
                {selectedCategories.length}/{MIN_CATEGORIES} selected
              </Text>
            </Text>

            <CategorySelector
              selected={selectedCategories}
              onChange={setSelectedCategories}
              min={0}           // allow free toggle; we enforce min at "Continue"
              max={6}
              dark
            />

            <TouchableOpacity
              style={[styles.btn, !canContinue && styles.btnDisabled]}
              onPress={handleCategoriesContinue}
              activeOpacity={canContinue ? 0.82 : 1}
            >
              <Text style={styles.btnText}>
                {canContinue ? "Let's Go →" : `Select ${MIN_CATEGORIES - selectedCategories.length} more`}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  inner: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 60,
  },
  logoSection: { alignItems: 'center' },
  logoEmoji: { fontSize: 72, marginBottom: 12 },
  logoName: { fontSize: 32, fontWeight: '800', color: '#ffffff', letterSpacing: 0.5, marginBottom: 8 },
  tagline: { fontSize: 16, color: 'rgba(255,255,255,0.62)' },
  steps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 32,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  stepDotDone: {
    backgroundColor: 'rgba(79,70,229,0.5)',
    borderColor: '#4f46e5',
  },
  stepDotDoneText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '700',
  },
  stepLine: {
    width: 48,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  stepLineDone: {
    backgroundColor: 'rgba(79,70,229,0.6)',
  },
  form: { gap: 14 },
  question: { fontSize: 24, fontWeight: '700', color: '#ffffff', marginBottom: 2 },
  hint: { fontSize: 15, color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  hintCount: { color: '#4f46e5', fontWeight: '700' },
  input: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 18,
    color: '#ffffff',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  inputError: { borderColor: '#ff6b6b' },
  errorText: { color: '#ff6b6b', fontSize: 13 },
  btn: {
    backgroundColor: '#4f46e5',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  btnDisabled: { opacity: 0.38 },
  btnText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  footer: { color: 'rgba(255,255,255,0.38)', textAlign: 'center', fontSize: 14 },
});

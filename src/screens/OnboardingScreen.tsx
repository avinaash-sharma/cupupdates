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
import { Ionicons } from '@expo/vector-icons';
import { saveUserPreferences } from '../utils/storage';
import { CategorySelector } from '../components/CategorySelector';
import { SUPPORTED_LANGUAGES } from '../types';

const MIN_CATEGORIES = 5;

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
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

  const handleLanguageContinue = () => {
    setStep(3);
  };

  const handleCategoriesContinue = async () => {
    if (selectedCategories.length < MIN_CATEGORIES) return;
    await saveUserPreferences({
      name: name.trim(),
      selectedCategories,
      hasOnboarded: true,
      language: selectedLanguage,
    });
    onComplete();
  };

  const canContinue = selectedCategories.length >= MIN_CATEGORIES;

  const StepIndicator = () => (
    <View style={styles.steps}>
      {/* Step 1 */}
      <View style={[styles.stepDot, step === 1 ? styles.stepDotActive : styles.stepDotDone]}>
        {step > 1 && <Ionicons name="checkmark" size={13} color="#ffffff" />}
      </View>
      <View style={[styles.stepLine, step > 1 && styles.stepLineDone]} />
      {/* Step 2 */}
      <View
        style={[
          styles.stepDot,
          step === 2 ? styles.stepDotActive : step > 2 ? styles.stepDotDone : undefined,
        ]}
      >
        {step > 2 && <Ionicons name="checkmark" size={13} color="#ffffff" />}
      </View>
      <View style={[styles.stepLine, step > 2 && styles.stepLineDone]} />
      {/* Step 3 */}
      <View style={[styles.stepDot, step === 3 ? styles.stepDotActive : undefined]} />
    </View>
  );

  if (step === 1) {
    return (
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.gradient}>
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

          <StepIndicator />

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
      </LinearGradient>
    );
  }

  if (step === 2) {
    return (
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.gradient}>
        <View style={styles.inner}>
          <StepIndicator />

          <View style={styles.form}>
            <Text style={styles.question}>Choose your language</Text>
            <Text style={styles.hint}>News will be fetched in your chosen language.</Text>

            <View style={styles.languageList}>
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = selectedLanguage === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    style={[styles.languageCard, isSelected && styles.languageCardSelected]}
                    onPress={() => setSelectedLanguage(lang.code)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.languageFlag}>{lang.flag}</Text>
                    <View style={styles.languageLabels}>
                      <Text style={[styles.languageLabel, isSelected && styles.languageLabelSelected]}>
                        {lang.label}
                      </Text>
                      {lang.nativeLabel !== lang.label && (
                        <Text style={styles.languageNative}>{lang.nativeLabel}</Text>
                      )}
                    </View>
                    {isSelected && <Ionicons name="checkmark" size={20} color="#4f46e5" />}
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.settingsHint}>
              💡 This can be changed later in Settings.
            </Text>

            <TouchableOpacity style={styles.btn} onPress={handleLanguageContinue} activeOpacity={0.82}>
              <Text style={styles.btnText}>Continue →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    );
  }

  // Step 3 — Categories
  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
        <StepIndicator />

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
            min={0}
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
  stepLine: {
    width: 40,
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
  // Language selection
  languageList: {
    gap: 12,
    marginTop: 4,
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    gap: 14,
  },
  languageCardSelected: {
    borderColor: '#4f46e5',
    backgroundColor: 'rgba(79,70,229,0.18)',
  },
  languageFlag: {
    fontSize: 28,
  },
  languageLabels: {
    flex: 1,
  },
  languageLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
  },
  languageLabelSelected: {
    color: '#ffffff',
  },
  languageNative: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 2,
  },
  settingsHint: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.42)',
    textAlign: 'center',
    marginTop: 4,
  },
});

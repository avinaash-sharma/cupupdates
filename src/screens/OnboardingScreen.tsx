import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { saveUserPreferences } from '../utils/storage';
import { CategorySelector } from '../components/CategorySelector';
import { SUPPORTED_LANGUAGES, NOTIFICATION_TIMES, DEFAULT_NOTIFICATION_HOUR } from '../types';
import { posthog } from '../posthog';

const MIN_CATEGORIES = 3;
const MAX_KEYWORDS = 2;

const PRESET_KEYWORDS = [
  'Technology', 'AI', 'Cricket', 'IPL', 'Football',
  'Bitcoin', 'Politics', 'Startups', 'Climate', 'Space',
  'Gaming', 'Bollywood',
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [customKeyword, setCustomKeyword] = useState('');
  const [notifGranted, setNotifGranted] = useState<boolean | null>(null); // null = not yet asked
  const [notificationHour, setNotificationHour] = useState(DEFAULT_NOTIFICATION_HOUR);

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
    if (selectedKeywords.length === 0) return;
    const trimmedName = name.trim();
    await saveUserPreferences({
      name: trimmedName,
      selectedCategories,
      hasOnboarded: true,
      language: selectedLanguage,
      keywords: selectedKeywords,
      lastKeywordCheck: 0, // force first digest fetch on next open
      notificationHour,
    });
    posthog.identify(trimmedName, { name: trimmedName });
    posthog.capture('onboarding_completed', {
      language: selectedLanguage,
      categories_count: selectedCategories.length,
      keywords_count: selectedKeywords.length,
      notification_granted: notifGranted === true,
    });
    onComplete();
  };

  const canContinue =
    selectedCategories.length >= MIN_CATEGORIES && selectedKeywords.length >= 1;

  const toggleKeyword = (kw: string) => {
    setSelectedKeywords((prev) => {
      if (prev.includes(kw)) return prev.filter((k) => k !== kw);
      if (prev.length >= MAX_KEYWORDS) return prev; // silently cap
      return [...prev, kw];
    });
  };

  const addCustomKeyword = () => {
    const trimmed = customKeyword.trim();
    if (!trimmed) return;
    if (selectedKeywords.length >= MAX_KEYWORDS) return;
    if (!selectedKeywords.includes(trimmed)) {
      setSelectedKeywords((prev) => [...prev, trimmed]);
    }
    setCustomKeyword('');
  };

  const requestNotifPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    const granted = status === 'granted';
    setNotifGranted(granted);
    if (granted) {
      posthog.capture('notification_permission_granted');
    } else {
      posthog.capture('notification_permission_denied');
    }
  };

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
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.logoName}>Headline</Text>
            <Text style={styles.tagline}>Your daily news, at a glance</Text>
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
        <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color="rgba(255,255,255,0.7)" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
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

  // Step 3 — Categories + Keywords + Permissions
  const categoriesNeeded = Math.max(0, MIN_CATEGORIES - selectedCategories.length);
  const keywordsNeeded = selectedKeywords.length === 0;

  let ctaLabel: string;
  if (categoriesNeeded > 0) {
    ctaLabel = `Select ${categoriesNeeded} more categor${categoriesNeeded !== 1 ? 'ies' : 'y'}`;
  } else if (keywordsNeeded) {
    ctaLabel = 'Add at least 1 keyword';
  } else {
    ctaLabel = 'Start reading →';
  }

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.gradient}>
      <TouchableOpacity style={styles.backBtn} onPress={() => setStep(2)} activeOpacity={0.7}>
        <Ionicons name="chevron-back" size={22} color="rgba(255,255,255,0.7)" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.inner}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <StepIndicator />

          {/* ── Section A: Categories ─────────────────────────── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.question}>Choose your categories</Text>
            <Text style={styles.hint}>These shape your daily feed</Text>
            <Text style={styles.counterHint}>
              <Text
                style={[
                  styles.hintCount,
                  selectedCategories.length >= MIN_CATEGORIES && styles.hintCountMet,
                ]}
              >
                {selectedCategories.length}
              </Text>
              <Text style={styles.hint}> / {MIN_CATEGORIES} minimum</Text>
            </Text>
          </View>

          <CategorySelector
            selected={selectedCategories}
            onChange={setSelectedCategories}
            min={0}
            max={6}
            dark
          />

          {/* ── Divider ───────────────────────────────────────── */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>AND</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* ── Section B: Keywords ───────────────────────────── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.question}>Track up to 2 keywords</Text>
            <Text style={styles.hint}>
              {"You'll get a daily digest of matching news — delivered to your notifications"}
            </Text>
          </View>

          {/* Preset keyword chips */}
          <View style={styles.keywordChips}>
            {PRESET_KEYWORDS.map((kw) => {
              const isSelected = selectedKeywords.includes(kw);
              const isDisabled = !isSelected && selectedKeywords.length >= MAX_KEYWORDS;
              return (
                <TouchableOpacity
                  key={kw}
                  style={[
                    styles.keywordChip,
                    isSelected && styles.keywordChipSelected,
                    isDisabled && styles.keywordChipDisabled,
                  ]}
                  onPress={() => toggleKeyword(kw)}
                  activeOpacity={isDisabled ? 1 : 0.75}
                >
                  <Text
                    style={[
                      styles.keywordChipText,
                      isSelected && styles.keywordChipTextSelected,
                    ]}
                  >
                    {kw}
                  </Text>
                  {isSelected && (
                    <Ionicons name="close-circle" size={14} color="#a5b4fc" style={{ marginLeft: 4 }} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Custom keyword input */}
          <View style={styles.customKeywordRow}>
            <TextInput
              style={styles.customKeywordInput}
              value={customKeyword}
              onChangeText={setCustomKeyword}
              placeholder="Add your own keyword…"
              placeholderTextColor="rgba(255,255,255,0.3)"
              returnKeyType="done"
              onSubmitEditing={addCustomKeyword}
              editable={selectedKeywords.length < MAX_KEYWORDS}
            />
            <TouchableOpacity
              style={[
                styles.customKeywordAdd,
                (selectedKeywords.length >= MAX_KEYWORDS || !customKeyword.trim()) &&
                  styles.customKeywordAddDisabled,
              ]}
              onPress={addCustomKeyword}
              activeOpacity={0.75}
            >
              <Ionicons name="add" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {selectedKeywords.length >= MAX_KEYWORDS && (
            <Text style={styles.maxHint}>Max 2 keywords</Text>
          )}

          {/* Selected keywords as removable pills */}
          {selectedKeywords.length > 0 && (
            <View style={styles.selectedKeywords}>
              {selectedKeywords.map((kw) => (
                <TouchableOpacity
                  key={kw}
                  style={styles.selectedPill}
                  onPress={() => toggleKeyword(kw)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.selectedPillText}>{kw}</Text>
                  <Ionicons name="close" size={13} color="#a5b4fc" style={{ marginLeft: 3 }} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* ── Section C: Notification time (shown when keywords ≥ 1) ── */}
          {selectedKeywords.length >= 1 && (
            <View style={styles.timeSection}>
              <Text style={styles.question}>When to notify you?</Text>
              <Text style={styles.hint}>Pick a daily time for your keyword digest.</Text>
              <View style={styles.timeGrid}>
                {NOTIFICATION_TIMES.map((slot) => {
                  const isActive = notificationHour === slot.hour;
                  return (
                    <TouchableOpacity
                      key={slot.hour}
                      style={[styles.timeSlot, isActive && styles.timeSlotActive]}
                      onPress={() => setNotificationHour(slot.hour)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.timeSlotLabel, isActive && styles.timeSlotLabelActive]}>
                        {slot.label}
                      </Text>
                      <Text style={[styles.timeSlotTime, isActive && styles.timeSlotTimeActive]}>
                        {slot.time}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* ── Section D: Permissions (shown when keywords ≥ 1) ── */}
          {selectedKeywords.length >= 1 && (
            <View style={styles.permissionsSection}>
              {/* Storage permission card (visual trust signal — AsyncStorage always available) */}
              <View style={styles.permCard}>
                <View style={styles.permIcon}>
                  <Ionicons name="shield-checkmark-outline" size={22} color="#a5b4fc" />
                </View>
                <View style={styles.permContent}>
                  <Text style={styles.permTitle}>Save your preferences</Text>
                  <Text style={styles.permDesc}>
                    Your settings are saved locally on this device.
                  </Text>
                </View>
                <View style={styles.permGranted}>
                  <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
                </View>
              </View>

              {/* Notifications permission card */}
              {notifGranted === null ? (
                <View style={styles.permCard}>
                  <View style={styles.permIcon}>
                    <Ionicons name="notifications-outline" size={22} color="#a5b4fc" />
                  </View>
                  <View style={styles.permContent}>
                    <Text style={styles.permTitle}>Get daily keyword digests</Text>
                    <Text style={styles.permDesc}>
                      {"We'll notify you when new articles match your keywords."}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.allowBtn}
                    onPress={requestNotifPermission}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.allowBtnText}>Allow</Text>
                  </TouchableOpacity>
                </View>
              ) : notifGranted ? (
                <View style={styles.permCard}>
                  <View style={styles.permIcon}>
                    <Ionicons name="notifications" size={22} color="#a5b4fc" />
                  </View>
                  <View style={styles.permContent}>
                    <Text style={styles.permTitle}>Notifications enabled</Text>
                    <Text style={styles.permDesc}>{"You'll receive daily keyword digests."}</Text>
                  </View>
                  <View style={styles.permGranted}>
                    <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
                  </View>
                </View>
              ) : (
                <View style={[styles.permCard, styles.permCardMuted]}>
                  <View style={styles.permIcon}>
                    <Ionicons name="notifications-off-outline" size={22} color="rgba(255,255,255,0.3)" />
                  </View>
                  <View style={styles.permContent}>
                    <Text style={[styles.permTitle, styles.permTitleMuted]}>Notifications skipped</Text>
                    <Text style={styles.permDesc}>
                      You can enable them later in Settings.
                    </Text>
                  </View>
                </View>
              )}

              {notifGranted === null && (
                <TouchableOpacity onPress={() => setNotifGranted(false)} activeOpacity={0.7}>
                  <Text style={styles.maybeLater}>Maybe later</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* ── CTA ──────────────────────────────────────────── */}
          <TouchableOpacity
            style={[styles.btn, !canContinue && styles.btnDisabled]}
            onPress={handleCategoriesContinue}
            activeOpacity={canContinue ? 0.82 : 1}
          >
            <Text style={styles.btnText}>{ctaLabel}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  backBtn: {
    position: 'absolute',
    top: 56,
    left: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 10,
    paddingVertical: 8,
    paddingRight: 12,
  },
  backText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontWeight: '500',
  },
  inner: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 60,
  },
  logoSection: { alignItems: 'center' },
  logoImage: { width: 100, height: 100, marginBottom: 16, borderRadius: 100},
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
  // Step 3 additions
  sectionHeader: {
    paddingHorizontal: 4,
    gap: 4,
    marginBottom: 12,
  },
  counterHint: {
    flexDirection: 'row',
  },
  hintCountMet: {
    color: '#4ade80',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  keywordChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  keywordChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  keywordChipSelected: {
    borderColor: '#4f46e5',
    backgroundColor: 'rgba(79,70,229,0.22)',
  },
  keywordChipDisabled: {
    opacity: 0.38,
  },
  keywordChipText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    fontWeight: '500',
  },
  keywordChipTextSelected: {
    color: '#a5b4fc',
    fontWeight: '600',
  },
  customKeywordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  customKeywordInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: '#ffffff',
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  customKeywordAdd: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customKeywordAddDisabled: {
    opacity: 0.35,
  },
  maxHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.38)',
    marginBottom: 8,
  },
  selectedKeywords: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  selectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(79,70,229,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(79,70,229,0.5)',
    gap: 2,
  },
  selectedPillText: {
    color: '#a5b4fc',
    fontSize: 13,
    fontWeight: '600',
  },
  permissionsSection: {
    marginTop: 20,
    gap: 10,
  },
  permCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 12,
  },
  permCardMuted: {
    opacity: 0.55,
  },
  permIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(79,70,229,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permContent: {
    flex: 1,
    gap: 2,
  },
  permTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  permTitleMuted: {
    color: 'rgba(255,255,255,0.45)',
  },
  permDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.42)',
    lineHeight: 16,
  },
  permGranted: {
    paddingLeft: 4,
  },
  allowBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#4f46e5',
  },
  allowBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  maybeLater: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.35)',
    fontSize: 13,
    marginTop: 2,
    textDecorationLine: 'underline',
  },
  // Notification time picker
  timeSection: {
    marginTop: 20,
    gap: 8,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  timeSlot: {
    width: '47%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    gap: 2,
  },
  timeSlotActive: {
    borderColor: '#4f46e5',
    backgroundColor: 'rgba(79,70,229,0.28)',
  },
  timeSlotLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
  },
  timeSlotLabelActive: {
    color: '#ffffff',
  },
  timeSlotTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.38)',
  },
  timeSlotTimeActive: {
    color: 'rgba(255,255,255,0.75)',
  },
});

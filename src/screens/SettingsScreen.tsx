import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../hooks/useSettings';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n/useTranslation';
import { CategorySelector } from '../components/CategorySelector';
import { Ionicons } from '@expo/vector-icons';
import { SUPPORTED_LANGUAGES, NOTIFICATION_TIMES } from '../types';
import { DevToolsScreen } from './DevToolsScreen';
import { posthog } from '../posthog';

const APP_VERSION = '1.0.0';
const MIN_CATEGORIES = 3;
const MAX_KEYWORDS = 2;

export const SettingsScreen: React.FC = () => {
  const {
    userName, setUserName,
    isDark, toggleDark,
    selectedCategories, updateCategories,
    keywords, updateKeywords,
    notificationHour, updateNotificationHour,
    language, updateLanguage,
  } = useSettings();
  const t = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [showDevTools, setShowDevTools] = useState(false);

  const startEditing = () => {
    setNameInput(userName);
    setEditingName(true);
  };

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed.length < 2) {
      Alert.alert(t.settings.invalidName, t.settings.nameError);
      return;
    }
    setUserName(trimmed);
    setEditingName(false);
  };

  const handleCategoryChange = (cats: string[]) => {
    updateCategories(cats);
  };

  const handleLanguageChange = async (lang: string) => {
    if (lang === language) return;
    await updateLanguage(lang);
    posthog.capture('settings_language_changed', { language: lang });
  };

  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim();
    if (!trimmed) return;
    if (keywords.length >= MAX_KEYWORDS) return;
    if (keywords.includes(trimmed)) {
      setKeywordInput('');
      return;
    }
    updateKeywords([...keywords, trimmed]);
    setKeywordInput('');
    posthog.capture('settings_keyword_added', { keyword: trimmed });
  };

  const handleRemoveKeyword = (kw: string) => {
    updateKeywords(keywords.filter((k) => k !== kw));
    posthog.capture('settings_keyword_removed', { keyword: kw });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View
        style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t.settings.title}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionLabel, { color: colors.subtext }]}>{t.settings.profile}</Text>

          {editingName ? (
            <View style={[styles.editRow, { borderBottomColor: colors.border }]}>
              <View style={styles.rowIconWrap}>
                <Ionicons name="person-outline" size={18} color={colors.subtext} />
              </View>
              <TextInput
                style={[styles.nameInput, { color: colors.text, borderColor: colors.border }]}
                value={nameInput}
                onChangeText={setNameInput}
                placeholder={t.settings.namePlaceholder}
                placeholderTextColor={colors.subtext}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSaveName}
              />
              <TouchableOpacity onPress={handleSaveName} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>{t.settings.save}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditingName(false)} style={styles.cancelBtn}>
                <Text style={[styles.cancelBtnText, { color: colors.subtext }]}>{t.settings.cancel}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.row, { borderBottomColor: colors.border }]}>
              <View style={styles.rowLeft}>
                <View style={styles.rowIconWrap}>
                  <Ionicons name="person-outline" size={18} color={colors.subtext} />
                </View>
                <Text style={[styles.rowLabel, { color: colors.text }]}>{t.settings.yourName}</Text>
              </View>
              <TouchableOpacity onPress={startEditing}>
                <Text style={[styles.rowValue, { color: colors.subtext }]}>
                  {userName || t.settings.notSet} <Text style={styles.editLink}>{t.settings.edit}</Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Categories */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionLabel, { color: colors.subtext }]}>{t.settings.categoriesLabel}</Text>
          <Text style={[styles.sectionHint, { color: colors.subtext }]}>
            {t.settings.categoriesHint(MIN_CATEGORIES, selectedCategories.length)}
          </Text>
          <View style={styles.categoryPad}>
            <CategorySelector
              selected={selectedCategories}
              onChange={handleCategoryChange}
              min={MIN_CATEGORIES}
            />
          </View>
        </View>

        {/* Keywords */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionLabel, { color: colors.subtext }]}>{t.settings.keywordsLabel}</Text>
          <Text style={[styles.sectionHint, { color: colors.subtext }]}>{t.settings.keywordsHint}</Text>

          <View style={styles.keywordsPad}>
            {/* Current keywords as removable pills */}
            {keywords.length === 0 ? (
              <Text style={[styles.noKeywordsText, { color: colors.subtext }]}>
                {t.settings.noKeywords}
              </Text>
            ) : (
              <View style={styles.keywordPills}>
                {keywords.map((kw) => (
                  <View key={kw} style={[styles.keywordPill, { backgroundColor: isDark ? 'rgba(79,70,229,0.18)' : 'rgba(79,70,229,0.1)' }]}>
                    <Text style={styles.keywordPillText}>{kw}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveKeyword(kw)}
                      hitSlop={8}
                      style={styles.keywordPillRemove}
                    >
                      <Ionicons name="close-circle" size={16} color="#a5b4fc" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Add input — hidden when at max */}
            {keywords.length < MAX_KEYWORDS && (
              <View style={[styles.keywordInputRow, { borderColor: colors.border }]}>
                <TextInput
                  style={[styles.keywordInput, { color: colors.text }]}
                  value={keywordInput}
                  onChangeText={setKeywordInput}
                  placeholder={t.settings.keywordPlaceholder}
                  placeholderTextColor={colors.subtext}
                  returnKeyType="done"
                  onSubmitEditing={handleAddKeyword}
                />
                <TouchableOpacity
                  style={[styles.keywordAddBtn, !keywordInput.trim() && styles.keywordAddBtnDisabled]}
                  onPress={handleAddKeyword}
                  activeOpacity={0.75}
                >
                  <Ionicons name="add" size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>
            )}

            {keywords.length >= MAX_KEYWORDS && (
              <Text style={[styles.maxKeywordsHint, { color: colors.subtext }]}>
                {t.settings.maxKeywords}
              </Text>
            )}
          </View>
        </View>

        {/* Notifications */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionLabel, { color: colors.subtext }]}>{t.settings.notificationsLabel}</Text>
          <View style={styles.notifPad}>
            <Text style={[styles.notifTimeLabel, { color: colors.text }]}>{t.settings.digestTimeLabel}</Text>
            <Text style={[styles.sectionHint, { color: colors.subtext, paddingHorizontal: 0, paddingBottom: 12 }]}>
              {t.settings.digestTimeHint}
            </Text>
            <View style={styles.timeGrid}>
              {NOTIFICATION_TIMES.map((slot) => {
                const isActive = notificationHour === slot.hour;
                return (
                  <TouchableOpacity
                    key={slot.hour}
                    style={[
                      styles.timeSlot,
                      { borderColor: isActive ? '#4f46e5' : colors.border },
                      isActive && styles.timeSlotActive,
                    ]}
                    onPress={() => updateNotificationHour(slot.hour)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.timeSlotLabel, { color: isActive ? '#ffffff' : colors.text }]}>
                      {slot.label}
                    </Text>
                    <Text style={[styles.timeSlotTime, { color: isActive ? 'rgba(255,255,255,0.7)' : colors.subtext }]}>
                      {slot.time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Language */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionLabel, { color: colors.subtext }]}>{t.settings.languageLabel}</Text>
          <Text style={[styles.sectionHint, { color: colors.subtext }]}>{t.settings.languageHint}</Text>
          <View style={styles.languageList}>
            {SUPPORTED_LANGUAGES.map((lang, idx) => {
              const isSelected = language === lang.code;
              const isLast = idx === SUPPORTED_LANGUAGES.length - 1;
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageRow,
                    { borderBottomColor: colors.border },
                    isLast && { borderBottomWidth: 0 },
                  ]}
                  onPress={() => handleLanguageChange(lang.code)}
                  activeOpacity={0.7}
                >
                  <View style={styles.rowLeft}>
                    <Text style={styles.langFlag}>{lang.flag}</Text>
                    <View>
                      <Text style={[styles.rowLabel, { color: colors.text }]}>{lang.label}</Text>
                      {lang.nativeLabel !== lang.label && (
                        <Text style={[styles.languageNative, { color: colors.subtext }]}>
                          {lang.nativeLabel}
                        </Text>
                      )}
                    </View>
                  </View>
                  {isSelected && <Ionicons name="checkmark" size={20} color="#4f46e5" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Appearance */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionLabel, { color: colors.subtext }]}>{t.settings.appearance}</Text>
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <View style={styles.rowLeft}>
              <View style={styles.rowIconWrap}>
                <Ionicons name="moon-outline" size={18} color={colors.subtext} />
              </View>
              <Text style={[styles.rowLabel, { color: colors.text }]}>{t.settings.darkMode}</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={(val) => { toggleDark(); posthog.capture('settings_dark_mode_toggled', { dark_mode: val }); }}
              trackColor={{ false: '#e0e0e0', true: '#4f46e5' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* About */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionLabel, { color: colors.subtext }]}>{t.settings.about}</Text>
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <View style={styles.rowLeft}>
              <View style={styles.rowIconWrap}>
                <Ionicons name="newspaper-outline" size={18} color={colors.subtext} />
              </View>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Headline</Text>
            </View>
            <Text style={[styles.rowValue, { color: colors.subtext }]}>{t.settings.appTagline}</Text>
          </View>
          <View style={[styles.row, { borderBottomColor: __DEV__ ? colors.border : 'transparent' }]}>
            <View style={styles.rowLeft}>
              <View style={styles.rowIconWrap}>
                <Ionicons name="information-circle-outline" size={18} color={colors.subtext} />
              </View>
              <Text style={[styles.rowLabel, { color: colors.text }]}>{t.settings.version}</Text>
            </View>
            <Text style={[styles.rowValue, { color: colors.subtext }]}>{APP_VERSION}</Text>
          </View>
          {__DEV__ && (
            <TouchableOpacity
              style={[styles.row, { borderBottomColor: 'transparent' }]}
              onPress={() => setShowDevTools(true)}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <View style={styles.rowIconWrap}>
                  <Ionicons name="bug-outline" size={18} color="#facc15" />
                </View>
                <Text style={[styles.rowLabel, { color: '#facc15' }]}>Notification Dev Tools</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="rgba(250,204,21,0.5)" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {__DEV__ && (
        <DevToolsScreen visible={showDevTools} onClose={() => setShowDevTools(false)} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  section: {
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 14,
    overflow: 'hidden',
    paddingTop: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  sectionHint: {
    fontSize: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
    opacity: 0.7,
  },
  categoryPad: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowIconWrap: { width: 24, alignItems: 'center' },
  langFlag: { fontSize: 20, width: 28, textAlign: 'center' },
  rowLabel: { fontSize: 15, fontWeight: '500' },
  rowValue: { fontSize: 14 },
  editLink: { color: '#4f46e5', fontWeight: '600' },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  nameInput: {
    flex: 1,
    fontSize: 15,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  saveBtn: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  cancelBtn: { paddingHorizontal: 4 },
  cancelBtnText: { fontSize: 14 },
  languageList: {
    paddingBottom: 4,
  },
  languageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  languageNative: {
    fontSize: 12,
    marginTop: 1,
  },

  // Keywords section
  keywordsPad: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  noKeywordsText: {
    fontSize: 14,
    opacity: 0.6,
  },
  keywordPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  keywordPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(79,70,229,0.4)',
    gap: 4,
  },
  keywordPillText: {
    color: '#a5b4fc',
    fontSize: 14,
    fontWeight: '600',
  },
  keywordPillRemove: {
    paddingLeft: 2,
  },
  keywordInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
    gap: 0,
  },
  keywordInput: {
    flex: 1,
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  keywordAddBtn: {
    backgroundColor: '#4f46e5',
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keywordAddBtnDisabled: {
    opacity: 0.4,
  },
  maxKeywordsHint: {
    fontSize: 12,
    opacity: 0.6,
  },

  // Notifications / time picker section
  notifPad: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
  },
  notifTimeLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeSlot: {
    width: '47%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 2,
  },
  timeSlotActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  timeSlotLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  timeSlotTime: {
    fontSize: 12,
  },
});

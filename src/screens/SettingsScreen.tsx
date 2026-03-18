import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../hooks/useSettings';
import { useTheme } from '../context/ThemeContext';
import { CategorySelector } from '../components/CategorySelector';

const APP_VERSION = '1.0.0';
const MIN_CATEGORIES = 3;

export const SettingsScreen: React.FC = () => {
  const { userName, setUserName, isDark, toggleDark, selectedCategories, updateCategories } =
    useSettings();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const startEditing = () => {
    setNameInput(userName);
    setEditingName(true);
  };

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed.length < 2) {
      Alert.alert('Invalid Name', 'Please enter at least 2 characters.');
      return;
    }
    setUserName(trimmed);
    setEditingName(false);
  };

  const handleCategoryChange = (cats: string[]) => {
    updateCategories(cats);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View
        style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionLabel, { color: colors.subtext }]}>PROFILE</Text>

          {editingName ? (
            <View style={[styles.editRow, { borderBottomColor: colors.border }]}>
              <Text style={styles.rowIcon}>👤</Text>
              <TextInput
                style={[styles.nameInput, { color: colors.text, borderColor: colors.border }]}
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Your name"
                placeholderTextColor={colors.subtext}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSaveName}
              />
              <TouchableOpacity onPress={handleSaveName} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditingName(false)} style={styles.cancelBtn}>
                <Text style={[styles.cancelBtnText, { color: colors.subtext }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.row, { borderBottomColor: colors.border }]}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowIcon}>👤</Text>
                <Text style={[styles.rowLabel, { color: colors.text }]}>Your Name</Text>
              </View>
              <TouchableOpacity onPress={startEditing}>
                <Text style={[styles.rowValue, { color: colors.subtext }]}>
                  {userName || 'Not set'} <Text style={styles.editLink}>Edit</Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Categories */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionLabel, { color: colors.subtext }]}>MY CATEGORIES</Text>
          <Text style={[styles.sectionHint, { color: colors.subtext }]}>
            Minimum {MIN_CATEGORIES} required · {selectedCategories.length} selected
          </Text>
          <View style={styles.categoryPad}>
            <CategorySelector
              selected={selectedCategories}
              onChange={handleCategoryChange}
              min={MIN_CATEGORIES}
            />
          </View>
        </View>

        {/* Appearance */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionLabel, { color: colors.subtext }]}>APPEARANCE</Text>
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowIcon}>🌙</Text>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Dark Mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleDark}
              trackColor={{ false: '#e0e0e0', true: '#4f46e5' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* About */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionLabel, { color: colors.subtext }]}>ABOUT</Text>
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowIcon}>☕</Text>
              <Text style={[styles.rowLabel, { color: colors.text }]}>CupUpdates</Text>
            </View>
            <Text style={[styles.rowValue, { color: colors.subtext }]}>Your daily news</Text>
          </View>
          <View style={[styles.row, { borderBottomColor: 'transparent' }]}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowIcon}>ℹ️</Text>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Version</Text>
            </View>
            <Text style={[styles.rowValue, { color: colors.subtext }]}>{APP_VERSION}</Text>
          </View>
        </View>
      </ScrollView>
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
  rowIcon: { fontSize: 18, width: 24, textAlign: 'center' },
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
});

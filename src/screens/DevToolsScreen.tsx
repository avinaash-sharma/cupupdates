import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getUserPreferences,
  saveUserPreferences,
  getNotificationHistory,
  saveNotificationHistory,
} from '../utils/storage';
import { fetchKeywordDigests } from '../hooks/useKeywordDigest';
import { addDigests } from '../utils/storage';

interface Props {
  visible: boolean;
  onClose: () => void;
}

interface ScheduledNotif {
  id: string;
  title: string;
  body: string;
  trigger: string;
}

export const DevToolsScreen: React.FC<Props> = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const [permStatus, setPermStatus] = useState<string>('—');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [notifHour, setNotifHour] = useState<number | null>(null);
  const [lastCheck, setLastCheck] = useState<string>('—');
  const [historyCount, setHistoryCount] = useState<number>(0);
  const [scheduled, setScheduled] = useState<ScheduledNotif[]>([]);
  const [customDelay, setCustomDelay] = useState('1');
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) =>
    setLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 29)]);

  const refresh = useCallback(async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermStatus(status);

    const prefs = await getUserPreferences();
    setKeywords(prefs?.keywords ?? []);
    setNotifHour(prefs?.notificationHour ?? null);
    setLastCheck(
      prefs?.lastKeywordCheck
        ? new Date(prefs.lastKeywordCheck).toLocaleString()
        : 'never',
    );

    const history = await getNotificationHistory();
    setHistoryCount(history.length);

    const all = await Notifications.getAllScheduledNotificationsAsync();
    setScheduled(
      all.map((n) => ({
        id: n.identifier,
        title: n.content.title ?? '(no title)',
        body: n.content.body ?? '',
        trigger: JSON.stringify(n.trigger),
      })),
    );
  }, []);

  useEffect(() => {
    if (visible) {
      refresh();
      setLog([]);
    }
  }, [visible, refresh]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const fireNow = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔔 Dev: test notification',
          body: 'Fired from DevTools — working!',
          data: { type: 'dev_test' },
        },
        trigger: { seconds: 3 },
      });
      addLog('Notification scheduled in 3 seconds');
      await refresh();
    } catch (e: any) {
      addLog(`ERROR: ${e.message}`);
    }
  };

  const fireInMinutes = async () => {
    const mins = parseFloat(customDelay);
    if (isNaN(mins) || mins <= 0) {
      addLog('Invalid delay — enter a positive number');
      return;
    }
    const secs = Math.round(mins * 60);
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🔔 Dev: ${mins}min notification`,
          body: `Scheduled from DevTools at ${new Date().toLocaleTimeString()}`,
          data: { type: 'dev_test' },
        },
        trigger: { seconds: secs },
      });
      addLog(`Notification scheduled in ${mins}min (${secs}s)`);
      await refresh();
    } catch (e: any) {
      addLog(`ERROR: ${e.message}`);
    }
  };

  const forceFetchDigest = async () => {
    addLog('Force-fetching keyword digests…');
    try {
      const prefs = await getUserPreferences();
      if (!prefs?.keywords?.length) {
        addLog('No keywords set — add keywords in Settings first');
        return;
      }
      const digests = await fetchKeywordDigests(prefs.keywords, prefs.language ?? 'en');
      if (digests.length === 0) {
        addLog('Fetch complete — no results for current keywords');
        return;
      }
      await addDigests(digests);
      addLog(`Fetched ${digests.length} digest(s): ${digests.map((d) => d.keyword).join(', ')}`);
      await refresh();
    } catch (e: any) {
      addLog(`ERROR: ${e.message}`);
    }
  };

  const resetLastCheck = async () => {
    const prefs = await getUserPreferences();
    await saveUserPreferences({
      name: prefs?.name ?? '',
      selectedCategories: prefs?.selectedCategories ?? [],
      hasOnboarded: prefs?.hasOnboarded ?? true,
      language: prefs?.language,
      keywords: prefs?.keywords,
      notificationHour: prefs?.notificationHour,
      lastKeywordCheck: 0,
    });
    addLog('lastKeywordCheck reset to 0 — next app open will re-fetch');
    await refresh();
  };

  const clearHistory = async () => {
    Alert.alert('Clear history?', 'This will delete all stored digests.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await saveNotificationHistory([]);
          addLog('Notification history cleared');
          await refresh();
        },
      },
    ]);
  };

  const cancelAll = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    addLog('All scheduled notifications cancelled');
    await refresh();
  };

  const requestPerm = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setPermStatus(status);
    addLog(`Permission request result: ${status}`);
  };

  // ── UI ────────────────────────────────────────────────────────────────────

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.devBadge}>
              <Text style={styles.devBadgeText}>DEV</Text>
            </View>
            <Text style={styles.title}>Notification Tools</Text>
          </View>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.closeBtn, pressed && styles.closeBtnPressed]}
            hitSlop={8}
          >
            <Ionicons name="close" size={20} color="rgba(255,255,255,0.75)" />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* ── Status ── */}
          <Text style={styles.sectionLabel}>STATUS</Text>
          <View style={styles.card}>
            <StatusRow label="Permission" value={permStatus} highlight={permStatus === 'granted'} />
            <StatusRow label="Keywords" value={keywords.length ? keywords.join(', ') : 'none'} />
            <StatusRow label="Notif hour" value={notifHour != null ? `${notifHour}:00` : '—'} />
            <StatusRow label="Last fetch" value={lastCheck} />
            <StatusRow label="History entries" value={String(historyCount)} />
            <StatusRow label="Pending notifs" value={String(scheduled.length)} isLast />
          </View>
          <Pressable style={[styles.btn, styles.btnGhost]} onPress={refresh}>
            <Ionicons name="refresh" size={15} color="#a5b4fc" />
            <Text style={styles.btnGhostText}>Refresh status</Text>
          </Pressable>

          {/* ── Fire test notification ── */}
          <Text style={styles.sectionLabel}>FIRE NOTIFICATION</Text>
          <View style={styles.card}>
            <Pressable style={[styles.actionRow]} onPress={fireNow}>
              <Ionicons name="flash" size={18} color="#facc15" />
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Fire in 3 seconds</Text>
                <Text style={styles.actionDesc}>Quick smoke-test — fires almost immediately</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.3)" />
            </Pressable>

            <View style={styles.divider} />

            <View style={styles.delayRow}>
              <Ionicons name="timer-outline" size={18} color="#a5b4fc" />
              <TextInput
                style={styles.delayInput}
                value={customDelay}
                onChangeText={setCustomDelay}
                keyboardType="decimal-pad"
                placeholder="minutes"
                placeholderTextColor="rgba(255,255,255,0.3)"
                returnKeyType="done"
              />
              <Text style={styles.delayUnit}>min</Text>
              <Pressable
                style={({ pressed }) => [styles.sendBtn, pressed && { opacity: 0.75 }]}
                onPress={fireInMinutes}
              >
                <Text style={styles.sendBtnText}>Schedule</Text>
              </Pressable>
            </View>
          </View>

          {/* ── Digest ── */}
          <Text style={styles.sectionLabel}>DIGEST</Text>
          <View style={styles.card}>
            <Pressable style={styles.actionRow} onPress={forceFetchDigest}>
              <Ionicons name="cloud-download-outline" size={18} color="#34d399" />
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Force fetch digest now</Text>
                <Text style={styles.actionDesc}>Bypasses 24h gate — fetches current keywords immediately</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.3)" />
            </Pressable>

            <View style={styles.divider} />

            <Pressable style={styles.actionRow} onPress={resetLastCheck}>
              <Ionicons name="time-outline" size={18} color="#fb923c" />
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Reset last-check timestamp</Text>
                <Text style={styles.actionDesc}>Next app open will trigger a fresh fetch</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.3)" />
            </Pressable>

            <View style={styles.divider} />

            <Pressable style={[styles.actionRow, styles.actionRowLast]} onPress={clearHistory}>
              <Ionicons name="trash-outline" size={18} color="#f87171" />
              <View style={styles.actionText}>
                <Text style={[styles.actionTitle, { color: '#f87171' }]}>Clear notification history</Text>
                <Text style={styles.actionDesc}>Deletes all stored digest entries</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.3)" />
            </Pressable>
          </View>

          {/* ── Scheduled queue ── */}
          <Text style={styles.sectionLabel}>SCHEDULED QUEUE ({scheduled.length})</Text>
          <View style={styles.card}>
            {scheduled.length === 0 ? (
              <Text style={styles.emptyText}>No notifications scheduled</Text>
            ) : (
              scheduled.map((n, i) => (
                <View key={n.id} style={[styles.queueRow, i < scheduled.length - 1 && styles.queueRowBorder]}>
                  <Text style={styles.queueTitle} numberOfLines={1}>{n.title}</Text>
                  <Text style={styles.queueBody} numberOfLines={1}>{n.body}</Text>
                  <Text style={styles.queueTrigger} numberOfLines={1}>{n.trigger}</Text>
                </View>
              ))
            )}
          </View>
          <Pressable style={[styles.btn, styles.btnDestructive]} onPress={cancelAll}>
            <Ionicons name="close-circle-outline" size={15} color="#f87171" />
            <Text style={styles.btnDestructiveText}>Cancel all scheduled</Text>
          </Pressable>

          {/* ── Permission ── */}
          <Text style={styles.sectionLabel}>PERMISSION</Text>
          <Pressable style={[styles.btn, styles.btnIndigo]} onPress={requestPerm}>
            <Ionicons name="notifications-outline" size={15} color="#ffffff" />
            <Text style={styles.btnIndigoText}>Request permission</Text>
          </Pressable>

          {/* ── Activity log ── */}
          <Text style={styles.sectionLabel}>LOG</Text>
          <View style={[styles.card, styles.logCard]}>
            {log.length === 0 ? (
              <Text style={styles.emptyText}>Actions will appear here</Text>
            ) : (
              log.map((entry, i) => (
                <Text key={i} style={styles.logEntry}>{entry}</Text>
              ))
            )}
          </View>

          <View style={{ height: insets.bottom + 24 }} />
        </ScrollView>
      </View>
    </Modal>
  );
};

// ── Small helper ─────────────────────────────────────────────────────────────

const StatusRow = ({
  label,
  value,
  highlight,
  isLast,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  isLast?: boolean;
}) => (
  <View style={[styles.statusRow, !isLast && styles.statusRowBorder]}>
    <Text style={styles.statusLabel}>{label}</Text>
    <Text style={[styles.statusValue, highlight && styles.statusValueGreen]} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a12' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  devBadge: {
    backgroundColor: '#facc15',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  devBadgeText: { color: '#000000', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  title: { fontSize: 18, fontWeight: '700', color: '#ffffff' },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#1a1a2e',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center', alignItems: 'center',
  },
  closeBtnPressed: { backgroundColor: 'rgba(255,255,255,0.1)' },

  scroll: { padding: 16, gap: 8 },

  sectionLabel: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1.4,
    color: 'rgba(255,255,255,0.35)',
    marginTop: 16, marginBottom: 6, paddingHorizontal: 4,
  },

  card: {
    backgroundColor: '#12121e',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },

  // Status rows
  statusRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 11,
  },
  statusRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.07)' },
  statusLabel: { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },
  statusValue: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  statusValueGreen: { color: '#34d399' },

  // Action rows
  actionRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  actionRowLast: {},
  actionText: { flex: 1 },
  actionTitle: { fontSize: 14, fontWeight: '600', color: '#ffffff', marginBottom: 2 },
  actionDesc: { fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 16 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.07)', marginLeft: 46 },

  // Custom delay row
  delayRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 10,
  },
  delayInput: {
    flex: 1, fontSize: 15, fontWeight: '600', color: '#ffffff',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
    textAlign: 'center',
  },
  delayUnit: { fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  sendBtn: {
    backgroundColor: '#4f46e5', borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  sendBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },

  // Scheduled queue
  queueRow: { paddingHorizontal: 16, paddingVertical: 10 },
  queueRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.07)' },
  queueTitle: { fontSize: 13, fontWeight: '600', color: '#ffffff' },
  queueBody: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 1 },
  queueTrigger: { fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 3, fontFamily: 'monospace' },

  // Log
  logCard: { padding: 12, gap: 4 },
  logEntry: { fontSize: 11, color: '#a5b4fc', fontFamily: 'monospace', lineHeight: 18 },
  emptyText: { color: 'rgba(255,255,255,0.3)', fontSize: 13, padding: 16, textAlign: 'center' },

  // Standalone buttons
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 13, borderRadius: 12,
  },
  btnGhost: { borderWidth: 1, borderColor: 'rgba(165,180,252,0.3)' },
  btnGhostText: { color: '#a5b4fc', fontSize: 14, fontWeight: '600' },
  btnDestructive: { borderWidth: 1, borderColor: 'rgba(248,113,113,0.3)' },
  btnDestructiveText: { color: '#f87171', fontSize: 14, fontWeight: '600' },
  btnIndigo: { backgroundColor: '#4f46e5' },
  btnIndigoText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
});

import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  Share,
  Platform,
  BackHandler,
  Animated,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';

// ── Helpers ────────────────────────────────────────────────────────────────────

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

// ── Component ──────────────────────────────────────────────────────────────────

interface WebViewModalProps {
  url: string;
  visible: boolean;
  onClose: () => void;
}

export const WebViewModal: React.FC<WebViewModalProps> = ({ url, visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [progressVisible, setProgressVisible] = useState(true);

  // ── Progress bar ─────────────────────────────────────────────────────────────

  const handleLoadProgress = useCallback(
    ({ nativeEvent }: { nativeEvent: { progress: number } }) => {
      setProgressVisible(true);
      Animated.timing(progressAnim, {
        toValue: nativeEvent.progress,
        duration: 150,
        useNativeDriver: false,
      }).start(() => {
        if (nativeEvent.progress >= 1) {
          // Brief pause then fade the bar out
          setTimeout(() => setProgressVisible(false), 400);
        }
      });
    },
    [progressAnim],
  );

  // ── Navigation state ─────────────────────────────────────────────────────────

  const handleNavigationStateChange = useCallback((navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
    setLoadError(false);
  }, []);

  // ── Android back button ───────────────────────────────────────────────────────

  React.useEffect(() => {
    if (!visible) return;
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack) {
        webViewRef.current?.goBack();
        return true;
      }
      onClose();
      return true;
    });
    return () => handler.remove();
  }, [visible, canGoBack, onClose]);

  // ── Reset state on new URL ────────────────────────────────────────────────────

  React.useEffect(() => {
    if (visible) {
      setLoadError(false);
      setCanGoBack(false);
      setProgressVisible(true);
      progressAnim.setValue(0);
    }
  }, [url, visible]);

  // ── Share ─────────────────────────────────────────────────────────────────────

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: Platform.OS === 'ios' ? url : url,
        url: Platform.OS === 'ios' ? url : undefined,
      });
    } catch {
      // dismissed
    }
  }, [url]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => {
        if (canGoBack) {
          webViewRef.current?.goBack();
        } else {
          onClose();
        }
      }}
    >
      <View style={[styles.root, { paddingTop: insets.top }]}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              if (canGoBack) {
                webViewRef.current?.goBack();
              } else {
                onClose();
              }
            }}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
            hitSlop={8}
          >
            <Ionicons
              name={canGoBack ? 'arrow-back' : 'close'}
              size={20}
              color="rgba(255,255,255,0.85)"
            />
          </Pressable>

          <Text style={styles.domain} numberOfLines={1}>
            {getDomain(url)}
          </Text>

          <View style={styles.headerRight}>
            <Pressable
              onPress={handleShare}
              style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
              hitSlop={8}
            >
              <Ionicons name="share-outline" size={20} color="rgba(255,255,255,0.85)" />
            </Pressable>

            {canGoBack && (
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
                hitSlop={8}
              >
                <Ionicons name="close" size={20} color="rgba(255,255,255,0.85)" />
              </Pressable>
            )}
          </View>
        </View>

        {/* ── Progress bar ── */}
        {progressVisible && (
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
        )}

        {/* ── WebView ── */}
        {!loadError ? (
          <WebView
            ref={webViewRef}
            source={{ uri: url }}
            style={styles.webview}
            javaScriptEnabled
            domStorageEnabled
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            onLoadProgress={handleLoadProgress}
            onNavigationStateChange={handleNavigationStateChange}
            onError={() => setLoadError(true)}
            onHttpError={() => setLoadError(true)}
            renderLoading={() => <View style={styles.loadingPlaceholder} />}
            startInLoadingState
          />
        ) : (
          /* ── Error state ── */
          <View style={styles.errorContainer}>
            <Ionicons name="globe-outline" size={52} color="rgba(255,255,255,0.2)" />
            <Text style={styles.errorTitle}>Couldn't load page</Text>
            <Text style={styles.errorDesc}>
              Check your connection or open the article in your default browser.
            </Text>
            <View style={styles.errorActions}>
              <Pressable
                style={({ pressed }) => [styles.retryBtn, pressed && { opacity: 0.7 }]}
                onPress={() => { setLoadError(false); webViewRef.current?.reload(); }}
              >
                <Ionicons name="refresh" size={16} color="#ffffff" />
                <Text style={styles.retryBtnText}>Retry</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.externalBtn, pressed && { opacity: 0.7 }]}
                onPress={() => WebBrowser.openBrowserAsync(url)}
              >
                <Ionicons name="open-outline" size={16} color="#4f46e5" />
                <Text style={styles.externalBtnText}>Open in browser</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0B0B0F',
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    gap: 8,
  },
  domain: {
    flex: 1,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A1A1F',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBtnPressed: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  // ── Progress bar ──
  progressTrack: {
    height: 2,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  progressFill: {
    height: 2,
    backgroundColor: '#4f46e5',
  },

  // ── WebView ──
  webview: {
    flex: 1,
    backgroundColor: '#0B0B0F',
  },
  loadingPlaceholder: {
    flex: 1,
    backgroundColor: '#0B0B0F',
  },

  // ── Error state ──
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
  },
  errorDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.42)',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#4f46e5',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 12,
  },
  retryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  externalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#4f46e5',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 12,
  },
  externalBtnText: {
    color: '#4f46e5',
    fontSize: 14,
    fontWeight: '600',
  },
});

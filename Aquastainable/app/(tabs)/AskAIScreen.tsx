import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, View, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemeType } from '../theme';

import WaveBackground from '../../components/AiAssistant/WaveBackground';
import Header from '../../components/AiAssistant/Header';
import HeroSection from '../../components/AiAssistant/HeroSection';
import SuggestionPills from '../../components/AiAssistant/SuggestionPills';
import ActionToggles from '../../components/AiAssistant/ActionToggles';
import InputBar from '../../components/AiAssistant/InputBar';

export default function AskAIScreen() {
  const params = useLocalSearchParams<{
    theme?: ThemeType;
    prefillText?: string;
    prefillMediaUri?: string;
    prefillMediaType?: 'image' | 'video';
  }>();

  const initialTheme = params.theme ?? 'default';
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(initialTheme);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const prefillText = params.prefillText ?? '';
  const prefillMediaUri = params.prefillMediaUri ?? null;
  const prefillMediaType = params.prefillMediaType ?? null;

  return (
    <WaveBackground theme={currentTheme}>
      <SafeAreaView style={styles.safeArea}>
        <Header />

        <View style={styles.content}>
          <HeroSection logoSource={null} />
          <SuggestionPills
            activeTheme={currentTheme}
            onSelectPill={(theme: ThemeType) => setCurrentTheme(theme)}
          />
        </View>

        {showMediaOptions ? (
          <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowMediaOptions(false)} />
        ) : null}

        <View style={styles.bottomSection}>
          <ActionToggles />
        </View>

        <View style={styles.inputLayer} pointerEvents="box-none">
          <InputBar
            initialText={prefillText}
            initialMediaUri={prefillMediaUri}
            initialMediaType={prefillMediaType}
            showOptions={showMediaOptions}
            onShowOptionsChange={setShowMediaOptions}
          />
        </View>
      </SafeAreaView>
    </WaveBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  bottomSection: {
    width: '100%',
  },
  bottomSectionOnTop: {
    zIndex: 2,
    position: 'relative',
  },
});
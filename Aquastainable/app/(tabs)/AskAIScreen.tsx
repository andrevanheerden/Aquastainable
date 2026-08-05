import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, View } from 'react-native';
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

        <View style={styles.bottomSection}>
          <ActionToggles />
          <InputBar
            initialText={prefillText}
            initialMediaUri={prefillMediaUri}
            initialMediaType={prefillMediaType}
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
  bottomSection: {
    width: '100%',
  },
});
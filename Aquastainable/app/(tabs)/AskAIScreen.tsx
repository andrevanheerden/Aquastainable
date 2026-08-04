import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, View } from 'react-native';
import { ThemeType } from '../theme';

import WaveBackground from '../../components/AiAssistant/WaveBackground';
import Header from '../../components/AiAssistant/Header';
import HeroSection from '../../components/AiAssistant/HeroSection';
import SuggestionPills from '../../components/AiAssistant/SuggestionPills';
import ActionToggles from '../../components/AiAssistant/ActionToggles';
import InputBar from '../../components/AiAssistant/InputBar';

export default function AskAIScreen() {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('default');

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
          <InputBar />
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
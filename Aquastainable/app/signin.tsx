import { Link, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Keyboard, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

import Colors from './colors';

const heroImage = require('../assets/logo/Fish.jpeg');

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Image source={heroImage} style={[styles.backgroundImage, keyboardVisible && styles.hiddenBackground]} />

      <View style={styles.content}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue managing your aquarium and plants.</Text>

        <View style={styles.form}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email address"
            placeholderTextColor={Colors.gray}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={Colors.gray}
            style={styles.input}
            secureTextEntry
          />

          <Pressable style={styles.primaryButton} onPress={() => router.replace('/loading')}>
            <Text style={styles.primaryButtonText}>Continue with Email</Text>
          </Pressable>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <Link href="/signup" style={styles.footerLink}>
              <Text style={styles.footerLinkText}>Sign Up</Text>
            </Link>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
    position: 'relative',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '49%',
    resizeMode: 'cover',
    
  },

  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    color: Colors.white,
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.gray,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 28,
    maxWidth: 320,
  },
  form: {
    width: '100%',
  },
  input: {
    width: '100%',
    height: 54,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    paddingHorizontal: 16,
    color: Colors.white,
    marginBottom: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  primaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.waterFill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.waterFill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  secondaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    color: Colors.gray,
    fontSize: 14,
    marginRight: 8,
  },
  footerLink: {
    paddingVertical: 2,
  },
  footerLinkText: {
    color: Colors.waterFill,
    fontSize: 14,
    fontWeight: '700',
  },
  hiddenBackground: {
    height: 0,
    opacity: 0,
  },
});

import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

import Colors from './colors';

const heroImage = require('../assets/logo/Fish.jpeg');

export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.imageWrapper}>
            <Image source={heroImage} style={styles.image} />
          </View>

          <View style={styles.form}>
            <Text style={styles.title}>Create an account</Text>
            <Text style={styles.subtitle}>Create your account and start tracking your aquarium care.</Text>

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
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm password"
              placeholderTextColor={Colors.gray}
              style={styles.input}
              secureTextEntry
            />

            <Pressable style={styles.primaryButton} onPress={() => router.replace('/loading')}>
              <Text style={styles.primaryButtonText}>Continue with Email</Text>
            </Pressable>

            <Pressable style={styles.secondaryButton} onPress={() => {}}>
              <Text style={styles.secondaryButtonText}>Continue with Google</Text>
            </Pressable>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <Link href="/signin" style={styles.footerLink}>
                <Text style={styles.footerLinkText}>Sign In</Text>
              </Link>
            </View>
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
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 36,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 16,
  },
  imageWrapper: {
    width: '100%',
    height: 260,
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  form: {
    padding: 24,
  },
  title: {
    color: Colors.white,
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.gray,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  input: {
    width: '100%',
    height: 52,
    backgroundColor: '#17151B',
    borderRadius: 18,
    paddingHorizontal: 16,
    color: Colors.white,
    marginBottom: 14,
    fontSize: 15,
  },
  primaryButton: {
    width: '100%',
    height: 54,
    borderRadius: 18,
    backgroundColor: Colors.primary,
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
    height: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
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
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
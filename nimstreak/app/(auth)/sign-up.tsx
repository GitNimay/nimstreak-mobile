import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme';
import { signUpWithEmail } from '../../lib/auth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function SignUpScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await signUpWithEmail(email, password, fullName);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.background }]}
      edges={['top', 'left', 'right']}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
          {/* Branding Header */}
          <View style={styles.brandContainer}>
            <View style={styles.brandRow}>
              <Ionicons name="flame" size={36} color={theme.primary} />
              <Text style={[styles.brandTitle, { color: theme.foreground }]}>
                NIMSTREAK
              </Text>
            </View>
            <Text
              style={[
                styles.tagline,
                { color: theme.mutedForeground },
              ]}
            >
              Join the movement. Start tracking.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <Input
              label="Full Name"
              placeholder="YOUR NAME"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />

            <Input
              label="Email"
              placeholder="USER@STREAK.COM"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              isPassword
              autoCapitalize="none"
            />

            <Input
              label="Confirm Password"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword
              autoCapitalize="none"
            />

            {error && (
              <Text style={[styles.errorText, { color: theme.error }]}>
                {error}
              </Text>
            )}

            {/* Create Account Button */}
            <View style={styles.buttonGroup}>
              <Button
                title="CREATE ACCOUNT"
                onPress={handleSignUp}
                loading={loading}
                variant="primary"
              />
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text
              style={[
                styles.footerText,
                { color: theme.foreground + 'CC' },
              ]}
            >
              Already have an account?{' '}
            </Text>
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity>
                <Text
                  style={[
                    styles.footerLink,
                    {
                      color: theme.foreground,
                      borderBottomColor: theme.primary,
                    },
                  ]}
                >
                  SIGN IN
                </Text>
              </TouchableOpacity>
            </Link>
          </View>

        </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  brandTitle: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 40,
    letterSpacing: -3,
    textTransform: 'uppercase',
  },
  tagline: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
  },
  formContainer: {
    gap: 8,
  },
  errorText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 13,
    marginTop: 4,
  },
  buttonGroup: {
    gap: 16,
    marginTop: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  footerText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
  },
  footerLink: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 14,
    borderBottomWidth: 2,
  },
  decorativeBar: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
    opacity: 0.2,
  },
  barSegment: {
    flex: 1,
    height: 6,
  },
});

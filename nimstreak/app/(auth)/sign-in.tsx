import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme';
import { signInWithEmail } from '../../lib/auth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function SignInScreen() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signInWithEmail(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
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
              Build habits. Track streaks. Stay consistent.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <Input
              label="Email"
              placeholder="USER@STREAK.COM"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <View style={styles.passwordHeader}>
              <Text style={[styles.label, { color: theme.foreground }]}>
                PASSWORD
              </Text>
              <TouchableOpacity>
                <Text
                  style={[
                    styles.forgotLink,
                    { color: theme.mutedForeground },
                  ]}
                >
                  Forgot password?
                </Text>
              </TouchableOpacity>
            </View>
            <Input
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              isPassword
              autoCapitalize="none"
            />

            {error && (
              <Text style={[styles.errorText, { color: theme.error }]}>
                {error}
              </Text>
            )}

            {/* Sign In Button */}
            <View style={styles.buttonGroup}>
              <Button
                title="SIGN IN"
                onPress={handleSignIn}
                loading={loading}
                variant="primary"
              />

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View
                  style={[
                    styles.dividerLine,
                    { backgroundColor: theme.foreground + '15' },
                  ]}
                />
                <Text
                  style={[
                    styles.dividerText,
                    { color: theme.mutedForeground + '80' },
                  ]}
                >
                  OR CONNECT VIA
                </Text>
                <View
                  style={[
                    styles.dividerLine,
                    { backgroundColor: theme.foreground + '15' },
                  ]}
                />
              </View>

              {/* Google Button */}
              <Button
                title="CONTINUE WITH GOOGLE"
                onPress={() => {
                  // Google OAuth handled separately
                }}
                variant="outline"
                icon={
                  <Ionicons name="logo-google" size={18} color={theme.foreground} />
                }
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
              Don't have an account?{' '}
            </Text>
            <Link href="/(auth)/sign-up" asChild>
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
                  SIGN UP
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
    marginBottom: 48,
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
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  label: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  forgotLink: {
    fontFamily: 'DMSans-Regular',
    fontSize: 11,
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontFamily: 'SpaceMono-Regular',
    fontSize: 9,
    marginHorizontal: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 48,
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

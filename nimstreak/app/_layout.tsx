import React, { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import {
  SpaceMono_400Regular,
  SpaceMono_700Bold,
} from '@expo-google-fonts/space-mono';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeOut, ZoomIn, useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { ThemeProvider, useTheme } from '../lib/theme';

function SplashLoading() {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Animated.View 
      exiting={FadeOut.duration(400)} 
      style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }}
    >
       <Animated.Text 
         entering={ZoomIn.duration(600)} 
         style={[animatedStyle, { fontFamily: 'SpaceMono-Bold', fontSize: 40, color: '#ffffff', textTransform: 'uppercase', letterSpacing: -2, fontStyle: 'italic' }]}
       >
         NIMSTREAK
       </Animated.Text>
       <ActivityIndicator size="small" color="#bb0014" style={{ marginTop: 24 }} />
    </Animated.View>
  );
}

function RootLayoutNavigation() {
  const { session, isLoading: authLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const theme = useTheme();

  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (!authLoading) {
       setTimeout(() => {
         setShowSplash(false);
       }, 1500); // Premium artificial buffer so the animation correctly plays
    }
  }, [authLoading]);

  useEffect(() => {
    if (authLoading || showSplash) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/sign-in');
    } else if (session && inAuthGroup) {
      router.replace('/(app)');
    }
  }, [session, segments, authLoading, showSplash]);

  if (showSplash) {
    return <SplashLoading />;
  }

  return <Slot />;
}

export default function RootLayout() {
  const { setSession, setLoading } = useAuthStore();

  const [fontsLoaded] = useFonts({
    'SpaceMono-Regular': SpaceMono_400Regular,
    'SpaceMono-Bold': SpaceMono_700Bold,
    'DMSans-Regular': DMSans_400Regular,
    'DMSans-Medium': DMSans_500Medium,
    'DMSans-Bold': DMSans_700Bold,
  });

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#bb0014" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <StatusBar style="dark" />
          <RootLayoutNavigation />
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

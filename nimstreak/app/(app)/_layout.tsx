import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import { useStreakStore } from '../../stores/streakStore';
import { useAuthStore } from '../../stores/authStore';

export default function AppLayout() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const { triggerUpdate, lastUpdate } = useStreakStore();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('avatar_url').eq('id', user.id).single()
        .then(({ data }: { data: any }) => {
          if (data?.avatar_url) setAvatarUrl(data.avatar_url);
        });
    }
  }, [user, lastUpdate]);

  useEffect(() => {
    if (!user) return;

    // Listen to changes across all user's data
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload: any) => {
          console.log('Realtime change received!', payload);
          triggerUpdate(); // Refetch components
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, triggerUpdate]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopWidth: 0,
          borderTopColor: 'transparent',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          borderRadius: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: theme.foreground,
        tabBarInactiveTintColor: theme.mutedForeground,
        tabBarLabelStyle: {
          fontFamily: 'SpaceMono-Bold',
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'HOME',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={focused ? theme.primary : color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'PROFILE',
          tabBarIcon: ({ focused, color }) => (
            <View style={{
                width: 26, 
                height: 26, 
                borderRadius: 13, 
                borderWidth: focused ? 2 : 1, 
                borderColor: focused ? theme.primary : color,
                overflow: 'hidden',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={{ width: '100%', height: '100%', borderRadius: 13 }} />
              ) : (
                <Ionicons
                  name={focused ? 'person' : 'person-outline'}
                  size={16}
                  color={focused ? theme.primary : color}
                />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="streak/create"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="streak/edit"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="streak/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({});

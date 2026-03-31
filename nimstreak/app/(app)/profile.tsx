import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { useTheme } from '../../lib/theme';
import { useAuthStore } from '../../stores/authStore';
import { signOut } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, reset } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    setProfile(data);
    if (data?.full_name) setEditName(data.full_name);
  };

  const handleUpdateName = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: editName })
        .eq('id', user.id);
      if (error) throw error;
      setProfile((prev: any) => ({ ...prev, full_name: editName }));
      setEditing(false);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setLoading(true);
        if (!user) return;
        const filePath = `${user.id}/${Date.now()}.jpg`;
        const { error } = await supabase.storage
          .from('avatars')
          .upload(filePath, decode(result.assets[0].base64), {
            contentType: 'image/jpeg',
          });

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        await supabase
          .from('profiles')
          .update({ avatar_url: publicUrlData.publicUrl })
          .eq('id', user.id);

        setProfile((prev: any) => ({
          ...prev,
          avatar_url: publicUrlData.publicUrl,
        }));
      }
    } catch (err: any) {
      Alert.alert('Upload Failed', err.message || 'Make sure the "avatars" storage bucket exists in Supabase and is public.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await signOut();
            reset();
          } catch (err) {
            console.error(err);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const initial = profile?.full_name
    ? profile.full_name.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || '?';

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.background }]}
    >
      {/* TopAppBar */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: theme.background,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <Text style={[styles.title, { color: theme.foreground }]}>
          PROFILE
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={styles.avatarSection}
        >
          <TouchableOpacity onPress={handlePickImage} disabled={loading}>
            <View
              style={[
                styles.avatarCircle,
                {
                  backgroundColor: theme.primary,
                  borderColor: theme.border,
                  shadowColor: theme.shadow,
                  shadowOffset: { width: 4, height: 4 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 8,
                },
              ]}
            >
              {profile?.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  style={{ width: '100%', height: '100%', borderRadius: 0 }}
                />
              ) : (
                <Text style={[styles.avatarInitial, { color: theme.onPrimary }]}>
                  {initial}
                </Text>
              )}
              <View style={[styles.editBadge, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Ionicons name="camera" size={12} color={theme.foreground} />
              </View>
            </View>
          </TouchableOpacity>

          {editing ? (
            <View style={styles.editNameRow}>
              <TextInput
                style={[styles.nameInput, { color: theme.foreground, borderColor: theme.border, backgroundColor: theme.card }]}
                value={editName}
                onChangeText={setEditName}
                autoFocus
                placeholder="Enter Name"
                placeholderTextColor={theme.mutedForeground}
              />
              <TouchableOpacity onPress={handleUpdateName} style={[styles.saveButton, { backgroundColor: theme.primary, borderColor: theme.border }]}>
                <Ionicons name="checkmark" size={20} color={theme.onPrimary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditing(false)} style={[styles.cancelButton, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Ionicons name="close" size={20} color={theme.foreground} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setEditing(true)} style={styles.nameRow}>
              <Text style={[styles.userName, { color: theme.foreground }]}>
                {profile?.full_name || 'STREAK WARRIOR'}
              </Text>
              <Ionicons name="pencil" size={14} color={theme.mutedForeground} />
            </TouchableOpacity>
          )}

          <Text
            style={[styles.userEmail, { color: theme.mutedForeground }]}
          >
            {user?.email}
          </Text>
        </Animated.View>

        {/* Info Cards */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Card style={{ marginBottom: 16 }}>
            <View style={styles.infoRow}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={theme.mutedForeground}
              />
              <View style={styles.infoContent}>
                <Text
                  style={[
                    styles.infoLabel,
                    { color: theme.mutedForeground },
                  ]}
                >
                  EMAIL
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    { color: theme.foreground },
                  ]}
                >
                  {user?.email}
                </Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Card style={{ marginBottom: 16 }}>
            <View style={styles.infoRow}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={theme.mutedForeground}
              />
              <View style={styles.infoContent}>
                <Text
                  style={[
                    styles.infoLabel,
                    { color: theme.mutedForeground },
                  ]}
                >
                  MEMBER SINCE
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    { color: theme.foreground },
                  ]}
                >
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString()
                    : 'N/A'}
                </Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* App Info */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <View
            style={[
              styles.appInfoSection,
              { borderTopColor: theme.border },
            ]}
          >
            <Text
              style={[
                styles.appInfoTitle,
                { color: theme.foreground },
              ]}
            >
              NIMSTREAK 🔥
            </Text>
            <Text
              style={[
                styles.appInfoVersion,
                { color: theme.mutedForeground },
              ]}
            >
              VERSION 1.0.0
            </Text>
            <Text
              style={[
                styles.appInfoTagline,
                { color: theme.mutedForeground },
              ]}
            >
              Discipline is freedom.
            </Text>
          </View>
        </Animated.View>

        {/* Sign Out */}
        <Animated.View entering={FadeInDown.delay(500).duration(400)}>
          <Button
            title="SIGN OUT"
            onPress={handleSignOut}
            variant="outline"
            loading={loading}
            icon={
              <Ionicons
                name="log-out-outline"
                size={20}
                color={theme.foreground}
              />
            }
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 22,
    textTransform: 'uppercase',
    letterSpacing: -2,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 100,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  editBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    borderWidth: 2,
    padding: 4,
  },
  avatarInitial: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 36,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  nameInput: {
    borderWidth: 2,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontFamily: 'SpaceMono-Bold',
    fontSize: 16,
    minWidth: 150,
  },
  saveButton: {
    borderWidth: 2,
    padding: 6,
  },
  cancelButton: {
    borderWidth: 2,
    padding: 6,
  },
  userName: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 20,
    textTransform: 'uppercase',
    letterSpacing: -1,
  },
  userEmail: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontFamily: 'SpaceMono-Regular',
    fontSize: 9,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    marginTop: 2,
  },
  appInfoSection: {
    borderTopWidth: 2,
    paddingTop: 24,
    marginTop: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  appInfoTitle: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 18,
    letterSpacing: -1,
  },
  appInfoVersion: {
    fontFamily: 'SpaceMono-Regular',
    fontSize: 10,
    marginTop: 4,
    letterSpacing: 2,
  },
  appInfoTagline: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    marginTop: 8,
    fontStyle: 'italic',
  },
});

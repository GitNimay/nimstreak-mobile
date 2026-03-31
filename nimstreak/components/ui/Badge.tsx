import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../lib/theme';

interface BadgeProps {
  text: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  style?: ViewStyle;
}

export default function Badge({
  text,
  variant = 'default',
  style,
}: BadgeProps) {
  const theme = useTheme();

  const getStyles = () => {
    switch (variant) {
      case 'success':
        return { bg: theme.success, text: '#ffffff' };
      case 'warning':
        return { bg: theme.primary, text: '#000000' };
      case 'danger':
        return { bg: theme.primary, text: theme.onPrimary };
      case 'info':
        return { bg: theme.secondary, text: theme.onSecondary };
      default:
        return { bg: theme.muted, text: theme.foreground };
    }
  };

  const colors = getStyles();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          borderColor: theme.border,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: colors.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderRadius: 0,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

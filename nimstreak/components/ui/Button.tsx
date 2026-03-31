import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../lib/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  fullWidth = true,
}: ButtonProps) {
  const theme = useTheme();

  const getButtonStyles = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: disabled ? theme.mutedForeground : theme.primary,
          borderColor: theme.border,
        };
      case 'secondary':
        return {
          backgroundColor: theme.tertiary,
          borderColor: theme.border,
        };
      case 'outline':
        return {
          backgroundColor: theme.card,
          borderColor: theme.border,
        };
      default:
        return {};
    }
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'primary':
        return theme.onPrimary;
      case 'secondary':
        return theme.foreground;
      case 'outline':
        return theme.foreground;
      default:
        return theme.onPrimary;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.9}
      style={[
        styles.button,
        getButtonStyles(),
        fullWidth && styles.fullWidth,
        {
          ...(Platform.OS === 'ios'
            ? {
                shadowColor: theme.shadow,
                shadowOffset: { width: 4, height: 4 },
                shadowOpacity: 1,
                shadowRadius: 0,
              }
            : {}),
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.buttonText,
              { color: getTextColor() },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderRadius: 0,
    gap: 8,
  },
  fullWidth: {
    width: '100%',
  },
  buttonText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
});

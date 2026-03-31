import React, { useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TextInputProps as RNTextInputProps,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme';

interface InputProps extends Omit<RNTextInputProps, 'style'> {
  label?: string;
  error?: string;
  isPassword?: boolean;
  style?: ViewStyle;
}

export default function Input({
  label,
  error,
  isPassword = false,
  style,
  ...props
}: InputProps) {
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text
          style={[
            styles.label,
            { color: theme.foreground },
          ]}
        >
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: error ? theme.error : theme.border,
            backgroundColor: theme.card,
            ...(Platform.OS === 'ios'
              ? {
                  shadowColor: isFocused ? theme.shadow : 'transparent',
                  shadowOffset: { width: 4, height: 4 },
                  shadowOpacity: isFocused ? 1 : 0,
                  shadowRadius: 0,
                }
              : {}),
          },
        ]}
      >
        <RNTextInput
          {...props}
          secureTextEntry={isPassword && !showPassword}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          style={[
            styles.input,
            {
              color: theme.foreground,
              fontFamily: 'SpaceMono-Regular',
            },
          ]}
          placeholderTextColor={theme.mutedForeground + '60'}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={theme.mutedForeground}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={[styles.error, { color: theme.error }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  label: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 0,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  eyeButton: {
    padding: 12,
  },
  error: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    marginTop: 4,
  },
});

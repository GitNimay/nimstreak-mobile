import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme';

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  size?: number;
}

export default function Checkbox({
  checked,
  onToggle,
  size = 24,
}: CheckboxProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.8}>
      <View
        style={[
          styles.checkbox,
          {
            width: size,
            height: size,
            borderColor: theme.border,
            backgroundColor: checked ? theme.primary : theme.card,
          },
        ]}
      >
        {checked && (
          <Ionicons
            name="checkmark"
            size={size * 0.7}
            color={theme.onPrimary}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    borderWidth: 2,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

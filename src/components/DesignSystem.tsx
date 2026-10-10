import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { TOKENS } from '../theme';

export function Panel({ children, style }: { children: ReactNode; style?: any }) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

export function SectionHeader({ title, helper }: { title: string; helper?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {helper ? <Text style={styles.sectionHelper}>{helper}</Text> : null}
    </View>
  );
}

export function Badge({ label, tint = 'pink' }: { label: string; tint?: 'pink' | 'lavender' | 'sky' | 'sage' }) {
  const colors = {
    pink: { bg: '#FDE8EE', fg: TOKENS.colors.navy },
    lavender: { bg: '#F0EAFF', fg: TOKENS.colors.indigo },
    sky: { bg: '#E8F6FF', fg: TOKENS.colors.indigo },
    sage: { bg: '#EAF8F1', fg: TOKENS.colors.indigo },
  };
  const tone = colors[tint];
  return (
    <View style={[styles.badge, { backgroundColor: tone.bg }]}>
      <Text style={[styles.badgeText, { color: tone.fg }]}>{label}</Text>
    </View>
  );
}

export function IdeaButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' ? styles.primaryButton : styles.secondaryButton,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={variant === 'primary' ? styles.primaryButtonText : styles.secondaryButtonText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: TOKENS.colors.card,
    borderRadius: TOKENS.radii.lg,
    borderWidth: 1,
    borderColor: TOKENS.colors.border,
    ...TOKENS.shadows.soft,
  },
  sectionHeader: { marginTop: 6, marginBottom: 12 },
  sectionTitle: { color: TOKENS.colors.ink, fontSize: 17, fontWeight: '800' },
  sectionHelper: { color: TOKENS.colors.muted, fontSize: 11, marginTop: 4 },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: TOKENS.radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  button: {
    minHeight: 44,
    borderRadius: TOKENS.radii.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: TOKENS.colors.pink,
    ...TOKENS.shadows.soft,
  },
  secondaryButton: {
    backgroundColor: TOKENS.colors.paper,
    borderWidth: 1,
    borderColor: TOKENS.colors.border,
  },
  primaryButtonText: { color: TOKENS.colors.paper, fontSize: 12, fontWeight: '800' },
  secondaryButtonText: { color: TOKENS.colors.ink, fontSize: 11, fontWeight: '700' },
  buttonDisabled: { opacity: 0.5 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
});

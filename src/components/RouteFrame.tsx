import React, { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function RouteFrame({ children, storageError }: { children: ReactNode; storageError?: string | null }) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {storageError ? <Text style={styles.storageWarning}>{storageError}</Text> : null}
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF9F1' },
  content: { flex: 1 },
  storageWarning: { backgroundColor: '#FFF0E1', color: '#8A4E20', paddingHorizontal: 16, paddingVertical: 8, fontSize: 12 },
});

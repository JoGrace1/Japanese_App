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
  safeArea: { flex: 1, backgroundColor: '#FFF8EE' },
  content: { flex: 1, backgroundColor: '#FFF8EE' },
  storageWarning: { backgroundColor: '#FFF1D9', color: '#7A553F', paddingHorizontal: 16, paddingVertical: 8, fontSize: 12, borderBottomWidth: 1, borderBottomColor: '#F4D9AE' },
});

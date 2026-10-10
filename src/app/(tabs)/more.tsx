import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Panel, SectionHeader } from '../../components/DesignSystem';
import { RouteFrame } from '../../components/RouteFrame';
import { useProgressStore } from '../../storage/ProgressContext';

const tiles = [
  { title: 'Kana Word Hunt', emoji: '🔎', subtitle: 'Find beginner words', route: '/game' },
  { title: 'Flashcards', emoji: '🗂️', subtitle: 'Review your deck', route: '/cards' },
  { title: 'Stories', emoji: '📖', subtitle: 'Read little lessons', route: '/stories' },
  { title: 'Garden', emoji: '🌸', subtitle: 'Decorate your home', route: '/garden' },
];

export default function MoreRoute() {
  const router = useRouter();
  const { progress, storageError } = useProgressStore();

  return (
    <RouteFrame storageError={storageError}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionHeader title="More adventures" helper="Everything you love in one tiny menu" />
        <Panel style={styles.heroCard}>
          <Text style={styles.eyebrow}>YOUR WORLD</Text>
          <Text style={styles.header}>Little things that grow your day</Text>
          <Text style={styles.subtitle}>{progress.petals} petals saved for your garden</Text>
        </Panel>
        {tiles.map((item) => (
          <Pressable key={item.title} onPress={() => router.push(item.route as any)} style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <View style={styles.copy}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.detail}>{item.subtitle}</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </Pressable>
        ))}
      </ScrollView>
    </RouteFrame>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 28 },
  heroCard: { padding: 18, marginBottom: 18, backgroundColor: '#243C68' },
  eyebrow: { color: '#D8E6FF', fontSize: 10, fontWeight: '800', letterSpacing: 1.6 },
  header: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginTop: 8 },
  subtitle: { color: '#E4EDFF', fontSize: 12, marginTop: 6 },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8DFF0',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#17294B',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  emoji: { fontSize: 28, marginRight: 12 },
  copy: { flex: 1 },
  title: { color: '#1D2742', fontSize: 15, fontWeight: '800' },
  detail: { color: '#5C6A82', fontSize: 11, marginTop: 3 },
  arrow: { color: '#FF7197', fontSize: 22, fontWeight: '700' },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});

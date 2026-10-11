import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GardenScene } from './GardenScene';

interface GardenMapProps {
  restorationStatus: number;
  unlockedGardenLevels: string[];
  ownedDecorationIds: string[];
  onOpenTokyo: () => void;
  onOpenKyoto: () => void;
}

const levels = [
  { id: 'aomori', name: 'Aomori Village', region: 'Northern Japan', emoji: '🏔️', completed: true },
  { id: 'tokyo', name: 'Garden 1 · Tokyo', region: 'Your first restoration', emoji: '🗼', completed: false },
  { id: 'kyoto', name: 'Garden 2 · Kyoto', region: 'The old capital', emoji: '⛩️', completed: false },
  { id: 'osaka', name: 'Garden 3 · Osaka', region: 'A new story awaits', emoji: '🏯', completed: false },
];

export function GardenMap({
  restorationStatus,
  unlockedGardenLevels,
  ownedDecorationIds,
  onOpenTokyo,
  onOpenKyoto,
}: GardenMapProps) {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.intro}>
        <Text style={styles.kicker}>YOUR RESTORATION JOURNEY</Text>
        <Text style={styles.title}>Garden Map</Text>
        <Text style={styles.helper}>Travel through Japan, one peaceful place at a time.</Text>
      </View>
      {levels.map((level, index) => {
        const unlocked = unlockedGardenLevels.includes(level.id);
        const isTokyo = level.id === 'tokyo';
        const isKyoto = level.id === 'kyoto';
        const percentage = level.completed ? 100 : isTokyo ? restorationStatus : 0;
        const pressable = (isTokyo && unlocked) || (isKyoto && unlocked);

        return (
          <View key={level.id} style={styles.levelRow}>
            <View style={styles.pathRail}>
              <View style={[styles.node, unlocked && styles.nodeOpen]}>
                <Text style={styles.nodeText}>{level.completed ? '✓' : unlocked ? `${index}` : '•'}</Text>
              </View>
              {index < levels.length - 1 ? <View style={[styles.connector, unlocked && styles.connectorOpen]} /> : null}
            </View>
            <Pressable
              accessibilityRole={pressable ? 'button' : undefined}
              accessibilityState={{ disabled: !pressable }}
              disabled={!pressable}
              onPress={isTokyo ? onOpenTokyo : isKyoto ? onOpenKyoto : undefined}
              style={({ pressed }) => [
                styles.card,
                !unlocked && styles.lockedCard,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.cardHeading}>
                <View style={styles.regionIcon}><Text style={styles.regionEmoji}>{level.emoji}</Text></View>
                <View style={styles.copy}>
                  <Text style={styles.region}>{level.region.toUpperCase()}</Text>
                  <Text style={styles.name}>{level.name}</Text>
                </View>
                {!unlocked ? <Text style={styles.lock}>🔒</Text> : level.completed ? <Text style={styles.done}>✓</Text> : null}
              </View>
              {isTokyo ? (
                <>
                  <GardenScene
                    compact
                    restorationStatus={restorationStatus}
                    ownedDecorationIds={ownedDecorationIds}
                  />
                  <View style={styles.progressHeading}>
                    <Text style={styles.progressLabel}>Progress</Text>
                    <Text style={styles.progressValue}>{percentage}% Restored</Text>
                  </View>
                  <View style={styles.track}><View style={[styles.fill, { width: `${percentage}%` }]} /></View>
                </>
              ) : (
                <View style={[styles.regionArt, !unlocked && styles.lockedArt]}>
                  <Text style={styles.regionArtText}>
                    {level.completed ? '🌲　🌸　🏡　🌸　🌲' : unlocked ? '🍁　🏯　🍁' : '🌫️　🔒　🌫️'}
                  </Text>
                  {isKyoto && unlocked ? <Text style={styles.available}>UNLOCKED · COMING SOON</Text> : null}
                  {level.completed ? <Text style={styles.available}>VILLAGE VISITED</Text> : null}
                </View>
              )}
              {!unlocked ? <Text style={styles.lockCopy}>Unlock this destination in the Garden Shop.</Text> : null}
            </Pressable>
          </View>
        );
      })}
      <Text style={styles.footer}>More villages will appear as your journey grows.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 32 },
  intro: { marginBottom: 20 },
  kicker: { color: '#9A777A', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: '#4A4A4A', fontSize: 28, fontWeight: '800', marginTop: 4 },
  helper: { color: '#7C7770', fontSize: 12, marginTop: 5 },
  levelRow: { flexDirection: 'row', alignItems: 'stretch' },
  pathRail: { width: 34, alignItems: 'center' },
  node: {
    width: 25,
    height: 25,
    marginTop: 18,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8E3DA',
    borderColor: '#D6CFC2',
    borderWidth: 1,
    zIndex: 1,
  },
  nodeOpen: { backgroundColor: '#F9A8A8', borderColor: '#F9A8A8' },
  nodeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  connector: { width: 2, flex: 1, backgroundColor: '#E3DDD3', position: 'absolute', top: 0, bottom: 0 },
  connectorOpen: { backgroundColor: '#F4C6C2' },
  card: {
    flex: 1,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EFE8DE',
    shadowColor: '#4A4A4A',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  lockedCard: { backgroundColor: '#F5F2EC', borderColor: '#EBE6DD' },
  pressed: { opacity: 0.83, transform: [{ scale: 0.99 }] },
  cardHeading: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  regionIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: '#FBF1E8', alignItems: 'center', justifyContent: 'center' },
  regionEmoji: { fontSize: 23 },
  copy: { flex: 1, marginLeft: 10 },
  region: { color: '#A2877E', fontSize: 8, fontWeight: '800', letterSpacing: 0.8 },
  name: { color: '#4A4A4A', fontSize: 14, fontWeight: '800', marginTop: 3 },
  lock: { fontSize: 17, marginHorizontal: 5 },
  done: { color: '#81AA84', fontSize: 18, fontWeight: '900', marginHorizontal: 6 },
  progressHeading: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, marginBottom: 6 },
  progressLabel: { color: '#716B64', fontSize: 10, fontWeight: '700' },
  progressValue: { color: '#A15F69', fontSize: 10, fontWeight: '800' },
  track: { height: 7, backgroundColor: '#F3E9E6', borderRadius: 6, overflow: 'hidden' },
  fill: { height: 7, backgroundColor: '#F9A8A8', borderRadius: 6 },
  regionArt: { height: 112, borderRadius: 16, backgroundColor: '#E9F1E4', alignItems: 'center', justifyContent: 'center' },
  lockedArt: { backgroundColor: '#E8E5DF' },
  regionArtText: { fontSize: 23 },
  available: { color: '#738C70', fontSize: 8, fontWeight: '800', marginTop: 4, letterSpacing: 0.6 },
  lockCopy: { color: '#817A70', fontSize: 10, marginTop: 9 },
  footer: { color: '#928C82', fontSize: 10, textAlign: 'center', marginTop: 2 },
});

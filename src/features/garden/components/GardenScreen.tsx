import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { UserProgress } from '../../../types';
import {
  GardenProductId,
  getGardenProductStatus,
  GARDEN_PRODUCTS,
} from '../gardenDomain';
import { GardenMap } from './GardenMap';
import { GardenScene } from './GardenScene';
import { GardenShop } from './GardenShop';

type GardenView = 'map' | 'tokyo' | 'kyoto' | 'shop';

interface GardenScreenProps {
  progress: UserProgress;
  onPurchase: (productId: GardenProductId) => void;
}

const tabs: { id: GardenView; label: string; emoji: string }[] = [
  { id: 'map', label: 'Map', emoji: '🗾' },
  { id: 'tokyo', label: 'Tokyo', emoji: '🏡' },
  { id: 'shop', label: 'Shop', emoji: '🛍️' },
];

export function GardenScreen({ progress, onPurchase }: GardenScreenProps) {
  const [view, setView] = useState<GardenView>('map');
  const restorationStatus = progress.restorationStatus ?? 0;
  const unlockedGardenLevels = progress.unlockedGardenLevels ?? ['aomori', 'tokyo'];
  const kitStatus = getGardenProductStatus(progress, 'restoration-kit');
  const kitProduct = GARDEN_PRODUCTS.find((product) => product.id === 'restoration-kit');
  const canRestore = kitStatus === 'available';

  const openTokyo = () => setView('tokyo');
  const openKyoto = () => setView('kyoto');

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>YOUR LITTLE RETREAT</Text>
          <Text style={styles.heading}>My Garden</Text>
        </View>
        <View style={styles.petals}><Text style={styles.petalsText}>🌸 {progress.petalCount}</Text></View>
      </View>
      <View style={styles.navigation}>
        {tabs.map((tab) => (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: view === tab.id }}
            key={tab.id}
            onPress={() => setView(tab.id)}
            style={[styles.navTab, view === tab.id && styles.navTabActive]}
          >
            <Text style={styles.navEmoji}>{tab.emoji}</Text>
            <Text style={[styles.navLabel, view === tab.id && styles.navLabelActive]}>{tab.label}</Text>
          </Pressable>
        ))}
      </View>
      {view === 'map' ? (
        <GardenMap
          restorationStatus={restorationStatus}
          unlockedGardenLevels={unlockedGardenLevels}
          ownedDecorationIds={progress.ownedDecorationIds}
          onOpenTokyo={openTokyo}
          onOpenKyoto={openKyoto}
        />
      ) : view === 'shop' ? (
        <GardenShop progress={progress} onPurchase={onPurchase} />
      ) : view === 'tokyo' ? (
        <ScrollView contentContainerStyle={styles.detailContent} showsVerticalScrollIndicator={false}>
          <Pressable accessibilityRole="button" onPress={() => setView('map')} style={styles.back}>
            <Text style={styles.backText}>‹  Back to map</Text>
          </Pressable>
          <Text style={styles.kicker}>GARDEN 1 · TOKYO</Text>
          <Text style={styles.detailTitle}>A place to make new</Text>
          <GardenScene
            restorationStatus={restorationStatus}
            ownedDecorationIds={progress.ownedDecorationIds}
          />
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Restoration</Text>
              <Text style={styles.progressValue}>{restorationStatus}%</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${restorationStatus}%` }]} />
            </View>
            <Text style={styles.progressCopy}>
              {restorationStatus >= 100
                ? 'The house is mended, the pond is clear, and the blossoms are home.'
                : restorationStatus >= 50
                  ? 'The house is coming back to life. A few more cleanup kits will finish the garden.'
                  : 'Moss and weeds cover the old house. Use a Restoration Kit to clear one part of the garden.'}
            </Text>
          </View>
          <View style={styles.actionCard}>
            <View style={styles.actionCopy}>
              <Text style={styles.actionTitle}>{restorationStatus >= 100 ? 'Tokyo is restored' : 'Restore Area'}</Text>
              <Text style={styles.actionDescription}>
                {restorationStatus >= 100
                  ? 'Your journey to Kyoto can begin from the Garden Shop.'
                  : 'One kit restores up to 25% of the garden.'}
              </Text>
            </View>
            {restorationStatus >= 100 ? (
              <Pressable onPress={() => setView('shop')} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Garden Shop</Text>
              </Pressable>
            ) : (
              <Pressable
                accessibilityRole="button"
                disabled={!canRestore}
                onPress={() => onPurchase('restoration-kit')}
                style={({ pressed }) => [
                  styles.restoreButton,
                  !canRestore && styles.disabledButton,
                  pressed && canRestore && styles.pressed,
                ]}
              >
                <Text style={[styles.restoreButtonText, !canRestore && styles.disabledText]}>
                  {kitStatus === 'insufficient-petals'
                    ? `Need ${kitProduct?.price ?? 20} Petals`
                    : `Restore · ${kitProduct?.price ?? 20}`}
                </Text>
              </Pressable>
            )}
          </View>
          <Text style={styles.rewardHint}>Earn petals in a successful Kana word-game round or by completing a successful flashcard session.</Text>
          <Text style={styles.placeholder}>Free placement and garden stories are planned for a future update.</Text>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.detailContent} showsVerticalScrollIndicator={false}>
          <Pressable accessibilityRole="button" onPress={() => setView('map')} style={styles.back}>
            <Text style={styles.backText}>‹  Back to map</Text>
          </Pressable>
          <Text style={styles.kicker}>GARDEN 2 · KYOTO</Text>
          <Text style={styles.detailTitle}>A new garden awaits</Text>
          <View style={styles.kyotoArt}>
            <Text style={styles.kyotoEmoji}>⛩️</Text>
            <Text style={styles.kyotoEmoji}>🍁</Text>
          </View>
          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>Destination unlocked</Text>
            <Text style={styles.progressCopy}>Kyoto has joined your map. Its restoration story is coming soon.</Text>
          </View>
          <Text style={styles.placeholder}>This is an extensible map destination; the Tokyo restoration cycle is available now.</Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FAF8F3' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 11 },
  kicker: { color: '#9A777A', fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
  heading: { color: '#4A4A4A', fontSize: 25, fontWeight: '800', marginTop: 2 },
  petals: { backgroundColor: '#FCE9E7', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14 },
  petalsText: { color: '#A15F69', fontSize: 12, fontWeight: '800' },
  navigation: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 2, padding: 4, borderRadius: 15, backgroundColor: '#F0EBE3' },
  navTab: { flex: 1, minHeight: 40, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  navTabActive: { backgroundColor: '#FFFFFF', shadowColor: '#4A4A4A', shadowOpacity: 0.06, shadowRadius: 5, elevation: 1 },
  navEmoji: { fontSize: 14 },
  navLabel: { color: '#817A70', fontSize: 10, fontWeight: '700' },
  navLabelActive: { color: '#A15F69' },
  detailContent: { padding: 20, paddingTop: 14, paddingBottom: 32 },
  back: { alignSelf: 'flex-start', paddingVertical: 6, marginBottom: 8 },
  backText: { color: '#A15F69', fontSize: 11, fontWeight: '800' },
  detailTitle: { color: '#4A4A4A', fontSize: 23, fontWeight: '800', marginTop: 4, marginBottom: 14 },
  progressCard: { padding: 15, backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#EFE8DE', marginBottom: 10 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressTitle: { color: '#4A4A4A', fontSize: 13, fontWeight: '800' },
  progressValue: { color: '#A15F69', fontSize: 12, fontWeight: '800' },
  track: { height: 8, backgroundColor: '#F3E9E6', borderRadius: 8, overflow: 'hidden' },
  fill: { height: 8, backgroundColor: '#F9A8A8', borderRadius: 8 },
  progressCopy: { color: '#817A70', fontSize: 10, lineHeight: 15, marginTop: 9 },
  actionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF1EF', borderRadius: 18, padding: 13, marginBottom: 12 },
  actionCopy: { flex: 1, paddingRight: 8 },
  actionTitle: { color: '#4A4A4A', fontSize: 12, fontWeight: '800' },
  actionDescription: { color: '#817A70', fontSize: 9, lineHeight: 13, marginTop: 3 },
  restoreButton: { minHeight: 40, backgroundColor: '#F9A8A8', borderRadius: 13, paddingHorizontal: 11, justifyContent: 'center', alignItems: 'center' },
  restoreButtonText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  disabledButton: { backgroundColor: '#EAE5DD' },
  disabledText: { color: '#898277' },
  secondaryButton: { minHeight: 40, backgroundColor: '#FFFFFF', borderRadius: 13, paddingHorizontal: 12, justifyContent: 'center', alignItems: 'center' },
  secondaryButtonText: { color: '#A15F69', fontSize: 10, fontWeight: '800' },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  rewardHint: { color: '#817A70', fontSize: 10, lineHeight: 15, textAlign: 'center', marginBottom: 9 },
  placeholder: { color: '#A29A8F', fontSize: 9, fontStyle: 'italic', lineHeight: 14, textAlign: 'center', paddingHorizontal: 8, marginTop: 4 },
  kyotoArt: { height: 185, borderRadius: 24, backgroundColor: '#E9EFE2', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 18, marginBottom: 14 },
  kyotoEmoji: { fontSize: 66 },
});

import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { UserProgress } from '../../../types';
import {
  GardenProduct,
  GardenProductCategory,
  GardenProductId,
  GARDEN_PRODUCTS,
  getGardenProductStatus,
} from '../gardenDomain';

interface GardenShopProps {
  progress: UserProgress;
  onPurchase: (productId: GardenProductId) => void;
}

const categories: { id: GardenProductCategory; label: string }[] = [
  { id: 'land', label: 'Land & Upgrades' },
  { id: 'decorations', label: 'Decorations' },
];

function purchaseLabel(product: GardenProduct, status: ReturnType<typeof getGardenProductStatus>): string {
  if (status === 'already-restored') return 'Fully Restored';
  if (status === 'already-owned') return 'Owned';
  if (status === 'insufficient-petals') return 'Need more';
  return `Buy · ${product.price} Petals`;
}

export function GardenShop({ progress, onPurchase }: GardenShopProps) {
  const [category, setCategory] = useState<GardenProductCategory>('land');
  const products = GARDEN_PRODUCTS.filter((product) => product.category === category);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.intro}>
        <Text style={styles.kicker}>A LITTLE SOMETHING FOR YOUR GARDEN</Text>
        <Text style={styles.title}>Garden Shop</Text>
        <Text style={styles.helper}>Spend petals carefully — each purchase is saved on your device.</Text>
      </View>
      <View style={styles.tabs}>
        {categories.map((item) => (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: category === item.id }}
            key={item.id}
            onPress={() => setCategory(item.id)}
            style={[styles.tab, category === item.id && styles.activeTab]}
          >
            <Text style={[styles.tabText, category === item.id && styles.activeTabText]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
      {products.map((product) => {
        const status = getGardenProductStatus(progress, product.id);
        const disabled = status !== 'available';
        return (
          <View key={product.id} style={styles.product}>
            <View style={styles.productIcon}><Text style={styles.emoji}>{product.emoji}</Text></View>
            <View style={styles.copy}>
              <Text style={styles.name}>{product.name}</Text>
              <Text style={styles.description}>{product.description}</Text>
              <Text style={[styles.price, status === 'insufficient-petals' && styles.insufficient]}>
                {status === 'already-restored'
                  ? 'Tokyo garden is complete'
                  : status === 'already-owned'
                    ? 'Already part of your collection'
                    : status === 'insufficient-petals'
                      ? `Need ${product.price - progress.petalCount} more petals · ${product.price} total`
                    : `🌸 ${product.price} petals`}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              disabled={disabled}
              onPress={() => onPurchase(product.id)}
              style={({ pressed }) => [
                styles.button,
                disabled && styles.disabledButton,
                pressed && !disabled && styles.pressed,
              ]}
            >
              <Text style={[styles.buttonText, disabled && styles.disabledButtonText]}>{purchaseLabel(product, status)}</Text>
            </Pressable>
          </View>
        );
      })}
      {category === 'decorations' ? (
        <View style={styles.note}>
          <Text style={styles.noteTitle}>Predefined garden layouts</Text>
          <Text style={styles.noteText}>Decorations appear in their fixed places when Tokyo is fully restored. Free placement is planned for a future update.</Text>
        </View>
      ) : (
        <View style={styles.note}>
          <Text style={styles.noteTitle}>Restore a little at a time</Text>
          <Text style={styles.noteText}>Each Tokyo Restoration Kit costs 20 petals and restores up to 25%. The Kyoto package unlocks its map destination; that garden is coming soon.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 32 },
  intro: { marginBottom: 18 },
  kicker: { color: '#9A777A', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  title: { color: '#4A4A4A', fontSize: 27, fontWeight: '800', marginTop: 4 },
  helper: { color: '#7C7770', fontSize: 11, lineHeight: 16, marginTop: 5 },
  tabs: { flexDirection: 'row', backgroundColor: '#F0EBE3', padding: 4, borderRadius: 15, marginBottom: 13 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  activeTab: { backgroundColor: '#FFFFFF', shadowColor: '#4A4A4A', shadowOpacity: 0.06, shadowRadius: 5, elevation: 1 },
  tabText: { color: '#817A70', fontSize: 10, fontWeight: '700' },
  activeTabText: { color: '#A15F69' },
  product: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#EFE8DE',
    borderWidth: 1,
    borderRadius: 18,
    padding: 11,
    marginBottom: 9,
  },
  productIcon: { width: 43, height: 43, borderRadius: 14, backgroundColor: '#F9F1EA', alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 25 },
  copy: { flex: 1, paddingHorizontal: 9 },
  name: { color: '#4A4A4A', fontSize: 11, fontWeight: '800' },
  description: { color: '#817A70', fontSize: 9, lineHeight: 13, marginTop: 3 },
  price: { color: '#A15F69', fontSize: 9, fontWeight: '800', marginTop: 5 },
  insufficient: { color: '#938C82' },
  button: { minWidth: 82, borderRadius: 12, backgroundColor: '#F9A8A8', paddingVertical: 9, paddingHorizontal: 8, alignItems: 'center' },
  disabledButton: { backgroundColor: '#EFEAE3' },
  buttonText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800', textAlign: 'center' },
  disabledButtonText: { color: '#898277' },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  note: { backgroundColor: '#F6F1E9', borderRadius: 16, padding: 13, marginTop: 4 },
  noteTitle: { color: '#4A4A4A', fontSize: 11, fontWeight: '800' },
  noteText: { color: '#817A70', fontSize: 10, lineHeight: 15, marginTop: 5 },
});

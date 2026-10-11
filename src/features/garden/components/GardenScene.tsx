import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface GardenSceneProps {
  restorationStatus: number;
  ownedDecorationIds: string[];
  compact?: boolean;
}

function JapaneseHouse({ restorationStatus, compact }: { restorationStatus: number; compact: boolean }) {
  const cleaned = restorationStatus >= 50;
  return (
    <View style={[styles.house, compact && styles.compactHouse]}>
      <View style={[styles.roof, !cleaned && restorationStatus > 0 && styles.partialRoof, cleaned && styles.cleanRoof]} />
      <View style={[styles.houseBody, cleaned && styles.cleanHouseBody]}>
        <View style={[styles.window, styles.leftWindow]}><View style={styles.windowCrossbar} /></View>
        <View style={[styles.window, styles.rightWindow]}><View style={styles.windowCrossbar} /></View>
        <View style={[styles.door, cleaned && styles.cleanDoor]} />
      </View>
      {!cleaned && restorationStatus === 0 ? <Text style={styles.moss}>🌿</Text> : null}
    </View>
  );
}

export function GardenScene({
  restorationStatus,
  ownedDecorationIds,
  compact = false,
}: GardenSceneProps) {
  const cleaned = restorationStatus >= 50;
  const restored = restorationStatus >= 100;
  const started = restorationStatus > 0;
  const show = (id: string) => ownedDecorationIds.includes(id);

  return (
    <View
      accessibilityLabel={`Tokyo garden, ${restorationStatus}% restored`}
      style={[styles.scene, compact && styles.compactScene, cleaned && styles.cleanScene]}
    >
      <Text style={[styles.sun, compact && styles.compactText]}>☀️</Text>
      <Text style={[styles.cloud, compact && styles.compactText]}>☁️</Text>
      <View style={styles.skyline}>
        <Text style={[styles.bamboo, compact && styles.compactText]}>{cleaned ? '🎋' : '🌿'}</Text>
        <JapaneseHouse compact={compact} restorationStatus={restorationStatus} />
        <Text style={[styles.tree, compact && styles.compactText]}>
          {restored ? '🌸' : cleaned ? '🌳' : '🌿'}
        </Text>
      </View>
      <View style={[styles.ground, started && styles.partialGround, cleaned && styles.cleanGround]} />
      {restored ? (
        <>
          <View style={styles.pond}><Text style={styles.koi}>🐟</Text><Text style={styles.koiSecond}>🐠</Text></View>
          <Text style={styles.bridge}>🌉</Text>
          <Text style={styles.path}>🪨　🪨　🪨</Text>
        </>
      ) : (
        <Text style={styles.roughGround}>{cleaned ? '🪨　🌱　🪨' : '🪨　🌿　🪨　🌱'}</Text>
      )}
      {(restored && show('lantern')) ? <Text style={styles.lantern}>🏮</Text> : null}
      {(restored && show('stone-path')) ? <Text style={styles.extraPath}>▫️ ▫️ ▫️</Text> : null}
      {(restored && show('cherry-tree')) ? <Text style={styles.extraBlossoms}>🌸</Text> : null}
      {(restored && show('koi-pond')) ? <Text style={styles.extraKoi}>🐟</Text> : null}
      <Text style={[styles.caption, compact && styles.compactCaption]}>
        {restored ? 'Tokyo · restored' : cleaned ? 'Tokyo · clearing the way' : started ? 'Tokyo · first cleanup' : 'Tokyo · waiting to bloom'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: {
    height: 228,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#DCEDE9',
    borderColor: '#D5E7DE',
    borderWidth: 1,
    position: 'relative',
    marginBottom: 16,
  },
  compactScene: { height: 112, marginBottom: 0, borderRadius: 16 },
  cleanScene: { backgroundColor: '#E6F3EC' },
  sun: { position: 'absolute', right: 17, top: 12, fontSize: 24 },
  cloud: { position: 'absolute', left: 15, top: 22, fontSize: 22 },
  skyline: {
    position: 'absolute',
    zIndex: 2,
    top: 42,
    left: 12,
    right: 12,
    height: 106,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  bamboo: { fontSize: 37 },
  house: { width: 86, height: 83, alignItems: 'center', justifyContent: 'flex-end', position: 'relative' },
  compactHouse: { transform: [{ scale: 0.63 }], marginHorizontal: -12, marginBottom: -12 },
  roof: {
    position: 'absolute',
    zIndex: 1,
    top: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 47,
    borderRightWidth: 47,
    borderBottomWidth: 35,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#6E6355',
  },
  partialRoof: { borderBottomColor: '#7E5446' },
  cleanRoof: { borderBottomColor: '#9C5355' },
  houseBody: {
    width: 68,
    height: 51,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#8F765D',
    borderWidth: 2,
    borderColor: '#6E6355',
    borderTopWidth: 0,
  },
  cleanHouseBody: { backgroundColor: '#F0D6B4', borderColor: '#9C5355' },
  window: { width: 12, height: 13, backgroundColor: '#A7C6BE', borderWidth: 2, borderColor: '#5E5449' },
  leftWindow: { marginLeft: 4 },
  rightWindow: { marginRight: 4 },
  windowCrossbar: { width: 2, height: 11, alignSelf: 'center', backgroundColor: '#5E5449' },
  door: { position: 'absolute', bottom: 0, width: 15, height: 28, backgroundColor: '#5B493B', borderTopLeftRadius: 5, borderTopRightRadius: 5 },
  cleanDoor: { backgroundColor: '#9C5355' },
  moss: { position: 'absolute', top: 9, right: 9, fontSize: 16 },
  tree: { fontSize: 45 },
  compactText: { fontSize: 25 },
  ground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 84,
    backgroundColor: '#AFA88C',
  },
  partialGround: { backgroundColor: '#B9AD91' },
  cleanGround: { backgroundColor: '#BBD9AC' },
  roughGround: { position: 'absolute', bottom: 35, alignSelf: 'center', fontSize: 17 },
  pond: {
    position: 'absolute',
    bottom: 34,
    right: '13%',
    width: 94,
    height: 37,
    borderRadius: 30,
    backgroundColor: '#83CBD0',
    borderWidth: 3,
    borderColor: '#6FA88F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  koi: { position: 'absolute', left: 13, fontSize: 15 },
  koiSecond: { position: 'absolute', right: 12, fontSize: 13 },
  bridge: { position: 'absolute', bottom: 58, right: '21%', fontSize: 25 },
  path: { position: 'absolute', bottom: 8, alignSelf: 'center', fontSize: 12 },
  lantern: { position: 'absolute', right: 19, bottom: 51, fontSize: 24 },
  extraPath: { position: 'absolute', left: 20, bottom: 12, fontSize: 11 },
  extraBlossoms: { position: 'absolute', left: 30, top: 72, fontSize: 18 },
  extraKoi: { position: 'absolute', right: '27%', bottom: 44, fontSize: 12 },
  caption: {
    position: 'absolute',
    left: 12,
    bottom: 10,
    color: '#4A4A4A',
    backgroundColor: '#FFFFFFD9',
    borderRadius: 10,
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 5,
    fontSize: 10,
    fontWeight: '800',
  },
  compactCaption: { fontSize: 8, left: 7, bottom: 6, paddingHorizontal: 6, paddingVertical: 3 },
});

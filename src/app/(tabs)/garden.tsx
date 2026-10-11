import React from 'react';
import { RouteFrame } from '../../components/RouteFrame';
import { GardenScreen } from '../../features/garden/components/GardenScreen';
import { useProgressStore } from '../../storage/ProgressContext';

export default function GardenRoute() {
  const store = useProgressStore();
  return (
    <RouteFrame storageError={store.storageError}>
      <GardenScreen
        progress={store.progress}
        onPurchase={store.purchaseGardenProduct}
      />
    </RouteFrame>
  );
}

import React from 'react';
import { GardenScreen } from '../../../App';
import { RouteFrame } from '../../components/RouteFrame';
import { useProgressStore } from '../../storage/ProgressContext';

export default function GardenRoute() {
  const store = useProgressStore();
  return (
    <RouteFrame storageError={store.storageError}>
      <GardenScreen
        petals={store.progress.petals}
        ownedDecorationIds={store.progress.ownedDecorationIds}
        buyDecoration={store.buyDecoration}
      />
    </RouteFrame>
  );
}

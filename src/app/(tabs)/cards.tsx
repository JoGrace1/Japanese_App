import React from 'react';
import { FlashcardsScreen } from '../../../App';
import { RouteFrame } from '../../components/RouteFrame';
import { useProgressStore } from '../../storage/ProgressContext';

export default function CardsRoute() {
  const store = useProgressStore();
  return (
    <RouteFrame storageError={store.storageError}>
      <FlashcardsScreen
        progress={store.progress}
        recordReview={store.recordReview}
        awardActivity={store.awardActivity}
      />
    </RouteFrame>
  );
}

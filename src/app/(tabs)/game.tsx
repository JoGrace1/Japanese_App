import { useRouter } from 'expo-router';
import React from 'react';
import { GameScreen } from '../../../App';
import { RouteFrame } from '../../components/RouteFrame';
import { useProgressStore } from '../../storage/ProgressContext';

export default function GameRoute() {
  const { progress, storageError, awardActivity } = useProgressStore();
  const router = useRouter();
  return (
    <RouteFrame storageError={storageError}>
      <GameScreen
        completedLevels={progress.completedLevels}
        awardActivity={awardActivity}
        onHome={() => router.push('/garden')}
      />
    </RouteFrame>
  );
}

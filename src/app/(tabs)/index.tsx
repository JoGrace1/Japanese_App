import { useRouter } from 'expo-router';
import React from 'react';
import { HomeScreen, Section } from '../../../App';
import { RouteFrame } from '../../components/RouteFrame';
import { useProgressStore } from '../../storage/ProgressContext';

export default function HomeRoute() {
  const { progress, storageError } = useProgressStore();
  const router = useRouter();

  const navigate = (section: Section) => {
    switch (section) {
      case 'game': router.push('/game'); break;
      case 'cards': router.push('/cards'); break;
      case 'stories': router.push('/stories'); break;
      case 'garden': router.push('/garden'); break;
      case 'progress': router.push('/progress'); break;
      case 'home': router.push('/'); break;
    }
  };

  return <RouteFrame storageError={storageError}><HomeScreen progress={progress} onNavigate={navigate} /></RouteFrame>;
}

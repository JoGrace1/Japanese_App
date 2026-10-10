import React from 'react';
import { ProgressScreen } from '../../../App';
import { RouteFrame } from '../../components/RouteFrame';
import { useProgressStore } from '../../storage/ProgressContext';

export default function ProgressRoute() {
  const { progress, storageError } = useProgressStore();
  return <RouteFrame storageError={storageError}><ProgressScreen progress={progress} /></RouteFrame>;
}

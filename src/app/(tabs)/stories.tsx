import React from 'react';
import { StoriesScreen } from '../../../App';
import { RouteFrame } from '../../components/RouteFrame';
import { useProgressStore } from '../../storage/ProgressContext';

export default function StoriesRoute() {
  const store = useProgressStore();
  return (
    <RouteFrame storageError={store.storageError}>
      <StoriesScreen
        completedStoryIds={store.progress.storiesCompleted}
        completeStory={store.completeStory}
      />
    </RouteFrame>
  );
}

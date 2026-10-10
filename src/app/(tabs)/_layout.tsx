import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';

const tabs = [
  { name: 'index', title: 'Home', emoji: '🏡' },
  { name: 'game', title: 'Play', emoji: '🎮' },
  { name: 'cards', title: 'Cards', emoji: '🗂️' },
  { name: 'stories', title: 'Stories', emoji: '📖' },
  { name: 'garden', title: 'Garden', emoji: '🌸' },
  { name: 'progress', title: 'Progress', emoji: '🌱' },
];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#D98091',
        tabBarInactiveTintColor: '#A4999C',
        tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#F0E5DF', minHeight: 58, paddingTop: 5 },
        tabBarLabelStyle: { fontSize: 9, fontWeight: '700', marginBottom: 3 },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused }) => <Text style={{ fontSize: focused ? 18 : 17 }}>{tab.emoji}</Text>,
          }}
        />
      ))}
    </Tabs>
  );
}

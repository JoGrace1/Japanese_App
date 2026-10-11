import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';

const tabs = [
  { name: 'index', title: 'Home', emoji: '🏡' },
  { name: 'game', title: 'Game', emoji: '🎮' },
  { name: 'cards', title: 'Cards', emoji: '🗂️' },
  { name: 'stories', title: 'Stories', emoji: '📖' },
  { name: 'garden', title: 'Garden', emoji: '🌸' },
  { name: 'more', title: 'More', emoji: '☰' },
];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF7197',
        tabBarInactiveTintColor: '#6A7891',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E8DFF0',
          minHeight: 68,
          paddingTop: 8,
          paddingBottom: 8,
          shadowColor: '#17294B',
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 6,
        },
        tabBarLabelStyle: { fontSize: 9, fontWeight: '800', marginTop: 3 },
        tabBarItemStyle: { paddingVertical: 4 },
      }}
    >
      {tabs.map((tab, index) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused }) => <Text style={{ fontSize: focused ? 19 : 18 }}>{tab.emoji}</Text>,
            tabBarItemStyle: index >= 4 ? { marginLeft: 4 } : undefined,
          }}
        />
      ))}
    </Tabs>
  );
}

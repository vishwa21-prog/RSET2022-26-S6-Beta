import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const setupNotifications = async () => {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('emergency', {
        name: 'Emergency alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF0000',
      });
    }

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Notification permission not granted');
      return false;
    }
    return true;
  } catch (error) {
    console.error('Notification setup error:', error);
    return false;
  }
};

export const sendSOSNotification = async (location: string) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🚨 SOS ACTIVATED',
        body: 'Emergency contacts notified',
        data: { location },
        sticky: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        sound: 'default',
        vibrate: [0, 250, 250, 250],
      },
      trigger: null,
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
    throw error;
  }
};
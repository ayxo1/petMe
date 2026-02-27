import React from 'react';
import { Text, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

const PawOverlay = (screenHeight: number) => {

    const pawTranslateY = useSharedValue(screenHeight);
    const pawTranslateX = useSharedValue(0);
    const pawOpacity = useSharedValue(0);
    const touchY = useSharedValue(0);

  return (
    <View>
      <Text>PawOverlay</Text>
    </View>
  )
}

export default PawOverlay;
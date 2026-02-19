import { useState } from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';

const AvatarComponent = ({ uri, style = 'w-24 h-24 rounded-2xl' }: { uri: string; style?: string; }) => {
    const [loaded, setLoaded] = useState(false);

  return (
    <View className='items-center'>
        {!loaded && (
            <View className='items-center justify-center absolute top-[35%] left-[35%]'>
                <ActivityIndicator size='small' />
            </View>
        )}
        <Image 
            source={{ uri: uri }}
            onLoad={() => setLoaded(true)}
            className={`display-${loaded ? 'flex' : 'none'} ${style}`}
        />
    </View>
  )
}

export default AvatarComponent;
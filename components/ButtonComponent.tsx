import { ButtonComponentProps } from '@/type';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

const ButtonComponent = ({
  onPress,
  title = 'i am clickable',
  style,
  textStyle,
  leftIcon,
  isLoading = false
} : ButtonComponentProps) => {
  return (
    <TouchableOpacity
      className={`custom-btn ${style}`}
      onPress={onPress} 
    >
      {leftIcon}
      <View
        className='flex-center flex-row'
      >
        {isLoading ? (
          <ActivityIndicator
          size='small'
          color='white'
          />
        ) : (
          <Text
            className={`text-black text-base ${textStyle}`}
          >{title}</Text>
        )}
      </View>
    </TouchableOpacity>
  )
}

export default ButtonComponent
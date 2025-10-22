import { ButtonComponentProps } from '@/type';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

const ButtonComponent = ({
  onPress,
  title = 'i am clickable',
  style,
  textStyle,
  leftIcon,
  isLoading = false,
  disabled = false
} : ButtonComponentProps) => {
  return (
    <View
      className='self-center'
    >
      <TouchableOpacity
        className={`custom-btn ${style}`}
        onPress={onPress} 
        disabled={isLoading || disabled}
      >
        {leftIcon}
        <View
          // className='flex-center flex-row'
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
    </View>
  )
}

export default ButtonComponent
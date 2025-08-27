import { InputComponentProps } from '@/type';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

const InputComponent = ({
    placeholder = 'enter text here',
    value,
    onChangeText,
    label,
    secureTextEntry = false,
    keyboardType = 'default'
}: InputComponentProps) => {

    const [isFocused, setIsFocused] = useState(false);

  return (
    <View
        className='w-full'
    >
      <Text className='label'>
        {label}
      </Text>
      <TextInput 
        autoCapitalize='none'
        autoCorrect={false}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        placeholderTextColor='#888'
        className={`input ${isFocused ? 'border-amber-700' : 'border-gray-300'}`}
      />
    </View>
  )
}

export default InputComponent;
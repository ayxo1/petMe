import { InputComponentProps } from '@/types/components';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

const InputComponent = ({
    placeholder = 'enter text here',
    value,
    onChangeText,
    label,
    secureTextEntry = false,
    keyboardType = 'default',
    labelStyling = '',
    multiline = false,
    spellCheck = false,
    textContentType = undefined
}: InputComponentProps) => {

    const [isFocused, setIsFocused] = useState(false);

  return (
    <View
        className='w-full items-start'
    >
      <Text className={`label ${labelStyling}`}>
        {label}
      </Text>
      <TextInput
        numberOfLines={4}
        multiline={multiline}
        maxLength={240}
        autoCapitalize='none'
        autoCorrect={spellCheck}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        placeholderTextColor='#888'
        className={`input ${isFocused ? 'border-amber-700' : 'border-lighterSecondary'}`}
        spellCheck={spellCheck}
        textContentType={textContentType}
      />
    </View>
  )
}

export default InputComponent;
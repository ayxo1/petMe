// import { FormInputControllerProps } from '@/types/components';
import { FormInputControllerProps } from '@/type';
import React from 'react';
import { Controller } from 'react-hook-form';
import { Text } from 'react-native';

import InputComponent from '../InputComponent';

const InputController = (
  { control, 
    errors, 
    name, 
    placeholder, 
    label, 
    keyboardType, 
    secureTextEntry = false 
  }: FormInputControllerProps) => {

  return (
    <>
      <Controller
        name={name}
        control={control}
        render={({field: {onChange, onBlur, value}}) => {
          return (
            <InputComponent 
              placeholder={placeholder}
              value={value}
              onChangeText={onChange}
              label={label}
              keyboardType={keyboardType}
              secureTextEntry={secureTextEntry}
              // onBlur={onBlur}
            />
          )
        }}
      />
      {errors && errors[name] && (
        <Text className='text-red-500 text-center'>
          {errors[name]?.message?.toString() || 'Invalid data'}
        </Text>
      )}
    </>
  )
}

export default InputController
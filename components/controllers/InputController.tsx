import { FormInputControllerProps } from '@/type';
import React, { FC } from 'react';
import { Control, Controller, FieldErrors, FieldValues, useForm } from 'react-hook-form';
import { Text, View } from 'react-native';

import InputComponent from '../InputComponent';

const InputController: FC<FormInputControllerProps> = ({ control, errors, name, placeholder, label, keyboardType, secureTextEntry = false }) => {

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
      {errors && errors[name] && <Text className='text-red-500 text-center'>{errors[name]?.message}</Text>}
    </>
  )
}

export default InputController
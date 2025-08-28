import ButtonComponent from '@/components/ButtonComponent';
import InputController from '@/components/controllers/InputController';
import { authSchema } from '@/constants/schemas/authSchemas';
import { FormInputData, SignUpFormData } from '@/type';
import { yupResolver } from '@hookform/resolvers/yup';
import { Fragment } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';

const FormComponent = ({ formInputData }: 
  {formInputData: FormInputData[]}
) => {

  const {
    control,
    handleSubmit,
    formState: {
      errors
    }
  } = useForm({
    resolver: yupResolver(authSchema)
  })

  const submit = (data: SignUpFormData) => {
    console.log(data);
  }

  console.log(JSON.stringify(errors, null, 3));
  

  return (
    <View
      className='gap-3 rounded-lg p-5'
    >
      {formInputData.map((inputController, index) => (
        <Fragment key={index}>
          <InputController
            control={control}
            errors={errors}
            name={inputController.name}
            placeholder={inputController.placeholder}
            label={inputController.label}
            keyboardType={inputController?.keyboardType}
          />
        </Fragment>
      ))}
      <ButtonComponent title='submit' onPress={handleSubmit(submit)}/>
    </View>
  )
};

export default FormComponent;
import ButtonComponent from '@/components/ButtonComponent';
import InputController from '@/components/controllers/InputController';
import { FormInputData } from '@/type';
import { yupResolver } from '@hookform/resolvers/yup';
import { Fragment } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { AnyObject, ObjectSchema } from 'yup';

interface FormComponentProps<T extends AnyObject> {
  formInputData: FormInputData[];
  submit: (data: T) => void;
  validationSchema: ObjectSchema<T>
}

const FormComponent = <T extends AnyObject>({ formInputData, submit, validationSchema }: FormComponentProps<T>) => {

  const {
    control,
    handleSubmit,
    formState: {
      errors
    }
  } = useForm<T>({
    resolver: yupResolver(validationSchema)
  })

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
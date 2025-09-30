
declare global {
}

interface InputComponentProps {
  placeholder: string;
  value?: string;
  onChangeText?: (text: string) => void;
  label: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
}

export interface FormInputControllerProps extends InputComponentProps {
  control: Control<FieldValues>;
  errors?: FieldErrors<FieldValues>;
  name: string;
}

interface SignInFormData {
  email: string;
  password: string;
}

interface SignUpFormData extends SignInFormData {
  username: string;
}

type FormInputData = Omit<FormInputControllerProps, 'control'>;

interface ButtonComponentProps {
  onPress?: () => void;
  title?: string;
  style?: string;
  textStyle?: string;
  leftIcon?: React.ReactNode;
  isLoading?: boolean;
}

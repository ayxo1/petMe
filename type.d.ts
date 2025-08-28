export interface TabBarIconProps {
    focused: boolean;
    icon: ImageSourcePropType
}

interface ProfileCardProps {
  profileImage: ImageSourcePropType;
  profileName: string;
  profileDescription: string;
}

interface InputComponentProps {
  placeholder: string;
  value?: string;
  onChangeText?: (text: string) => void;
  label: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
}

interface FormInputControllerProps extends InputComponentProps {
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

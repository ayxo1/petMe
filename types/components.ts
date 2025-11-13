import { Control, FieldErrors, FieldValues } from "react-hook-form";
import { ImageSourcePropType } from "react-native";

export interface TabBarIconProps {
    focused: boolean;
    icon: ImageSourcePropType
}

export interface ProfileCardProps {
  profileImages: ImageSourcePropType[];
  profileName: string;
  profileDescription: string;
}

export interface InputComponentProps {
  placeholder: string;
  value?: string;
  onChangeText?: (text: string) => void;
  label: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
}

export interface FormInputControllerProps<
TFieldValues extends FieldValues = FieldValues
> extends InputComponentProps {
  control: Control<TFieldValues>;
  errors?: FieldErrors<TFieldValues>;
  name: string;
}

export type FormInputData = Omit<FormInputControllerProps, 'control'>

export interface ButtonComponentProps {
  onPress?: () => void;
  title?: string;
  style?: string;
  textStyle?: string;
  leftIcon?: React.ReactNode;
  isLoading?: boolean;
}
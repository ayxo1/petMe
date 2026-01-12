import { Control, FieldErrors, FieldValues } from "react-hook-form";
import { ImageSourcePropType } from "react-native";
import { PBUser } from "./pbTypes";

export interface TabBarIconProps {
    focused: boolean;
    icon: ImageSourcePropType;
    red?: boolean;
}

export interface ProfileCardProps {
  profileImages: string[];
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
  labelStyling?: string;
  multiline?: boolean
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

export interface MatchRowData {
  matchId: string;
  matchedUser: PBUser;
  petName: string;
}
import { RecordModel } from "pocketbase";
import { Control, FieldErrors, FieldValues } from "react-hook-form";
import { ImageSourcePropType, TextInput } from "react-native";
import { FeedProfile } from "./feed";
import { PBUser } from "./pbTypes";

export interface TabBarIconProps {
    focused: boolean;
    icon: ImageSourcePropType;
    red?: boolean;
}

export interface ProfileCardProps {
  profile: Partial<FeedProfile>
}

export interface InputComponentProps {
  placeholder: string;
  value?: string;
  onChangeText?: (text: string) => void;
  label: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  labelStyling?: string;
  multiline?: boolean;
  spellCheck?: boolean;
  textContentType?: 'oneTimeCode' | 'password' | undefined;
  generalStyle?: string;
  ref?: React.RefObject<TextInput | null>;
  autoFocus?: boolean;
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
  shelterName?: string;
  lastMessage?: string;
  lastMessageTime?: string;
}

export interface PBEventPage extends RecordModel {
    id: string;
    organizerId: string;
    organizerName: string;
    eventName: string;
    date: string;
    synopse: string;
    description: string;
    address: string;
    image?: string;
    allowMessaging: boolean;
    // createdAt: string;
}

export interface Comment extends RecordModel {
  id: string;
  eventId: string;
  authorId: string;
  authorName: string;
  text: string;
  parentId: string;
  created: string;
}

export type EventPageParams = {
  [K in keyof PBEventPage]: string;
}
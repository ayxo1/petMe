import React from 'react';
import { Keyboard, KeyboardAvoidingView, ModalProps, Platform, Pressable, Modal as RNModal, View } from 'react-native';

interface ModalComponentProps extends ModalProps {
    isOpen: boolean;
    withInput?: boolean;
    toggleModal: (isOpen: boolean) => void;
    styleProps?: string;
    tint?: boolean
}

const Modal = ({ isOpen, withInput, children, toggleModal, styleProps = 'bg-white/80', tint = true, ...props }: ModalComponentProps) => {
    const styles = 'items-center justify-center rounded-2xl'
    const content = withInput
        ?   
            (<KeyboardAvoidingView
                className={styles}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {children}
            </KeyboardAvoidingView>)
            
        :   (<View
                className={styles}
            >
                {children}
            </View>);

  return (
    <RNModal
        visible={isOpen}
        transparent
        animationType='fade'
        statusBarTranslucent
        {...props}
    >
        <Pressable
            className={`flex-1 justify-center items-center ${tint && 'bg-black/55'}`}
            onPress={() => toggleModal(!isOpen)}
        >
            <Pressable 
                className={`rounded-3xl ${styleProps}`}
                onPress={e => {
                    e.stopPropagation();
                    Keyboard.dismiss();
                }}
            >
                {content}
            </Pressable>
        </Pressable>

    </RNModal>
  )
}

export default Modal;
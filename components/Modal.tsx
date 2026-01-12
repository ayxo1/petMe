import React from 'react';
import { Keyboard, KeyboardAvoidingView, ModalProps, Platform, Pressable, Modal as RNModal, TouchableWithoutFeedback, View } from 'react-native';

interface ModalComponentProps extends ModalProps {
    isOpen: boolean;
    withInput?: boolean;
    toggleModal: (isOpen: boolean) => void;
}

const Modal = ({ isOpen, withInput, children, toggleModal, ...props }: ModalComponentProps) => {
    const styles = 'items-center justify-center h-[60%] rounded-2xl'
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
            className="flex-1 justify-center items-center bg-black/20"
            onPress={() => toggleModal(!isOpen)}
        >
            <Pressable 
                className="w-[90%] bg-white/80 rounded-3xl p-4"
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
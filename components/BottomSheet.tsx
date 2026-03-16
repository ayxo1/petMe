import { icons } from '@/constants';
import Colors from '@/constants/Colors';
// import { Image } from 'expo-image';
import React from 'react';
import { Dimensions, Image, KeyboardAvoidingView, ModalProps, Platform, Pressable, Modal as RNModal, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

interface BottomSheetProps extends ModalProps {
    isOpen: boolean;
    withInput?: boolean;
    toggleModal: (isOpen: boolean) => void;
    styleProps?: string;
}

const { height } = Dimensions.get("window");
const SWIPE_THRESHOLD = height/14;

const BottomSheet = ({ isOpen, withInput, children, toggleModal, styleProps, ...props }: BottomSheetProps) => {

    const translateY = useSharedValue(0);
    const closeModal = () => toggleModal(!isOpen);
    
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

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
        ],
    }));

    const gesture = Gesture.Pan()
        .onUpdate(e => {
            translateY.value = e.translationY > 0 ? e.translationY : 0;
        })
        .onEnd(e => {
            if (e.translationY > SWIPE_THRESHOLD) {
                translateY.value = withTiming(height, { duration: 150 }, (finished) => {
                    if (finished) scheduleOnRN(closeModal);
                });
            } else {
                translateY.value = withDelay(50, withTiming(0));
            }
        });

  return (
    <RNModal
        visible={isOpen}
        transparent
        animationType='slide'
        statusBarTranslucent
    >
        <Pressable className='absolute flex-1 size-full justify-end'
            onPress={() => toggleModal(!isOpen)}
        >
            <GestureDetector gesture={gesture}>
                <Animated.View
                    style={animatedStyle}
                    className='flex-1 justify-end'
                >

                        <Pressable
                            onPress={e => e.stopPropagation()}
                            className={`w-full h-3/4 bg-primary/65 shadow shadow-stone-300 items-center rounded-t-3xl ${styleProps}`}  
                        >      
                            <Pressable
                                onPress={() => toggleModal(!isOpen)}
                                className='border-b border-secondary/30 w-52 items-center'
                            >
                                {/* <Text>⮟</Text> */}
                                    <Image 
                                        source={icons.backIcon}
                                        className='size-9 -rotate-90 color-secondary'
                                        resizeMode='contain'
                                        tintColor={Colors.secondary}
                                    />
                            </Pressable>
                            {content}
                        </Pressable>

            </Animated.View>
            </GestureDetector>
        </Pressable>

    </RNModal>
  );
};

export default BottomSheet;
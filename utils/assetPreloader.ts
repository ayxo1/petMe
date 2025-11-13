import { Asset } from 'expo-asset';
import { Image, ImageSourcePropType } from "react-native";

// image preloader
export const imagePreloader = async (imageUris: ImageSourcePropType[]): Promise<void> => {
    try {
        const promises = imageUris.map((uri) => {
            return new Promise<void>((resolve, reject) => {
                Image.prefetch(uri as string)
                .then(() => resolve())
                .catch(() => {
                    console.warn('image preload failure ', uri);
                    resolve();
                });
            });
        });

        await Promise.all(promises)
    } catch (error) {
        console.error('images preloading error', error);
    };
};

export const assetPreloader = async (assets: any[]): Promise<void> => {
    try {
        const assetPromises = assets.map(asset => Asset.fromModule(asset).downloadAsync());
        await Promise.all(assetPromises);
    } catch (error) {
        console.error('error preloading assets ', error);      
    };
};
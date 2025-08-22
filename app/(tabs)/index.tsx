import { images } from "@/constants";
import { LinearGradient } from 'expo-linear-gradient';
import { Image, ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function Index() {
  return (
    <SafeAreaView
      className="flex-1"
    >
      <TouchableOpacity
        className="mt-3"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 15
        }}
      >
      <View
        className="h-[96%] rounded-[7rem] overflow-hidden"
      >
          <ImageBackground 
            source={images.ket}
            className="size-full"
          >
            <LinearGradient 
                colors={['transparent', 'rgba(40, 40, 40, .8)']}
                start={{ x: 0, y: 0.7 }}
                end={{ x: 0, y: 1 }}
                style={{
                  height: '100%',
                  width: '100%',
                }}
            />
          </ImageBackground>
          
      </View>
        <View className="absolute bottom-24 left-0 right-0">
          <Text
            className="font-bold text-4xl  text-primary text-center mb-2"
          >
            mr. ket
          </Text>
          <Text
            className="text-xl mx-8 text-white"
            numberOfLines={2}
          >
            description of some random description of more description of some random description of more 
          </Text>
        </View>
        
      </TouchableOpacity>
    </SafeAreaView>
  );
}

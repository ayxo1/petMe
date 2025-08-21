import { images } from "@/constants";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaView>
      <TouchableOpacity
        className="h-[96%] mt-3"
      >
        <Image 
          source={images.ket}
          className="size-full rounded-[7rem]"
          resizeMode="cover"
        />
        <View>
          <Text
            className="font-bold text-4xl absolute -top-40"
          >
            mr. ket
          </Text>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

import { images } from "@/constants";
import { useAuthStore } from "@/stores/authStore";
import { FeedProfile } from "@/types/feed";
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from "react";
import { ImageSourcePropType, Pressable, Text, TouchableOpacity, View } from "react-native";
import Modal from "./Modal";
import MultipleModal from "./MultipleModal";
import ReportForm from "./ReportForm";

interface ProfileInterfaceProps {
    profileImages: string[];
    profileName: string;
    profileDescription: string;
    profileType?: string
    distance?: string;
    isAvailableForAdoption?: boolean;
    adoptionInfo: {
        adoptionStatus?: 'available' | 'pending' | 'adopted';
        adoptionDetails?: {
        requirements?: string;
        reason?: string;
        };
    }
};

const ProfileInterface = ({ profile, reportBtn = true }: { profile: Partial<FeedProfile>; reportBtn?: boolean; }) => {

  const userId = useAuthStore(state => state.user?.id);
  if (!userId) return;

  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [adoptionModal, toggleAdoptionModal] = useState(false);

  const [isReportModal, toggleIsReportModal] = useState(false);

  const profileCover: ImageSourcePropType = { uri: profile.images ? profile.images[currentImageIdx] : ''}

  return (
    <View
    className="h-[96.5%] overflow-hidden rounded-lg p-2 mt-6"
    >

        {isReportModal && (
            <Modal
                isOpen={isReportModal}
                toggleModal={toggleIsReportModal}
                styleProps='justify-center items-center max-w-96'
                tint
            >
                <View className="gap-4 bg-primary/90 px-3 py-4 rounded-2xl border border-lighterSecondary">
                    <ReportForm
                        toggleModal={toggleIsReportModal}
                        userId={userId}
                        reportedProfileName={profile.name || ''}
                        reportedProfileId={profile.id || ''}
                    />
                </View>
            </Modal>
        )}

        {reportBtn 
        ? 
        <Pressable 
            className="absolute top-7 right-6 z-50 bg-red-600/50 px-2.5 rounded-2xl"
            onPress={() => toggleIsReportModal(true)}
        >
            <Text className="text-primary text-xl font-bold shadow">!</Text>
        </Pressable> 
        : null}

        {adoptionModal && (
            <Modal
                isOpen={adoptionModal}
                toggleModal={toggleAdoptionModal}
                styleProps='mt-[30%] justify-center items-center max-w-96'
                tint={false}
            >
                <View className="gap-4 bg-primary/90 px-3 py-4 rounded-2xl border border-lighterSecondary">
                    <Text className="text-secondary font-bold">adoption status:
                        <Text className={`font-light ${profile.adoptionStatus === 'available' ? 'text-green-600' : 'text-secondary'}`}> {profile.adoptionStatus === 'available' ? 'looking for a home' : profile.adoptionStatus}</Text>
                    </Text>
                    {profile.adoptionDetails?.reason && 
                    <Text className="text-secondary font-bold">reason:
                        <Text className="font-light text-secondary"> {profile.adoptionDetails.reason}</Text>
                    </Text>}
                    {profile.adoptionDetails?.requirements && 
                    <Text className="text-secondary font-bold">requirements:
                        <Text className="font-light text-secondary"> {profile.adoptionDetails.requirements}</Text>
                    </Text>}
                </View>
            </Modal>
        )}

        <View 
            className="flex-1 relative bg-primary"
        >
            <View>
                {profile.type && (profile.type === 'seeker' || profile.isShelterPet) ? (
                    <Text className="absolute shadow text-center text-primary text-xl z-50 top-16 right-8 bg-secondary/80 px-3 py-2 rounded-3xl transform rotate-12">
                        {profile.type === 'seeker' ? 'seeker' : 'shelter'}
                    </Text>
                ) : null}
            </View>

            <Pressable
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    setCurrentImageIdx(prev => ((prev + 1) === profile.images?.length ? 0 : prev + 1));
                }}
            >

                <Image 
                    source={profileCover}
                    style={{ width: '100%', height: '100%', position: 'absolute' }}
                    contentFit='cover'
                    cachePolicy="memory-disk"
                    placeholder={images.mrBigBlurhash}
                    // placeholder={blurhash}
                    transition={50}
                />

                <LinearGradient 
                    colors={['transparent', 'rgba(40, 40, 40, .9)']}
                    start={{ x: 0, y: 0.55 }}
                    end={{ x: 0, y: 1 }}
                    style={{
                    height: '100%',
                    width: '100%',
                    }}
                />

            </Pressable>
        </View>

        <View
            className="absolute inset-0"
            pointerEvents="none"
        >
            <Image
                source={images.profileCardBorder}
                className="size-full"
                contentFit="fill"
                style={{ width: '100%', height: '100%' }}
                cachePolicy='memory-disk'
            />
        </View>

        {profile.isAvailableForAdoption && (
            <TouchableOpacity 
                className='flex-row absolute bottom-52 left-0 right-0 items-center justify-center gap-2'
                onPress={() => toggleAdoptionModal(!adoptionModal)}
            >
                <Text
                    className='font-light text-l text-center text-white bg-authPrimary/80 px-3 py-1 rounded-xl border border-blue-100/20'
                >
                    {adoptionModal ? 'close' : 'looking for a new home'}
                </Text>
                <View 
                    className='bg-authPrimary/80 px-2 py-1 rounded-full border border-blue-100/20'
                >
                    <Text className="font-extralight text-l text-center text-white">ⓘ</Text>
                </View>
            </TouchableOpacity>
        )}

        <View className="absolute bottom-44 left-0 right-0 flex-row justify-center gap-2">
            {profile.images?.map((img, idx) => (
                <Text
                    key={img}
                    className={`font-bold text-3xl text-center ${idx === currentImageIdx ? 'text-white' : 'text-white/50'}`}
                >
                    .
                </Text>
            ))}
        </View>

        <View className="absolute bottom-32 left-0 right-0">
            {/* <View className="absolute left-28 bottom-8">
                {profile.breed && (
                    <Text className="p-1 rounded-2xl border border-lighterSecondary bg-secondary/20 font-extralight text-base text-lighterSecondary">{profile.breed}</Text>
                )}
            </View> */}
            <Text
                className="font-bold text-3xl text-lighterSecondary text-center"
                numberOfLines={1}
            >
                {profile.name}{profile.type === 'pet' && `, ${profile.age}`}
            </Text>
        </View>

        {profile.distance && (<View className="absolute bottom-24 left-7 right-0">
            <Text className="text-l text-authPrimary">📍 {profile.distance} away from you</Text>
        </View>)}

        <View
            className="absolute left-0 right-0 bottom-6 h-16 justify-start"
        >
            <Text
                className="text-base mx-8 text-white"
                numberOfLines={2}
            >
            &#9829; {profile.bio}
            </Text>
        </View>
    </View>
  );
}

export default ProfileInterface;
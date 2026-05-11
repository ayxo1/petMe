import { pb } from "@/backend/config/pocketbase";
import { useAuthStore } from "@/stores/authStore";
import { Comment } from "@/types/components";
import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from 'dayjs';
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { getCalendars } from "expo-localization";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
import * as yup from 'yup';
import InputComponent from "./InputComponent";
import InputController from "./controllers/InputController";

const CommentSection = ({ comments, setComments, isLoadingComments, eventId }: 
  { 
    comments: Comment[] | null | undefined; 
    setComments : React.Dispatch<React.SetStateAction<Comment[] | null | undefined>>;
    isLoadingComments: boolean;
    eventId: string; 
  }) => {

  const user = useAuthStore(state => state.user);
  if (!user) return;

  const {
    control,
    handleSubmit,
    setValue,
    formState: {
      errors
    }
  } = useForm({
    resolver: yupResolver(yup.object({commentText: yup.string().required('the comment is empty').max(128, 'maximum 128 characters')}))
  });  

  const userCalendars = getCalendars();
  const userTimezone = userCalendars[0].timeZone;
  const { uses24hourClock } = userCalendars[0];
  dayjs.extend(timezone);
  dayjs.extend(utc);

  const [replyingTo, setReplyingTo] = useState<string | null>();
  const [commentText, setCommentText] = useState('');

  const [isAddingComment, setIsAddingComment] = useState(false);

  const topLevelComments = comments?.filter(c => !c.parentId);
  const getReplies = (commentId: string) => comments?.filter(c => c.parentId === commentId);

  const submitComment = async () => {
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),  
      eventId,
      authorId: user.id,
      authorName: user.username,
      text: commentText,
      parentId: replyingTo || '',
      created: Date.now().toString(),
      collectionId: '123',
      collectionName: 'comments'
    };

    setComments(prev => [newComment, ...(prev || [])]);

    pb.collection('comments').create({
      eventId,
      authorId: user.id,
      authorName: user.username,
      text: commentText,
      parentId: replyingTo || ''
    }).catch((error) => {
      setComments(prev => prev?.filter(c => c.id !== newComment.id) || null);
      console.log('CommentSection.tsx, submitComment error:', error);
      Alert.alert('error', 'an error occurred while posting the comment, try to re-enter the event page and post again');
    });

    setCommentText('');
    setReplyingTo(null);
    setIsAddingComment(false);
  };

  return (
    <View>

      <TouchableOpacity 
        className="mb-3 mt-1 items-center"
        onPress={() => setIsAddingComment(!isAddingComment)}
      >
        <Text className='text-secondary py-1 px-2'>add a comment (+)</Text>
      </TouchableOpacity>

      
      {isLoadingComments
        ? 
        <ActivityIndicator 
          className='absolute-center top-12'
        />
        : <View className='bg-primary shadow shadow-secondary/10 rounded-2xl p-4 min-w-full border border-secondary/10 max-h-[81%]'>
          {
            <View>

              {isAddingComment && <View className="">
                <TouchableOpacity
                  onPress={() => setIsAddingComment(false)}
                  className="absolute left-2 top-2 rounded-full p-0.5 z-50 bg-red-400/10"
                >
                  <Text className="font-light text-red-500">✖</Text>
                </TouchableOpacity>
                <View className="flex-row items-end w-[89%]">
                  <InputController
                    control={control}
                    name="commentText"
                    placeholder='add a comment'
                    value={commentText}
                    onChangeText={setCommentText}
                    label=""
                    spellCheck
                    multiline
                  />
                  <TouchableOpacity
                    onPress={handleSubmit(submitComment)}
                    className="rounded-2xl bg-lighterSecondary py-1 px-2 mb-2 z-50"
                  >
                    <Text className="font-light">post</Text>
                  </TouchableOpacity>
                </View>

                <View className='h-5 mt-2'>
                  {errors.commentText && (
                      <Text className='text-red-500 text-center'>
                          {errors.commentText.message}
                      </Text>
                  )}
                </View>
              </View>}

              {((comments && comments?.length > 0) 
                ? 
                <FlatList
                  automaticallyAdjustKeyboardInsets={true}
                  keyboardShouldPersistTaps='handled'
                  data={topLevelComments}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => {
                    const replies = getReplies(item.id);            
                    
                    const tz = userTimezone ?? 'UTC';            
                    const convertedDate = uses24hourClock
                      ? dayjs(item.created).format('MM-DD HH:mm')
                      : dayjs.tz(item.created).format('MM-DD hh:mm A');
                      
                    return (
                      <View className="mb-2">
                        <View className="border-b border-b-secondary/15">
                          <View className="max-w-full mb-2">
                              <View className="gap-2 mb-1">
                                <Text className="font-bold text-secondary">{item.authorName} <Text className="font-light text-sm">({convertedDate})</Text></Text>
                                <Text>{item.text}</Text>
                              </View>
                              <TouchableOpacity 
                                className="ml-1"
                                onPress={() => setReplyingTo(item.id)}
                              >
                                <Text className="text-gray-500 font-light">reply</Text>
                              </TouchableOpacity>
                          </View>

                          {replies?.map(reply => {
                            const convertedDate = uses24hourClock
                              ? dayjs(reply.created).format('MM-DD HH:mm')
                              : dayjs.tz(reply.created).format('MM-DD hh:mm A');

                            return (
                              <View
                                key={reply.id}
                                className="ml-4 mt-1"
                              >
                                {/* <Text className="absolute -left-4 -top-2">|</Text> */}
                                <View className="gap-2 mb-1">
                                  <Text className="font-bold text-secondary">{reply.authorName} <Text className="font-light text-sm">({convertedDate})</Text></Text>
                                  <Text>{reply.text}</Text>
                                </View>
                              </View>
                            );
                          })}
                        </View>

                        <View>
                          {replyingTo && item.id === replyingTo && (
                            <View className="max-w-full">
                              <TouchableOpacity
                                onPress={() => setReplyingTo(null)}
                                className="absolute left-2 top-2 rounded-full p-0.5 z-50 bg-red-400/10"
                              >
                                <Text className="font-light text-red-500">✖</Text>
                              </TouchableOpacity>
                              <View className="flex-row items-end">
                                <InputComponent 
                                  placeholder={`send a reply to the ${item.authorName}'s thread`}
                                  value={commentText}
                                  onChangeText={setCommentText}
                                  label=""
                                  generalStyle="w-[85%]"
                                  spellCheck
                                />
                                <TouchableOpacity
                                  onPress={submitComment}
                                  className="rounded-2xl bg-lighterSecondary py-1 px-2 mb-2"
                                >
                                  <Text className="font-light">post</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          )}
                        </View>

                      </View>
                    );
                  }}
                />

                : !isAddingComment 
                  ? <Text className='font-light text-gray-500 mb-2 text-center mt-1'>be first to add a comment!</Text> 
                  : null)}
            </View>
          }
        </View>
        }


    </View>
  );
};

export default CommentSection;
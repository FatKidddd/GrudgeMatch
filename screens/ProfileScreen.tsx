import { Text, Box, ScrollView, Center, Button, Image, Avatar, HStack, Flex } from 'native-base';
import React, { useEffect, useState } from 'react';
import { RootDrawerScreenProps } from '../types';
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject,  } from "firebase/storage";
import { LogBox, Platform, TouchableOpacity } from "react-native";
import uuid from "react-native-uuid";
import { Camera } from 'expo-camera';
import { getAuth } from 'firebase/auth';
import { updateDoc, getFirestore, doc, deleteField } from 'firebase/firestore';
import FastImage from 'react-native-fast-image';
// import BoringAvatar from 'react-native-boring-avatars';
import { useUser, getInitials } from '../utils/userUtils';
import { deleteUser } from '../redux/actions';
import { useAppDispatch } from '../hooks/selectorAndDispatch';
import { ConfirmModal } from '../components';
import { Entypo, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

const ProfileScreen = ({}: RootDrawerScreenProps<'Profile'>) => {
  const uid = getAuth().currentUser?.uid;
  if (!uid) return null;
  const db = getFirestore();
  const user = useUser(uid);
  const dispatch = useAppDispatch();
  const [uploading, setUploading] = useState(false);

  // Firebase sets some timeers for a long period, which will trigger some warnings. Let's turn that off for 
  LogBox.ignoreLogs([`Setting a timer for a long period`]);

  // for camera
  // const [hasPermission, setHasPermission] = useState(null as null | boolean);
  // const [type, setType] = useState(Camera.Constants.Type.back);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          alert("Sorry, we need camera roll permissions to make !");
        }
      }
    })();

    // (async () => {
    //   const { status } = await Camera.requestCameraPermissionsAsync();
    //   setHasPermission(status === 'granted');
    // })();
  }, []);

  const uploadImageAsync = async (uri: string) => {
    // Why are we using XMLHttpRequest? See:
    // https://github.com/expo/expo/issues/2402#issuecomment-443726662
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log(e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    }) as any;

    const fileRef = ref(getStorage(), user.id); //uuid.v4() as string);
    const result = await uploadBytes(fileRef, blob);

    // We're done with the blob, close and release it
    blob.close();

    return await getDownloadURL(fileRef);
  }

  // const _takePhoto = async () => {
  //   let pickerResult = await ImagePicker.launchCameraAsync({
  //     allowsEditing: true,
  //     aspect: [4, 3],
  //   });

  //   _handleImagePicked(pickerResult);
  // };
  
  const _deleteImage = async () => {
    if (!user.imageUrl) return;
    const imageRef = ref(getStorage(), user.id);
    const userRef = doc(db, 'users', user.id);
    Promise.all([
      updateDoc(userRef, {
        imageUrl: deleteField()
      }),
      deleteObject(imageRef)
    ])
      .then(res => {
        console.log("Deleted profile picture of user", user.id);
        dispatch(deleteUser(user.id));
      })
      .catch(err => {
        console.log("Someting went wrong with deleting profile picture");
        console.error(err)
      });
  };

  const _pickImage = async () => {
    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
    });

    console.log({ pickerResult });

    _handleImagePicked(pickerResult);
  };

  const _handleImagePicked = async (pickerResult: ImagePicker.ImagePickerResult) => {
    try {
      setUploading(true);

      if (!pickerResult.cancelled) {
        const uploadUrl = await uploadImageAsync(pickerResult.uri);
        const userRef = doc(db, 'users', uid);
        updateDoc(userRef, {
          imageUrl: uploadUrl
        })
          .then(res => {
            console.log("Added profile picture to user", uid);
            dispatch(deleteUser(user.id));
          })
          .catch(err => console.error(err));
      }
    } catch (e) {
      console.log(e);
      alert("Upload failed, sorry :(");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateName = () => {

  };

  const [deleteIsOpen, setDeleteIsOpen] = useState(false);

  if (!user || !user.id) return null;
  const avatarProps = {
    key: user.id,
    size: "2xl"
  } as any;
  if (!!user.imageUrl) {
    avatarProps.source = {
      uri: user.imageUrl
    };
  }
  return (
    <>
      <ScrollView>
        <Center>
          <Box>
            <Avatar {...avatarProps}>
              {getInitials(user.name)}
            </Avatar>
            <HStack>
              <TouchableOpacity
                onPress={_pickImage}
                style={{
                  flex: 1,
                  padding: 2,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderTopLeftRadius: 20,
                  borderBottomLeftRadius: 20,
                  borderWidth: 1
                }}>
                <MaterialCommunityIcons name="pencil" size={30} color="#aaaaaa"/>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (!user.imageUrl) return;
                  setDeleteIsOpen(true);
                }}
                style={{
                  flex: 1,
                  padding: 2,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderTopRightRadius: 20,
                  borderBottomRightRadius: 20,
                  borderWidth: 1
                }}
              >
                <MaterialIcons name="delete" size={30} color="red"/>
              </TouchableOpacity>
            </HStack>
              {/* // pixelated...
              // : <BoringAvatar
              //   name={user.id}
              //   size={30}
              //   variant="beam"
              //   colors={["#F2E7D2", "#F79EB1", "#AE8FBA", "#4C5E91", "#473469"]}
              // /> */}
          </Box>
          <Text>{user.name}</Text>
        </Center>
      </ScrollView>
      <ConfirmModal
        isOpen={deleteIsOpen}
        onClose={() => setDeleteIsOpen(false)}
        callback={_deleteImage}
        headerDesc='Delete profile picture?'
        buttonDesc='Delete'
      />
    </>
  );
};

export default ProfileScreen;
import React, { useEffect, useState } from 'react';
import { Icon, Text, ScrollView, Center, Button, Avatar, HStack, Switch, useColorMode, Spinner } from 'native-base';
import { RootDrawerScreenProps } from '../types';
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject,  } from "firebase/storage";
import { LogBox, Platform } from "react-native";
import uuid from "react-native-uuid";
import { getAuth } from 'firebase/auth';
import { updateDoc, getFirestore, doc, deleteField } from 'firebase/firestore';
// import BoringAvatar from 'react-native-boring-avatars';
import { getInitials } from '../utils/userUtils';
import { useUser } from '../hooks/useFireGet';
import { useAppDispatch } from '../hooks/selectorAndDispatch';
import { ConfirmModal, UserAvatar } from '../components';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { deleteUser } from '../redux/features/users';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const SettingsScreen = ({}: RootDrawerScreenProps<'Settings'>) => {
  const [uploading, setUploading] = useState(false);
  const [deleteIsOpen, setDeleteIsOpen] = useState(false);

  const uid = getAuth().currentUser?.uid;
  const [user, userIsLoading] = useUser(uid);
  const dispatch = useAppDispatch();

  // Firebase sets some timers for a long period, which will trigger some warnings. Let's turn that off for 
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

  if (!uid || !user) {
    return (
      <Center flex={1}>
        <Spinner size="lg" />
      </Center>
    );
  }

  const db = getFirestore();
  const userRef = doc(db, 'users', uid);
  const fileRef = ref(getStorage(), user.id); //uuid.v4() as string);

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
    Promise.all([
      updateDoc(userRef, {
        imageUrl: deleteField()
      }),
      deleteObject(fileRef)
    ])
      .then(res => {
        console.log("Deleted profile picture of user", user.id);
        dispatch(deleteUser(user.id));
      })
      .catch(err => {
        console.log("Something went wrong with deleting profile picture");
        console.error(err)
      });
  };

  const _pickImage = async () => {
    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0
    });

    console.log({ pickerResult });

    _handleImagePicked(pickerResult);
  };

  const _handleImagePicked = async (pickerResult: ImagePicker.ImagePickerResult) => {
    try {
      setUploading(true);

      if (!pickerResult.cancelled) {
        const manipResult = await manipulateAsync(pickerResult.uri, [
          {
            resize: { height: 300, width: 300 },
          },
        ]);
        const uploadUrl = await uploadImageAsync(manipResult.uri);
        updateDoc(userRef, {
          imageUrl: uploadUrl,
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

  // const avatarProps = {
  //   key: user.id,
  //   size: "2xl"
  // } as any;
  // if (!!user.imageUrl) {
  //   avatarProps.source = {
  //     uri: user.imageUrl
  //   };
  // }
  return (
    <>
      <ScrollView marginTop={25}>
        <Center>
          {/* <Avatar {...avatarProps}>
            {getInitials(user.name)}
          </Avatar> */}
          <UserAvatar userId={user.id} size="lg"/>
          <HStack marginY={15} width={220} space={3}>
            <Button
              onPress={_pickImage}
              leftIcon={<Icon as={MaterialCommunityIcons} name="pencil" size="sm" />}
              flex={1}
              //colorScheme='blue'
            >
              Edit
            </Button>
            <Button
              onPress={() => {
                if (!user.imageUrl) return;
                setDeleteIsOpen(true);
              }}
              leftIcon={<Icon as={MaterialCommunityIcons} name="delete" size="sm"/>}
              colorScheme='red'
              flex={1}
            >
              Delete
            </Button>
          </HStack>
          <Text fontSize={18}>{user.name}</Text>
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

// Color Switch Component
const ToggleDarkMode = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <HStack space={2} alignItems="center">
      <Text>Dark</Text>
      <Switch
        isChecked={colorMode === "light" ? true : false}
        onToggle={toggleColorMode}
        aria-label={colorMode === "light" ? "switch to dark mode" : "switch to light mode"}
      />
      <Text>Light</Text>
    </HStack>
  );
};

export default SettingsScreen;

// {/* // pixelated...
// : <BoringAvatar
//   name={user.id}
//   size={30}
//   variant="beam"
//   colors={["#F2E7D2", "#F79EB1", "#AE8FBA", "#4C5E91", "#473469"]}
// /> */}
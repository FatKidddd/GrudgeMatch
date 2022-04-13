import React, { useEffect, useState } from 'react';
import { Alert, ImageBackground, Platform, TouchableOpacity } from 'react-native';
import { Text, FlatList, Box, Center, HStack, Spinner, VStack, ScrollView, Button } from 'native-base';
import Purchases, { PurchaserInfo, PurchasesPackage } from 'react-native-purchases';
import { doc, getDoc, getFirestore, increment, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useSnapshotUser } from '../hooks/useFireGet';
import { User } from '../types';
import { useIsMounted } from '../hooks/common';
import gamesData from '../gamesData';
import { LoadingView } from '../components';
// import { useNavigation } from '@react-navigation/native';
// import { ENTITLEMENT_ID } from '../../constants';

interface PackageItemProps {
  purchasePackage: PurchasesPackage;
  setIsPurchasing: (bool: boolean) => void;
  uid: string;
  user: User;
};

const mapIds: { [key: string]: number } = {
  "small_room_bundle": 5,
  "medium_room_bundle": 18,
  "large_room_bundle": 45
};

const mapName: { [key: string]: string } = {
  "small_room_bundle": "Small",
  "medium_room_bundle": "Medium",
  "large_room_bundle": "Large"
};

const FREE_ROOMS_LIMIT = 8;

const handlePurchase = async (purchaserInfo: PurchaserInfo, uid: string) => {
  let finalRoomsLimit = FREE_ROOMS_LIMIT;
  purchaserInfo.nonSubscriptionTransactions.forEach(obj => {
    finalRoomsLimit += mapIds[obj.productId];
  });
      
  const userRef = doc(getFirestore(), 'users', uid);
  await updateDoc(userRef, {
    roomsLimit: finalRoomsLimit
  });
      
  // if (typeof purchaserInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined') {
  //   navigation.goBack();
  // }
};

const PackageItem = ({ purchasePackage, setIsPurchasing, uid, user }: PackageItemProps) => {
  let { product: { title, description, price_string }, } = purchasePackage;
  const productId = purchasePackage.product.identifier;
  if (Platform.OS === 'ios') {
    title = mapName[productId] + ' Room Bundle';
    description = 'Purchase ' + mapIds[productId].toString() + ' rooms';
  }

  // const navigation = useNavigation();

  const onSelection = async () => {
    setIsPurchasing(true);

    try {
      const { purchaserInfo, productIdentifier } = await Purchases.purchasePackage(purchasePackage);
      console.log('bought');
      await handlePurchase(purchaserInfo, uid);
    } catch (e: any) {
      if (!e.userCancelled) {
        if (e.userInfo?.readableErrorCode === "PaymentPendingError") {
          
        } else {
          Alert.alert('Error purchasing package', JSON.stringify(e));
        }
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const parseStr = (s: string) => {
    let i = 0;
    for (; i < s.length; i++)
      if (s[i] === '(') break;
    return s.slice(0, i).trimEnd();
  };

  const formatDesc = (s: string) => {
    const arr = s.split(' ');
    return (
      <HStack alignItems={'center'} marginTop={3}>
        {/* <Text>{arr[0]}</Text> */}
        <Text fontSize={20} fontWeight='bold'> {arr[1]} </Text>
        <Text>{arr[2]}</Text>
      </HStack>
    );
  };

  return (
    <TouchableOpacity onPress={onSelection}>
      <Center margin={2} padding={5} bg='white' rounded={20} shadow={1}>
        <Text fontWeight={'semibold'} textAlign='center'>{parseStr(title)}</Text>
        {formatDesc(description)}
        <Text fontSize={18} alignSelf={'flex-end'}>{price_string}</Text>
      </Center>
    </TouchableOpacity>
  );
};

const Restore = ({ uid, setIsPurchasing }: { uid: string, setIsPurchasing: (bool: boolean) => void }) => {
  const handlePress = async () => {
    setIsPurchasing(true);
    try {
      const restore = await Purchases.restoreTransactions();
      // ... check restored purchaserInfo to see if entitlement is now active
      console.log('restored');
      await handlePurchase(restore, uid);
    } catch (e) {

    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <Button onPress={handlePress} marginX={2}>Refresh</Button>
  );
};

const ShopScreen = () => {
  // - State for all available package
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [serverDescription, setServerDescription] = useState<string>();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const uid = getAuth().currentUser?.uid;
  const user = useSnapshotUser(uid);
  // const [user, setUser] = useState<User>();

  const isMounted = useIsMounted();
  const db = getFirestore();

  // useEffect(() => {
  //   if (!uid || isPurchasing) return;
  //   const userRef = doc(db, 'users', uid);
  //   getDoc(userRef)
  //     .then(res => {
  //       if (!isMounted.current) return;
  //       const data = {
  //         id: res.id,
  //         ...res.data()
  //       } as User;
  //       console.log('user data', data);
  //       setUser(data);
  //     })
  //     .catch(err => console.error(err));
  // }, [isPurchasing, uid]);
  // const user = useSnapshotUser(uid);

  // - State for displaying an overlay view

  // const [dummy, setDummy] = useState('');

  useEffect(() => {
    // Get current available packages
    (async () => {
      try {
        const offerings = await Purchases.getOfferings();
        // setDummy(JSON.stringify(offerings));
        if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
          setPackages(offerings.current.availablePackages);
          setServerDescription(offerings.current.serverDescription);
        }
      } catch (e: any) {
        Alert.alert('Error getting offers'); //, e.message);
      }
    })();
  }, [uid]);

  // const footer = () => {
  //   console.warn("Modify this value to reflect your app's Privacy Policy and Terms & Conditions agreements. Required to make it through App Review.");
  //   return (
  //     <Text alignSelf={'center'}>
  //       Don't forget to add your subscription terms and conditions. Read more about this here:
  //       https://www.revenuecat.com/blog/schedule-2-section-3-8-b
  //     </Text>
  //   );
  // };

  if (!uid || !user) return null;
  return (
    <ImageBackground
      source={gamesData['golf'].imagePath}
      resizeMode="cover"
      style={{ flex: 1, backgroundColor: '#eeeeee' }}
      imageStyle={{ opacity: 0.4 }}
    // blurRadius={10}
    >
      {/* <Text>{dummy}</Text> */}
      <Center flex={1}>
        <LoadingView isLoading={isPurchasing} marginTop={3}>
        {/* <Text alignSelf={'center'} fontSize={18} fontWeight='bold' marginY={3}>Buy more rooms here</Text> */}
          <HStack justifyContent={'space-between'} marginX={3} alignItems='center'>
            <Text fontSize={16} fontWeight='bold'>Rooms Left: {user.roomsLimit - (user?.roomsUsed ? user.roomsUsed : 0)}</Text>
            <Restore uid={uid} setIsPurchasing={setIsPurchasing} />
          </HStack>
          <Center>
            <Box rounded={20} padding={3} width='95%'>
              <Text fontSize={20} alignSelf='flex-start' margin={3} fontWeight='bold'>Bundles</Text>
              <FlatList
                data={packages}
                renderItem={({ item }) =>
                  <PackageItem
                    purchasePackage={item}
                    setIsPurchasing={setIsPurchasing}
                    uid={uid}
                    user={user}
                  />
                }
                keyExtractor={(item) => item.identifier}
              />
            </Box>
          </Center>
        </LoadingView>
      </Center>
    </ImageBackground>
  );
};

export default ShopScreen;

// /*
//  The app's user tab to display user's details like subscription status and ID's.
//  */
// const UserScreen = () => {
//   const [isAnonymous, setIsAnonymous] = useState(true);
//   const [userId, setUserId] = useState(null);
//   const [subscriptionActive, setSubscriptionActive] = useState(false);

//   // get the latest details about the user (is anonymous, user id, has active subscription)
//   const getUserDetails = async () => {
//     setIsAnonymous(await Purchases.isAnonymous());
//     setUserId(await Purchases.getAppUserID());

//     const purchaserInfo = await Purchases.getPurchaserInfo();
//     setSubscriptionActive(typeof purchaserInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined');
//   };

//   useEffect(() => {
//     // Get user details when component first mounts
//     getUserDetails();
//   }, []);

//   useEffect(() => {
//     // Subscribe to purchaser updates
//     Purchases.addPurchaserInfoUpdateListener(getUserDetails);
//     return () => {
//       Purchases.removePurchaserInfoUpdateListener(getUserDetails);
//     };
//   });

//   return (
//     <View style={styles.page}>
//       {/* The user's current app user ID and subscription status */}
//       <Text style={styles.headline}>Current User Identifier</Text>
//       <Text style={styles.userIdentifier}>{userId}</Text>

//       <Text style={styles.headline}>Subscription Status</Text>
//       <Text style={{ color: subscriptionActive ? 'green' : 'red' }}>
//         {subscriptionActive ? 'Active' : 'Not Active'}
//       </Text>

//       {/* Authentication UI */}
//       {isAnonymous ? <LoginForm onLogin={getUserDetails} /> : <LogoutButton onLogout={getUserDetails} />}

//       {/* You should always give users the option to restore purchases to connect their purchase to their current app user ID */}
//       <RestorePurchasesButton />
//     </View>
//   );
// };
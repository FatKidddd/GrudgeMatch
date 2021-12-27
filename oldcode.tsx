// const AllStrokes = ({ roomName, usersStrokes }: { roomName: string, usersStrokes: { [uid: string]: GolfStrokes } }) => {
//   interface UserStrokesProps {
//     userId: string;
//     userStrokes: GolfStrokes;
//     roomName: string;
//   };

//   const UserStrokes = ({ userId, userStrokes, roomName }: UserStrokesProps) => {
//     const db = getFirestore();

//     const [name, setName] = useState(userId);

//     useEffect(() => {
//       getDoc(doc(db, 'users', userId))
//         .then(res => {
//           const data = res.data();
//           setName(data?.name ? data.name : userId);
//         })
//         .catch(err => {
//           console.error(err);
//         });
//     }, []);

//     const [strokes, setStrokes] = useState(userStrokes);

//     useEffect(() => {
//       setStrokes(userStrokes);
//     }, [userStrokes]);


//     return (
//       <HStack flex={1} bg="yellow.100">
//         <Box>
//           <Text>{name}</Text>
//         </Box>
//         <HStack>
//           {/* {strokes.map((v, i) => {
//             return (
//               <Box>
//               </Box>
//             );
//           })} */}
//         </HStack>
//       </HStack>
//     );
//   };

//   return useMemo(() => {
//     const sorted = Object.entries(usersStrokes).sort();
//     return (
//       <Box>
//         {sorted.map(([uid, userStrokes], i) => <UserStrokes userId={uid} roomName={roomName} userStrokes={userStrokes} key={uid} />)}
//       </Box>
//     );
//   }, [usersStrokes]);
// };

// const UserStrokes = ({ userId, userStrokes, roomName }: UserStrokesProps) => {
//   const db = getFirestore();
//   const roomRef = doc(db, 'rooms', roomName);

//   const updateUserStrokes = async ({ id, strokes }: { id: string, strokes: GolfStrokes }) => {
//     await updateDoc(roomRef, {
//       [`usersStrokes.${id}`]: strokes
//     });
//   };

//   const [name, setName] = useState(userId);

//   useEffect(() => {
//     getDoc(doc(db, 'users', userId))
//       .then(res => {
//         const data = res.data();
//         setName(data?.name ? data?.name : userId);
//       })
//       .catch(err => {
//         console.error(err);
//       });
//   }, []);

//   const [strokes, setStrokes] = useState(userStrokes);

//   useEffect(() => {
//     setStrokes(userStrokes);
//   }, [userStrokes]);


//   const handleChangeNumber = (text: string, idx: number) => {
//     const num = Number(text); // wow Number("") == 0
//     setStrokes(strokes.map((v, i) => i == idx ? num : v) as GolfStrokes);
//   };

//   return (
//     <HStack>
//       <Box width={30} overflow="hidden">
//         <Text>{name}</Text>
//       </Box>
//       <HStack>
//         {/* {strokes.map((v, i) => {
//           return (
//             <Box>
//               <Input 
//                 keyboardType="numeric"
//                 value={v ? v.toString() : undefined}
//                 onEndEditing={() => updateUserStrokes({ id: userId, strokes })}
//                 onChangeText={text => handleChangeNumber(text, i)} key={i}
//               />
//             </Box>
//           );
//         })} */}
//       </HStack>
//     </HStack>
//   );
// };
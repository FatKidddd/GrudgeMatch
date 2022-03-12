import { HomeStackScreenProps, RootDrawerScreenProps } from "../types";
import { Pressable } from "react-native";
import { DrawerActions } from "@react-navigation/routers";
import { Ionicons } from "@expo/vector-icons";

const HamburgerButton = ({ navigation }: HomeStackScreenProps<'Games'> | RootDrawerScreenProps<'Shop' | 'Settings'>) => {
  return (
    <Pressable
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      style={({ pressed }) => ({
        opacity: pressed ? 0.5 : 1,
        marginHorizontal: 15
      })}>
      <Ionicons
        name="md-menu"
        size={25}
      />
    </Pressable>
  );
};

export default HamburgerButton;
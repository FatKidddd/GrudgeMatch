import { HomeStackScreenProps, RootDrawerScreenProps } from "../types";
import { Pressable } from "react-native";
import { DrawerActions } from "@react-navigation/routers";
import { Ionicons } from "@expo/vector-icons";

type HamburgerButtonProps = (HomeStackScreenProps<'Games'> | RootDrawerScreenProps<'Shop' | 'Settings'>) & { isGamesScreen?: boolean };

const HamburgerButton = ({ navigation, isGamesScreen }: HamburgerButtonProps) => {
  return (
    <Pressable
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      style={({ pressed }) => ({
        opacity: pressed ? 0.5 : 1,
        marginHorizontal: isGamesScreen ? 0 : 15,
        marginRight: isGamesScreen ? 15 : 0
      })}>
      <Ionicons
        name="md-menu"
        size={25}
      />
    </Pressable>
  );
};

export default HamburgerButton;
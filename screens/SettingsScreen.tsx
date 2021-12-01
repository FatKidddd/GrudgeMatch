import React from 'react';
import { Switch, View, Center, VStack, HStack, Heading, Text, Code, Link, useColorMode, Button } from 'native-base';
import { signOut, getAuth } from 'firebase/auth';

const SettingsScreen = () => {
  return (
    <Center
      _dark={{ bg: "blueGray.900" }}
      _light={{ bg: "blueGray.50" }}
      px={4}
      flex={1}
    >
      <VStack space={5} alignItems="center">
        <Heading size="lg">Welcome to NativeBase</Heading>
        <HStack space={2} alignItems="center">
          <Text>Edit</Text>
          <Code>App.tsx</Code>
          <Text>poop and save to reload.</Text>
        </HStack>
        <Link href="https://docs.nativebase.io" isExternal>
          <Text color="primary.500" underline fontSize={"xl"}>
            Learn NativeBase
          </Text>
        </Link>
        <ToggleDarkMode />
        <Button
          onPress={() => {
            const auth = getAuth();
            signOut(auth);
            console.log("Logged out");
          }}
        >Log out</Button>
      </VStack>
    </Center>
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
        aria-label={
          colorMode === "light" ? "switch to dark mode" : "switch to light mode"
        }
      />
      <Text>Light</Text>
    </HStack>
  );
};

export default SettingsScreen;
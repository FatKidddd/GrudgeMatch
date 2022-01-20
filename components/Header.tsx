import { StatusBar, Box, HStack, Text } from "native-base";
import React from "react";

const Header = ({ children }: { children?: React.ReactNode }) => {
  return (
    <>
      {/* <StatusBar backgroundColor="#3700B3" barStyle="light-content" /> */}
      <Box safeAreaTop bg='white' shadow={2} width='100%' paddingX={3} marginBottom={3} paddingBottom={2}>
        {children}
      </Box>
    </>
  );
};

export default Header;
import { StatusBar, Box } from "native-base";
import React from "react";

const Header = ({ children }: { children?: React.ReactNode }) => {
      // {/* <StatusBar backgroundColor="#3700B3" barStyle="light-content" /> */}
  return (
    <Box safeAreaTop bg='white' shadow={2} width='100%' paddingX={3} paddingBottom={2} zIndex={100}>
      {children}
    </Box>
  );
};

export default Header;
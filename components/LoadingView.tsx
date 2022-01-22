import { Box, Center, Spinner } from "native-base";
import React from "react";

interface LoadingViewProps {
  isLoading: boolean;
  children: React.ReactNode;
};

const LoadingView = ({ isLoading, children }: LoadingViewProps) => {
  return (
    <Box flex={1} width="100%">
      {isLoading ? <Spinner size="lg" marginY={5} alignSelf={'center'} justifySelf={'center'}/> : children}
    </Box>
  );
};

export default LoadingView;
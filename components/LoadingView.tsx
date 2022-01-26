import { Box, Center, Spinner } from "native-base";
import React from "react";

interface LoadingViewProps {
  isLoading: boolean;
  children: React.ReactNode;
  [key: string]: any;
};

const LoadingView = (props: LoadingViewProps) => {
  const { isLoading, children } = props;
  return (
    <Box flex={1} width="100%" {...props}>
      {isLoading ? <Spinner size="lg" marginY={5} alignSelf={'center'} justifySelf={'center'}/> : children}
    </Box>
  );
};

export default LoadingView;
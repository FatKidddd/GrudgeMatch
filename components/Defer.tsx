import { useState, useMemo, useEffect, Children } from "react";
import { useIsMounted } from "../hooks/common";

const Defer = ({ chunkSize=1, children }: { chunkSize?: number, children: React.ReactNode }) => {
  const [renderedItemsCount, setRenderedItemsCount] = useState(chunkSize);
  const isMounted = useIsMounted();

  const childrenArray = useMemo(() => Children.toArray(children), [
    children
  ]);

  useEffect(() => {
    if (renderedItemsCount < childrenArray.length) {
      window.requestIdleCallback(
        () => {
          if (!isMounted.current) return;
          setRenderedItemsCount(
            Math.min(renderedItemsCount + chunkSize, childrenArray.length)
          );
        },
        { timeout: 200 }
      );
    }
  }, [renderedItemsCount, childrenArray.length, chunkSize]);

  return <>{childrenArray.slice(0, renderedItemsCount)}</>
};

export default Defer;
// @ts-nocheck
import * as React from "react";
import * as _ from "lodash";
import * as FileSystem from "expo-file-system";
import SHA1 from "crypto-js/sha1";
import {
  Image,
  Animated,
  StyleSheet,
  View,
  Platform,
  ImageStyle,
  ImageSourcePropType,
  StyleProp,
  ImageProps, ImageURISource, GestureResponderHandlers,
} from "react-native";
import { BlurView } from "expo-blur";
import {useEffect, useRef, useState} from "react";
import Mutex from "async-mutex/lib/Mutex";
import {FileSystemDownloadResult} from "expo-file-system/src/FileSystem.types";
import {DownloadProgressData} from "expo-file-system";

/// @aryk - Based off the react-native-expo-image-cache
// https://github.com/wcandillon/react-native-expo-image-cache
//
// https://github.com/wcandillon/react-native-expo-image-cache/issues/168

const black = "black";
const white = "white";
const propsToCopy = [
  "borderRadius",
  "borderBottomLeftRadius",
  "borderBottomRightRadius",
  "borderTopLeftRadius",
  "borderTopRightRadius"
];
const isRemoteUri = (uri: string) => Boolean(uri) && uri.startsWith("http");

interface DownloadOptions {
  md5?: boolean;
  headers?: { [name: string]: string };
}
type StorageKeyFromUriType = (uri: string) => string;

interface CacheEntryOptions extends DownloadOptions {
  // Change the logic for where the local file is stored. This would be the place for example to chop off the
  // query string if you don't want it downloading a new version just because the query strings changed.
  storageKeyFromUri?: StorageKeyFromUriType;
  debug?: (str: string) => any;
  directory: string;
  defaultExtension?: string;
}
interface ICacheEntryResult {
  filename: string;
  ext:      string;
  path:     string;
  tmpPath:  string;
  baseDir:  string;
  ensureFolderExistsAsync:  () => Promise<void>;
  getCachedAsync:           () => Promise<string>;
  downloadAsync:            (options?: {onProgress: (progress: number) => any}) => Promise<string>;
  getCachedOrDownloadAsync: (options?: {onProgress: (progress: number) => any}) => Promise<string>;
}
const CacheEntry = (
  uri: string,
  {
    debug,
    directory,
    defaultExtension: de,
    storageKeyFromUri = uri => uri,
    ...options
  }: CacheEntryOptions): ICacheEntryResult => {
  const downloadingMutex = new Mutex();

  const storageLocation = (() => {
    const filename = uri.substring(uri.lastIndexOf("/"), uri.indexOf("?") === -1 ? uri.length : uri.indexOf("?"));
    const ext      = filename.indexOf(".") === -1 ? (de ? `.${de}` : "") : filename.substring(filename.lastIndexOf("."));
    const path     = `${directory}${SHA1(storageKeyFromUri(uri))}${ext}`;
    const tmpPath  = `${directory}${SHA1(uri)}-${_.uniqueId()}${ext}`;

    return {filename, ext, path, tmpPath, baseDir: directory};
  })();

  // Returns the local path to the asset.
  const getCachedAsync = async () => {
    const {path} = storageLocation;
    if ((await FileSystem.getInfoAsync(path)).exists) {
      debug?.(`Cache Hit: ${uri}`);
      return path;
    } else  {
      return undefined;
    }
  };

  const ensureFolderExistsAsync = async () => {
    if (!(await FileSystem.getInfoAsync(directory)).exists) {
      debug?.(`Creating Directory: ${directory}`);
      // @aryk - Based on my testing this takes an average of 250-500ms to execute which makes the images load in slower
      // We should only be running this when we go to download the file initially and definitely not on retrieval from the cache.
      await FileSystem.makeDirectoryAsync(directory);
    }
  };

  const _downloadAsync = async ({withRetry = true, onProgress = undefined} = {}) => {
    debug?.(`Downloading [First Version]: ${uri}`);
    const {tmpPath, path} = storageLocation;
    let result: FileSystemDownloadResult;
    try {
      const callback = (data: DownloadProgressData) => onProgress?.(data.totalBytesWritten / data.totalBytesExpectedToWrite);
      result = await FileSystem.createDownloadResumable(uri, tmpPath, options, callback).downloadAsync();
    } catch (e) {
      if (withRetry) {
        // If we get an error, we just assume it's because there is no directory...so make the directory and try again.
        await ensureFolderExistsAsync();
        return await _downloadAsync({withRetry: false});
      } else {
        throw e;
      }
    }
    // If the image download failed, we don't cache anything
    if (result && result.status !== 200) {
      throw `Download Failed: ${JSON.stringify(result)}`;
    } else {
      await FileSystem.moveAsync({from: tmpPath, to: path});
      return path;
    }
  };

  // Downloads the asset but only one at a time.
  const downloadAsync = async ({onProgress}) => {
    if (downloadingMutex.isLocked()) {
      debug?.(`Downloading [Finished Waiting]: ${uri}`);
      let interval;
      try {
        if (onProgress) {
          // If waiting for another download to finish...create a fake progress indicator here (better then nothing)
          let fakeProgress = 0;
          interval = setInterval(() => { fakeProgress += 0.1 ; onProgress(fakeProgress < 1 ? fakeProgress : 1); }, 100);
        }
        await downloadingMutex.waitForUnlock();
      } finally {
        clearInterval(interval);
      }
      onProgress?.(1);
      debug?.(`Downloading [Waiting]: ${uri}`);
      return getCachedAsync();
    } else {
      return await downloadingMutex.runExclusive(() => _downloadAsync({onProgress}));
    }
  };

  // Check first if it is local, otherwise download it.
  const getCachedOrDownloadAsync = async ({onProgress}) => {
    const path = await getCachedAsync();
    if (path) {
      debug?.(`Cache Hit: ${uri}`);
      return path;
    } else {
      return await downloadAsync({onProgress});
    }
  };

  return {
    ...storageLocation,
    ensureFolderExistsAsync,
    getCachedAsync,
    downloadAsync,
    getCachedOrDownloadAsync,
  };
};
interface ICreateLocalFileCacheResult {
  get: (uri: string, options?: Omit<CacheEntryOptions, "directory">) => ICacheEntryResult;
  directory: string;
  clearAsync: () => Promise<any>;
  sizeAsync: () => Promise<number>;
}
interface ICreateLocalFileCache extends Omit<CacheEntryOptions, "directory"> {
  directoryName?: string;
}
// @aryk - This is completely abstracted away from the usage for images. You can use it for files, vidoes, etc.
const createLocalFileCache = ({directoryName = "local-file-cache", ...cacheEntryOptions}: ICreateLocalFileCache = {}) => {
  const entries:{ [uri: string]: ICacheEntryResult } = {};

  const directory = `${FileSystem.cacheDirectory}${directoryName}/`;

  const get = (uri: string, options: Omit<CacheEntryOptions, "directory"> = {}): ICacheEntryResult => {
    if (!entries[uri]) {
      entries[uri] = CacheEntry(uri, {directory, ...cacheEntryOptions, ...options});
    }
    return entries[uri];
  };

  return {
    get,
    directory,
    clearAsync: async () => {
      await FileSystem.deleteAsync(directory, { idempotent: true });
      await FileSystem.makeDirectoryAsync(directory);
    },
    sizeAsync: async () => {
      const result = await FileSystem.getInfoAsync(directory);
      if (!result.exists) {
        throw new Error(`${directory} not found`);
      }
      return result.size;
    },
  }
};

const imageCacheRef = React.createRef<ICreateLocalFileCacheResult>();
const defaultGetCacheEntry = (uri, options) => imageCacheRef.current.get(uri, options);
const setDefaultImageCache = (cache: ICreateLocalFileCacheResult) => {
  (imageCacheRef as any).current = cache;
  console.log('set cache')
};

type ErrorType = { nativeEvent: { error: Error } }; // compatible with the ImageProps error.

interface CachedImageProps extends Omit<ImageProps, "source">, GestureResponderHandlers {
  style?: StyleProp<ImageStyle>;
  // Pass in previews in order from least desired to most desired. So the last preview should be maybe your medium
  // size image if you are trying to present your "large".
  previews?: ImageSourcePropType[];
  options?: DownloadOptions;
  transitionDuration?: number;
  tint?: "dark" | "light";
  onError?: (error: ErrorType) => void;
  uri: string;
  blurIntensity?: number;
  // In case you want to bypass the cache like to test your progress indicator
  bypassCache?: boolean;
  debug?: boolean | ((str: string) => any);
  useNativeDriver?: boolean;
  getCacheEntry?: ICreateLocalFileCacheResult["get"];
  ProgressIndicatorComponent?: React.ComponentType<{progress?: number}>;
}
const CachedImage = ({
  uri,
  transitionDuration = 100,
  tint = "dark",
  onError: _onError,
  style,
  defaultSource,
  previews,
  blurIntensity = 100,
  options: _options = {},
  debug: _debug,
  useNativeDriver = true,
  getCacheEntry = defaultGetCacheEntry,
  bypassCache,
  ProgressIndicatorComponent,

  // We take all the responder props and move it onto the View to make sure it works with TouchableWithoutFeedback
  // Why? https://github.com/facebook/react-native/issues/1352#issuecomment-106938999
  onStartShouldSetResponder,
  onMoveShouldSetResponder,
  onResponderEnd,
  onResponderGrant,
  onResponderReject,
  onResponderMove,
  onResponderRelease,
  onResponderStart,
  onResponderTerminationRequest,
  onResponderTerminate,
  onStartShouldSetResponderCapture,
  onMoveShouldSetResponderCapture,

  ...props
}: CachedImageProps) => {
  const [cachedUri, _setCachedUri] = useState<string>();
  const [hasLocal,  setHasLocal]   = useState<boolean>();
  const [progress,  setProgress]   = useState<number>(0);
  const [_preview,  setPreview]    = useState<ImageSourcePropType>();
  const [previewOpacity]           = useState(new Animated.Value(1));
  const mountedRef                 = useRef<boolean>(true);

  // @aryk - We only use the preview if we checked the main uri and determined that it isn't local...otherwise we want to
  // sshow the image immediately. We still want to check the previews for what is local as well in parallel, but we
  // don't use it unless we need to.
  const preview = hasLocal === false ? _preview : undefined;

  const debug = _debug === true ? console.log : (_debug || undefined);
  const options = {debug, ..._options};

  // If we don't have a progress indicator, no reason to set the progress and trigger state updates.
  const onProgress = ProgressIndicatorComponent ? setProgress : undefined;

  const onError = (error: Error) => {
    _onError?.({nativeEvent: {error}});
    debug?.(JSON.stringify(error));
  };

  useEffect(
    () => {
      if (previews) {
        debug?.(`New previews: ${previews.length}`);
        (async () => {
          try {
            // Go through and try to look for all the possible previews including cached images (maybe smaller thumbnails)
            const imageSources: ImageSourcePropType[] = await Promise.all(
              previews.map(async preview => {
                if (typeof (preview) === "object" && !Array.isArray(preview) && isRemoteUri((preview as ImageURISource).uri)) {
                  const uri = await getCacheEntry((preview as ImageURISource).uri, options).getCachedAsync();
                  return uri ? {...(preview as ImageURISource), uri} : undefined;
                } else {
                  return preview;
                }
              })
            );

            const preview = _.last(imageSources.filter(x => x));
            if (preview) {
              debug?.(`Setting preview: ${JSON.stringify(preview)}\nFor ${uri}`);
              setPreview(preview);
            }
          } catch (e) {
            onError(e);
          }
        })();
      }
    },
    [previews],
  );

  const setCachedUri = (u: string) => {
    _setCachedUri(u);
    debug?.(`Setting cached uri preview: ${u}`);
    if (!cachedUri) {
      Animated.timing(previewOpacity, {
        duration: transitionDuration,
        toValue: 0,
        useNativeDriver,
      }).start();
    }
  };

  useEffect(
    () => {
      if (uri) {
        (async () => {
          try {
            const cacheEntry = getCacheEntry(uri, options);
            let cachedUri = isRemoteUri(uri) ? (bypassCache ? null : await cacheEntry.getCachedAsync()) : uri;
            // If we were able to get it from the cache or it's already a local image like base64 or file://, then set this
            // so that we don't go and try to load the previews in tandem with the cached image.

            setHasLocal(Boolean(cachedUri));
            if (!cachedUri) {
              cachedUri = await cacheEntry.downloadAsync({onProgress});
            }
            if (mountedRef.current) {
              if (cachedUri) {
                setCachedUri(cachedUri);
              } else {
                onError(new Error(`Could not load image: ${uri}`));
              }
            }
          } catch (e) {
            console.log('died')
            onError(e);
          }
        })()
      }
    },
    [uri], // only want this to run when uri changes, everything else will get the new value at the time that "uri" changes.
  );

  useEffect(() => () => { mountedRef.current = false; }, []);

  const isImageReady   = Boolean(cachedUri);
  const blurPreview    = Boolean(blurIntensity);
  // Sometimes the previews come in as an empty array at first (only to get populated later on a state change). In this event,
  // we still want to enable the blur view from the very beginning before showing the subsequent image.
  const enablePreviews = Boolean(previews);

  const flattenedStyle = StyleSheet.flatten(style);
  const computedStyle: StyleProp<ImageStyle> = [
    StyleSheet.absoluteFill,
    _.transform(_.pickBy(flattenedStyle, (_val, key) => propsToCopy.indexOf(key) !== -1), (result, value: any, key) =>
      Object.assign(result, { [key]: value - (flattenedStyle.borderWidth || 0) })
    )
  ];

  return <View
    {...{
      style,
      onStartShouldSetResponder,
      onMoveShouldSetResponder,
      onResponderEnd,
      onResponderGrant,
      onResponderReject,
      onResponderMove,
      onResponderRelease,
      onResponderStart,
      onResponderTerminationRequest,
      onResponderTerminate,
      onStartShouldSetResponderCapture,
      onMoveShouldSetResponderCapture,
    }}
  >
    {!!defaultSource && !isImageReady && <Image source={defaultSource} style={computedStyle} {...props} />}
    {isImageReady && <Image
      source={{ uri: cachedUri }}
      style={computedStyle}
      onLoadStart={() => debug?.(`Loading (started): ${cachedUri}`)}
      onLoadEnd={() => debug?.(`Loading (finished): ${cachedUri}`)}
      {...props}
    />}
    {
      enablePreviews && <>
        {
          preview && <Animated.Image
            source={preview}
            style={[computedStyle, {opacity: previewOpacity}]}
            blurRadius={Platform.OS === "android" && blurPreview ? 0.5 : 0}
            {...props}
          />
        }
        {
          blurPreview &&
          (Platform.OS === "ios" && <Animated.View style={[computedStyle, {opacity: previewOpacity}]}>
            <BlurView
              style={computedStyle}
              tint={tint}
              intensity={blurIntensity}
            />
          </Animated.View>) ||
          (Platform.OS === "android" && <Animated.View style={
            [
              computedStyle,
              {
                backgroundColor: tint === "dark" ? black : white,
                opacity: previewOpacity.interpolate({
                  inputRange:  [0, 1], // 200 would basically be full blur, so just divide it
                  outputRange: [0, blurIntensity / 200]
                }),
              }
            ]
          } />)
        }
      </>
    }
    {
      // We only want to show the progress indicator if we have a non zero progress...
      ProgressIndicatorComponent && Boolean(progress) && <Animated.View
        style={[
          computedStyle,
          {alignItems: "center", justifyContent: "center", opacity: previewOpacity},
        ]}>
        <ProgressIndicatorComponent progress={progress} />
      </Animated.View>
    }
  </View>;
};

export {
  createLocalFileCache,
  DownloadOptions,
  ICacheEntryResult,
  CacheEntry,
  CachedImage,
  CachedImageProps,
  setDefaultImageCache,
};
export const tryAsync = async <T,>(promise: Promise<T>): Promise<[T|null, any]> => {
  try {
    const data = await promise;
    return [data, null];
  } catch (err) {
    console.error(err);
    return [null, err];
  }
};
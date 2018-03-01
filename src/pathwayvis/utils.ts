export const mapValues = <TValue, TResult>(map: Map<string, TValue>, cb: (value: TValue) => TResult): Map<string, TResult> =>
  Object.assign({},
    ...Object.entries(map)
      .map(([key, value]) => ({[key]: cb(value)})),
    );

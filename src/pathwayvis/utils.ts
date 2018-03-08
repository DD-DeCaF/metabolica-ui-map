export function _mapValues (object, callback) {
    return Object.assign({},
        ...Object.entries(object)
          .map(([key, value]) => ({[key]: callback(value)})));
}

export function _pickBy (object, callback) {
    return Object.assign({},
        ...Object.entries(object).filter(([key, value]) => (callback(value)))
          .map(([key, value]) => ({[key]: value})));
}


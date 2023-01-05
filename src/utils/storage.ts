import AsyncStorage from '@react-native-async-storage/async-storage';

//To save a key-value pair in async storage
export async function saveString(key: string, value: string) {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {}
}

//To retrieve a value from a key 
export async function loadString(key: string) {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (e) {
    return null;
  }
}

//To save a key -> object value, pair 
export async function saveObject(key: string, value: Object) {
  const jsonValue = JSON.stringify(value);
  return saveString(key, jsonValue);
}

//To retrieve the object value from a key
export async function loadObject(key: string) {
  try {
    const jsonValue = await loadString(key);
    if (!jsonValue) {
      return null;
    }
    const objectValue = JSON.parse(jsonValue);
    return objectValue;
  } catch (err) {}
  return null;
}

//To delete a key-value entry permanently
export async function remove(key: string) {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {}
}

//To check if a key exists in async-storage
export async function hasKey(key: string) {
  try {
    const result = await loadString(key);
    return Boolean(result);
  } catch (e) {}
  return false;
}

//To delete all data in async-storage
export async function wipeAllKeys() {
  try {
    await AsyncStorage.clear();
  } catch (e) {}
}

import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { ThemeEnum, setTheme } from '../redux/themeSlice';

export default function Rough() {

  const dispatch = useAppDispatch()
  const theme = useAppSelector(state => state.theme.currentTheme)

  useEffect(() => {
    console.log("Redux Works, theme changed : ", theme)
  },[theme])

  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <Button onPress={
        ()=>{
          dispatch(setTheme(ThemeEnum.DARK))
        }
      }
      title='Fire'
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

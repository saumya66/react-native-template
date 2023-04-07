import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import Rough from './src/components/Rough';

export default function App() {
 
  return (
    <Provider store={store}>
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
       <Rough/>
      <StatusBar style="auto" />
    </View>
  </Provider>
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

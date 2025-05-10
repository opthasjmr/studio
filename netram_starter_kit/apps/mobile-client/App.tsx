
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
// Import navigation components if you plan to use React Navigation
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';

// Example: Placeholder for a Login Screen
const LoginScreen = ({navigation}: any) => (
  <View style={styles.screenContainer}>
    <Text style={styles.title}>Vision Care Plus</Text>
    <Text style={styles.subtitle}>Patient Login</Text>
    {/* Add Input fields for email/password here */}
    <Button title="Login" onPress={() => navigation.navigate('Dashboard')} />
    <Button title="Sign Up" onPress={() => { /* Navigate to Sign Up */ }} />
  </View>
);

// Example: Placeholder for a Dashboard Screen
const DashboardScreen = () => (
  <View style={styles.screenContainer}>
    <Text style={styles.title}>Patient Dashboard</Text>
    <Text style={styles.body}>Welcome, [Patient Name]!</Text>
    <Text style={styles.body}>Upcoming Appointments:</Text>
    {/* List upcoming appointments */}
    <Text style={styles.body}>My Prescriptions:</Text>
    {/* List prescriptions */}
  </View>
);

// const Stack = createStackNavigator();

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      {/* 
        Uncomment and use NavigationContainer if you set up React Navigation
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
            <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
            // Add other screens like PatientList, AppointmentDetails etc.
          </Stack.Navigator>
        </NavigationContainer>
      */}
      {/* Placeholder content if not using React Navigation immediately */}
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
            padding: 20,
          }}>
          <Text style={[styles.highlight, {color: isDarkMode ? Colors.white : Colors.black,}]}>
            Welcome to Vision Care Plus Mobile App!
          </Text>
          <Text style={{color: isDarkMode ? Colors.light : Colors.dark, marginTop: 10}}>
            This is a placeholder for the main application content.
            Set up React Navigation to manage different screens like Login, Dashboard, etc.
          </Text>
          {/* Example for Login Screen direct render (without navigation) */}
          {/* <LoginScreen navigation={null} /> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    color: 'gray',
  },
  body: {
    fontSize: 16,
    marginBottom: 10,
  },
  highlight: {
    fontWeight: '700',
    fontSize: 20,
    textAlign: 'center',
  },
});

export default App;

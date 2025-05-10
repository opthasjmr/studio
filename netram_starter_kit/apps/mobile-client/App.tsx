
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Button as RNButton, // Renamed to avoid conflict with UI library Button
  ActivityIndicator,
  useColorScheme,
} from 'react-native';

import { Colors } from 'react-native/Libraries/NewAppScreen';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Firebase (conceptual for this example, full native setup needed)
// import firebase from '@react-native-firebase/app';
// import '@react-native-firebase/auth';
// import '@react-native-firebase/firestore';

// Placeholder screens
const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    // Simulate login
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    // In a real app, you'd use firebase.auth().signInWithEmailAndPassword(email, password)
    navigation.replace('MainAppTabs'); // Or specific role dashboard
  };

  return (
    <View style={styles.screenContainer}>
      <Text style={styles.title}>Vision Care Plus</Text>
      <Text style={styles.subtitle}>Patient Login</Text>
      {/* Add Input fields for email/password here (e.g., TextInput from 'react-native') */}
      {/* <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} /> */}
      {/* <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} /> */}
      {loading ? <ActivityIndicator size="large" /> : <RNButton title="Login" onPress={handleLogin} />}
      <RNButton title="Sign Up" onPress={() => navigation.navigate('SignUp')} />
    </View>
  );
};

const SignUpScreen = ({ navigation }: any) => (
  <View style={styles.screenContainer}>
    <Text style={styles.title}>Create Account</Text>
    {/* Add SignUp form fields */}
    <RNButton title="Sign Up" onPress={() => navigation.goBack()} />
     <RNButton title="Back to Login" onPress={() => navigation.goBack()} />
  </View>
);


const PatientDashboardScreen = ({navigation}: any) => (
  <ScrollView style={styles.dashboardScrollView}>
    <View style={styles.widgetCard}>
      <Text style={styles.widgetTitle}>Upcoming Appointments</Text>
      {/* List appointments */}
      <Text style={styles.bodyText}>- Dr. Smith - Eye Checkup - Tomorrow 10:00 AM</Text>
      <RNButton title="View All Appointments" onPress={() => navigation.navigate('Appointments')} />
    </View>
    <View style={styles.widgetCard}>
      <Text style={styles.widgetTitle}>My Prescriptions</Text>
      <Text style={styles.bodyText}>- Eyedrops - 2 times a day</Text>
       <RNButton title="View All Prescriptions" onPress={() => { /* Navigate to Prescriptions */ }} />
    </View>
     <View style={styles.widgetCard}>
      <Text style={styles.widgetTitle}>Medical Records</Text>
      <RNButton title="View Records" onPress={() => navigation.navigate('MedicalRecords')} />
    </View>
  </ScrollView>
);

const AppointmentsScreen = () => (
    <View style={styles.screenContainer}>
        <Text style={styles.title}>My Appointments</Text>
        {/* List of appointments, ability to schedule new */}
        <Text style={styles.bodyText}>- Dr. Smith - Eye Checkup - Confirmed</Text>
        <Text style={styles.bodyText}>- Dr. Jones - Follow-up - Scheduled</Text>
    </View>
);

const MedicalRecordsScreen = () => (
    <View style={styles.screenContainer}>
        <Text style={styles.title}>My Medical Records</Text>
        {/* EMR summaries, test results */}
        <Text style={styles.bodyText}>- Last Visit: July 20, 2024 - Diagnosis: Mild Astigmatism</Text>
        <Text style={styles.bodyText}>- OCT Scan (07/20/24): Normal</Text>
    </View>
);


// Stack Navigator for Auth screens
const AuthStack = createStackNavigator();
const AuthScreens = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="SignUp" component={SignUpScreen} />
  </AuthStack.Navigator>
);

// Main App Navigator (could be Tabs or another Stack)
const AppStack = createStackNavigator();
const MainAppScreens = () => (
  <AppStack.Navigator>
    <AppStack.Screen name="PatientDashboard" component={PatientDashboardScreen} options={{ title: 'Dashboard' }} />
    <AppStack.Screen name="Appointments" component={AppointmentsScreen} />
    <AppStack.Screen name="MedicalRecords" component={MedicalRecordsScreen} options={{ title: 'Medical Records' }} />
    {/* Add other screens like EMR, Billing for relevant roles */}
  </AppStack.Navigator>
);


// Root Navigator
const RootStack = createStackNavigator();

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any | null>(null); // Replace 'any' with Firebase User type

  // Handle user state changes on mount
  // function onAuthStateChanged(userAuth: any) { // Firebase User type
  //   setUser(userAuth);
  //   if (initializing) setInitializing(false);
  // }

  useEffect(() => {
    // const subscriber = firebase.auth().onAuthStateChanged(onAuthStateChanged);
    // return subscriber; // unsubscribe on unmount

    // Simulate Firebase initialization and auth state check
    const initFirebase = async () => {
        // if (!firebase.apps.length) {
        //     await firebase.initializeApp({ ... }); // Your Firebase config for mobile
        // }
        // Simulate auth state check
        await new Promise(resolve => setTimeout(resolve, 1500));
        // setUser(null); // or a mock user
        setInitializing(false);
    };
    initFirebase();

  }, []);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  const navigationTheme = isDarkMode ? DarkTheme : DefaultTheme;

  if (initializing) {
    return (
        <View style={[styles.screenContainer, backgroundStyle, {justifyContent: 'center'}]}>
            <ActivityIndicator size="large" color={isDarkMode ? Colors.white : Colors.black} />
            <Text style={[styles.bodyText, {color: isDarkMode ? Colors.light : Colors.dark, marginTop: 10}]}>Initializing App...</Text>
        </View>
    );
  }

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <NavigationContainer theme={navigationTheme}>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <RootStack.Screen name="MainAppTabs" component={MainAppScreens} />
          ) : (
            <RootStack.Screen name="Auth" component={AuthScreens} />
          )}
        </RootStack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start', // Changed to flex-start for more typical screen layout
    padding: 20,
  },
  dashboardScrollView: {
    flex: 1,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    color: 'gray',
    textAlign: 'center',
  },
  bodyText: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 22,
  },
  widgetCard: {
    backgroundColor: '#FFFFFF', // Assuming light mode default, adjust for dark mode
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  widgetTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  input: { // Example input style
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    width: '80%', // Adjust as needed
    borderRadius: 5,
  },
});

export default App;

import React, { useState, useEffect, useRef } from 'react';
import * as Font from 'expo-font';
import { Animated } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import SplashScreenComponent from './components/SplashScreen';
import HomeScreen from './components/HomeScreen';
import LoginForm from './components/LoginForm';
import RoomsScreen from './components/RoomsScreen';
import MyRoomsScreen from './components/MyRoomsScreen';
import MyReservationsScreen from './components/MyReservationsScreen';
import CreateRoomForm from './components/CreateRoomForm';
import RoomDetailScreen from './components/RoomDetailScreen';

SplashScreen.preventAutoHideAsync();

const App: React.FC = () => {
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);
  const [showLogin, setShowLogin] = useState<boolean>(false);
  const [showRooms, setShowRooms] = useState<boolean>(false);
  const [showMyRooms, setShowMyRooms] = useState<boolean>(false);
  const [showMyReservations, setShowMyReservations] = useState<boolean>(false);
  const [showCreateRoom, setShowCreateRoom] = useState<boolean>(false);
  const [showRoomDetail, setShowRoomDetail] = useState<boolean>(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [showPreload, setShowPreload] = useState<boolean>(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Font.loadAsync({
      'Roboto': require('./assets/fonts/Roboto-Regular.ttf'),
      'Roboto-Bold': require('./assets/fonts/Roboto-Bold.ttf'),
    }).then(() => setFontsLoaded(true));
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: true,
      }).start();
      setTimeout(() => setShowPreload(false), 4000);
    }
  }, [fontsLoaded]);

  const handleLogout = () => {
    setShowRooms(false);
    setShowMyRooms(false);
    setShowMyReservations(false);
    setShowLogin(false);
    setShowCreateRoom(false);
    setShowRoomDetail(false);
  };

  const handleRoomDetail = (room: any) => {
    setSelectedRoom(room);
    setShowRoomDetail(true);
  };

  if (!fontsLoaded || showPreload) {
    return <SplashScreenComponent fadeAnim={fadeAnim} />;
  }

  if (showLogin) {
    return <LoginForm 
      onBack={() => setShowLogin(false)} 
      onLoginSuccess={() => {
        console.log('onLoginSuccess appelé dans App.tsx, redirection vers les salles');
        setShowLogin(false);
        setShowRooms(true);
      }} 
    />;
  }

  if (showCreateRoom) {
    return <CreateRoomForm onBack={() => setShowCreateRoom(false)} />;
  }

  if (showRoomDetail && selectedRoom) {
    return <RoomDetailScreen 
      room={selectedRoom}
      onBack={() => setShowRoomDetail(false)}
    />;
  }

  if (showMyReservations) {
    return <MyReservationsScreen 
      onBack={() => setShowMyReservations(false)} 
    />;
  }

  if (showMyRooms) {
    return <MyRoomsScreen 
      onBack={() => setShowMyRooms(false)} 
      onRoomDetail={handleRoomDetail}
    />;
  }

  if (showRooms) {
    return <RoomsScreen 
      onBack={() => setShowRooms(false)} 
      onLogout={handleLogout}
      onCreateRoom={() => setShowCreateRoom(true)}
      onGoToLogin={() => setShowLogin(true)}
      onRoomDetail={handleRoomDetail}
      onShowMyRooms={() => setShowMyRooms(true)}
      onShowMyReservations={() => setShowMyReservations(true)}
    />;
  }

  return <HomeScreen onGo={() => setShowLogin(true)} onRooms={() => setShowRooms(true)} />;
};

export default App; 
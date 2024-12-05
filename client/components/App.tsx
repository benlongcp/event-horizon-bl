import React, {useState, useEffect, useRef} from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import '../style.css';
import SelectGame from './game/SelectGame.tsx';
import Profile from './profile/Profile.tsx';
import LeaderBoard from './leaderboard/Leaderboard.tsx';
import UserCards from './cards/UserCards.tsx';
import NavigationBar from './Navigation.tsx';
import Instructions from './Instructions.tsx';
import TitleMenu from './navigations/TitleMenu.tsx';
import LandingPage from './LandingPage.tsx';
import UserDecks from './cards/UserDecks.tsx'
import GameBoard from './game/GameBoard.tsx';
import Friends from './profile/Friends.tsx';
import CardsPage from './cards/CardsPage.tsx';
import Settings from './profile/Settings.tsx';
import axios from 'axios';
interface User {
  id: number;
  name: String;
  email: String;
  username: String;
}

export default function App (){
  const [user, setUser] = useState<User | null>(null);
  const [friends, setFriends] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCbMode, setCbMode] = useState(false);
  const [userSettings, setUserSettings] = useState(null)
  const navigate = useNavigate();
  // dark mode toggle
  const toggleDarkMode = () => {
    // setIsDarkMode((prevMode) => !prevMode);
    document.documentElement.classList.toggle('dark')
  };

  const handleLogin = () => {
    window.location.href = '/login';
  };
  // fetch user
  const fetchUser = async () => {
    const fetchedUser = await axios.get('/profile')
    .then((user) => {
      AuthCheck(user.data);
    })
    .catch((err) => {
      console.error('Failed to fetch user');
    });
  };
  // authenticate user handler
  const AuthCheck = async (user: any) => {
    try {

      const response = await axios.get('/api/auth-check');
      setIsAuthenticated(response.data.isAuthenticated);

      // Fetch user profile if authenticated
      if (response.data.isAuthenticated) {
        setUser(response.data.user);
        
        // fetcher users settings
        const userSetting = await axios.get(`/profile/settings/${response.data.user.id}`);
        // set userSettings
        setUserSettings(userSetting.data);

        if(userSetting.data.colorblind_mode){
          const root = document.documentElement;
          root.classList.add('cbMode');
        }
        if(userSetting.data.dark_mode){
          toggleDarkMode();
        }

        // update cards if necessary
        await axios.post(`/profile/collections/${response.data.user.id}`)

        /* this is used in main App on startup to set the state of dark_mode && colorblind_mode
        =======================================================================================
        const userSettings = await axios.get(`/profile/settings/${response.data.user.id}`)

        setCbMode(userSettings.data.colorblind_mode);
        setIsDarkMode(userSettings.data.dark_mode);
        =======================================================================================
        */
      } else {
        setUser(null);
      }
    } catch (error) {
      setIsAuthenticated(false);
      throw new Error('Error checking auth', error);
    }
  };
  //retrieves user's friends
  const getFriends = async () => {
    if(user) {
      const allFriends = await axios.get(`/friends/${user.id}`)
        .then((fetchedFriends) => {
          if(fetchedFriends) {
            setFriends(fetchedFriends.data.friends);
          }  else {
            console.error('Failed to fetch users friends');
          }
        })
        .catch((err) => {
          console.error('Failed to fetch friends');
        })
    } else {
      return [];
    }
  };
  // game inv handler?
  const handleInvite = (friendId: string) => {
    console.log(`Sending inv to friend ${friendId}`);
  };
  //add friend handler
  const handleAddFriend = async (friendId: string) => {
    try {
      if(user){
        const addedFriend = await axios.post(`/friends/${user.id}`, {
          data: {
            id: friendId
          }
        });
        if(addedFriend) {
          console.log('added friend', addedFriend);
          getFriends();
        } else {
          console.error('No user logged in');
        }
      }
    } catch (error) {
      console.error('Error adding friend');
    }
  };

  const toggleCbMode = () => {
    const root = document.documentElement;

    // if(typeof bool === 'boolean' && bool){
    //   root.classList.add('cbMode');
    // } else if(typeof bool === 'boolean' && bool !== undefined){
    //     root.classList.remove('cbMode');
    // }
    if (isCbMode) {
      root.classList.remove('cbMode');
    } else {
      root.classList.add('cbMode');
    }
    setCbMode(!isCbMode);
  };



  //if no user, fetch user on render
  useEffect(() => {
    if(!user) {
      fetchUser();
    }

  }, [user]);

  // if user, and if users friends isn't set yet
  useEffect(() => {
    if (user && friends.length === 0) {
      getFriends();
    }
  }, [user]);

  return (
    <>
      <NavigationBar
        toggleDarkMode={toggleDarkMode}
        user={user}
        handleLogin={handleLogin}
        cbMode={toggleCbMode}
      />
      <Routes>
        <Route
          path="/"
          element={<LandingPage user={user} handleLogin={handleLogin}/>}
        />
        <Route
          path="/title-menu"
          element={isAuthenticated ? <TitleMenu user={user} /> : <Navigate to='/'/>}
        />
        <Route
          path="/instructions"
          element={<Instructions user={user} />}
        />
        <Route
          path="/user-profile"
          element={isAuthenticated ? <Profile user={user} fetchUser={fetchUser} /> : <Navigate to='/' />}
        />
        <Route
          path="/settings"
          element={isAuthenticated && user ? <Settings user={user} AuthCheck={AuthCheck} /> : <Navigate to='/' />}
        />
        <Route
          path="/cards"
          element={isAuthenticated && user ? <CardsPage user={user} /> : <Navigate to='/' />}
        />
        <Route
          path="/game-board"
          element={isAuthenticated ? <SelectGame user={user}/> : <Navigate to='/' />}
        />
        <Route
          path="/leaderboard"
          element={isAuthenticated ? <LeaderBoard user={user}/> : <Navigate to='/' />}
        />
        <Route
          path="/friends"
          element={isAuthenticated ?
            <Friends
              user={user}
              handleAddFriend={handleAddFriend}
              handleInvite={handleInvite}
              friends={friends}
              fetchUser={fetchUser}
              getFriends={getFriends}
              />
               :
             <Navigate to='/'/>}
        />
      </Routes>
    </>
  );
}
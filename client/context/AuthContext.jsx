import toast from 'react-hot-toast'
import { createContext, useEffect, useRef, useState } from "react";
import axios from 'axios';
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  const effectRan = useRef(false);

  // AUTH CHECK

  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");

      if (data.success) {
        setAuthUser(data.user);
        connectsocket(data.user);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // LOGIN
  
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);

      if (data.success) {
        setAuthUser(data.userData);
        connectsocket(data.userData)
        axios.defaults.headers.common["token"] = data.token;
        setToken(data.token);
        localStorage.setItem("token", data.token);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // LOGOUT

  const logout = async () => {
    localStorage.removeItem("token");
   

    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    axios.defaults.headers.common["token"] = null;

    toast.success("Logged out successfully");
    socket.disconnect();
  };

  // UPDATE PROFILE

  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);

      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // SOCKET CONNECTION

  const connectsocket = (userData) => {
    if (!userData && socket?.connected) return;
 
    const newsocket = io(backendUrl, {
      query: { userId: userData._id },
      withCredentials: true,
    });

    newsocket.connect();
    setSocket(newsocket);
    newsocket.on("getonlineusers", (userIds) => {
      setOnlineUsers(userIds);
    });
  };
  
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["token"] = token;
      checkAuth();
    }
  }, [token]);

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
  };

  return (
     <AuthContext.Provider value={value}>
      {children}
     </AuthContext.Provider>
    )
};

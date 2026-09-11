import toast from 'react-hot-toast'
import { createContext, useEffect, useState } from "react";
import axios from 'axios';
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL ||
  (import.meta.env.PROD ? window.location.origin : "http://localhost:5000");

axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [accessToken, setAccessToken] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // REFRESH TOKEN
  const refreshAccessToken = async () => {
    if (isRefreshing) return null;
    
    setIsRefreshing(true);
    try {
      const { data } = await axios.post("/api/auth/refresh-token");
      if (data.success) {
        setAccessToken(data.accessToken);
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;
        return data.accessToken;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      // If refresh fails, user needs to login again
      logout();
      return null;
    } finally {
      setIsRefreshing(false);
    }
  };

  // LOGIN
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);

      if (data.success) {
        setAuthUser(data.userData);
        setAccessToken(data.accessToken);
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;
        connectsocket(data.userData);
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
    try {
      await axios.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    }
    
    setAccessToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    axios.defaults.headers.common["Authorization"] = null;

    if (socket) {
      socket.disconnect();
    }
    toast.success("Logged out successfully");
  };

  // LOGOUT ALL DEVICES
  const logoutAll = async () => {
    try {
      await axios.post("/api/auth/logout-all");
    } catch (error) {
      console.error("Logout all error:", error);
    }
    
    setAccessToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    axios.defaults.headers.common["Authorization"] = null;

    if (socket) {
      socket.disconnect();
    }
    toast.success("Logged out from all devices successfully");
  };

  // UPDATE PROFILE
  const updateProfile = async (body) => 
  {
    try 
    {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) 
      {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      }
    }catch(error) 
    {
      toast.error(error.response?.data?.message || error.message);
    }
  };
  
  // SOCKET CONNECTION
  const connectsocket = (userData) => {
    if (!userData || !userData._id) return;
    
    // Disconnect existing socket if any
    if (socket?.connected) {
      socket.disconnect();
    }

    const newsocket = io(backendUrl, {
      query: { userId: userData._id },
      withCredentials: true,
      transports: ["websocket"]
    });

    setSocket(newsocket);
    newsocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });
  };
  
  useEffect(() => {
    // Setup axios interceptor for automatic token refresh
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // If error is 401 and we haven't tried refreshing yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          const newToken = await refreshAccessToken();
          if (newToken) {
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            return axios(originalRequest);
          }
        }
        
        return Promise.reject(error);
      }
    );

    // Check if user has valid session on mount
    const checkSession = async () => {
      try {
        await refreshAccessToken();
        if (accessToken) {
          checkAuth();
        }
      } catch (error) {
        console.log("No valid session found");
      }
    };
    
    checkSession();

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    accessToken,
    login,
    logout,
    logoutAll,
    updateProfile,
  };

  return (
     <AuthContext.Provider value={value}>
      {children}
     </AuthContext.Provider>
  )
};

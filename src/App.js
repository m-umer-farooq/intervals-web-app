import React, { useEffect } from "react";
import AuthUser from "./components/AuthUser";
import { useNavigate } from 'react-router-dom';
import Guest from "./navbar/guest";
import Auth from "./navbar/auth";

function App() {

  const { getToken, token } = AuthUser()
  const navigate = useNavigate()
  const pathname = window.location.pathname

  useEffect(() => {
    if (token === null && pathname !== '/login') {
      navigate('/login')
    }
    // eslint-disable-next-line
  }, []);

  if (!getToken()) {
    return <Guest />
  } else {

    return (<Auth />)
  }
}

export default App;
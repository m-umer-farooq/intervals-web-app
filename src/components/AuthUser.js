import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthUser() {

    const navigate = useNavigate();

    const getToken = () => {
        const tokenString = sessionStorage.getItem('token');
        const userToken = JSON.parse(tokenString);
        return userToken;
    }

    const getUser = () => {
        const userString = sessionStorage.getItem('user');
        const userDetail = JSON.parse(userString);
        return userDetail;
    }

    const [token, setToken] = useState(getToken());
    const [user, setUser] = useState(getUser());

    const saveToken = (user, token) => {

        var user_detail = { 'id': user.intervals_id };
        sessionStorage.setItem('token', JSON.stringify(token));
        sessionStorage.setItem('user', JSON.stringify(user_detail));
        setToken(token);
        setUser(user);
        navigate('/reports');
    }

    const logout = async () => {
        //console.log(user_detail);
        await http.post('/log-data', {
            log_type: 'logout',
            log_detail: 'user logout'
        }).then((res) => {
            //console.log(res)
        }).catch(error => {
        });

        sessionStorage.clear();
        navigate('/login');
    }

    const http = axios.create({
        //baseURL: "https://intervals-api-test.cubivue.com/api",
        baseURL: "http://127.0.0.1:8000/api",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
        }
    });

    return {
        setToken: saveToken,
        token,
        user,
        getToken,
        http,
        logout
    }
}
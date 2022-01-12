import {useHistory} from 'react-router-dom';

import React from 'react'
import Cookies from 'js-cookie'
import { useEffect, useState } from 'react'

import Button from '@material-ui/core/Button'

const LogoutButton = (props) => {
    const history = useHistory();

    // Used for when token runs out to get new one.
    
    const relogin = () => history.push('/')

    const [token, setToken] = useState()

    useEffect(() => {
      setToken(Cookies.get('spotifyAuthToken'))
    }, []);

    const remove_token = () => {
        Cookies.remove('spotifyAuthToken')
        setToken(undefined)
        props.onLogout()
    //   relogin()
    }


    return (
        <>
        {token !== undefined ? (<div className="header-btn"><Button variant="contained" color="primary" onClick={remove_token}>Logout</Button></div>):(<></>)}
        </>
    )
}
export default LogoutButton

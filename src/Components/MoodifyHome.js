import React from 'react'
import { SpotifyApiContext } from 'react-spotify-api'
import Cookies from 'js-cookie'
import { SpotifyAuth, Scopes } from 'react-spotify-auth'
import 'react-spotify-auth/dist/index.css'
import { useEffect, useState } from 'react'
import {useHistory} from 'react-router-dom';
import MoodifyTop from './MoodifyTop'
import Button from '@material-ui/core/Button'
import LogoutButton from '../Components/MoodifyComponents/logoutbutton'
import logo from '../moodifylogo.png'

// Store api key in string constant in separate file excluded in gitignore
import spotify_client from '../apikeys'

const MoodifyHome = (props) => {
  const history = useHistory();
  // Used for when token runs out to get new one.
  const relogin = () => history.push('/')

  const [updateTokenFlag, setUpdateTokenFlag] = useState(true)

  const [token, setToken] = useState()

  const [exportPlaylistFlag, setExportPlaylistFlag] = useState("No")
  
  useEffect(() => {
    // if(updateTokenFlag){
    //   setUpdateTokenFlag(false)
    //   // token_check()
    // }
    if (Cookies.get('spotifyAuthToken')){
      setToken(Cookies.get('spotifyAuthToken'))
    }

  }, []);

  useEffect(() => {
    console.log("TOKEN CHANGED", token)
    relogin()
  }, [token]);

  const token_check = async () => {
    while(true){
      await token_check_util(1000)
    }
  }

  const handleLogout = () => {
    setToken(undefined)
  }

  const handleExport = () => {
    setExportPlaylistFlag("Yes")
  }

  const handleExportDone = () => {
    setExportPlaylistFlag("No")
  }

  const token_check_util = (ms) => { //pass a time in milliseconds to this function
    // console.log("CHECKING TOKEN...")
    // console.log(Cookies.get('spotifyAuthToken'))
    setToken(Cookies.get('spotifyAuthToken')) // Used for main homepage react
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  return (
    <>
    <header className="App-header">
        <img src={logo} className="App-logo"/>
        <p className="header-text-main">Moodify</p>
        <div className='header-btns'>
          {token ? (<>
            <div className="header-btn">
              <Button variant="contained" color="primary" onClick={handleExport}>Export Playlist</Button>
            </div>
            <LogoutButton onLogout={handleLogout}/>
          </>):(<></>)}

        </div>
        
    </header>
    <div className='main-body'>
      {token ? (
        <SpotifyApiContext.Provider value={token}>
          {/* Your Spotify Code here */}
          {/* <p>You are authorized with token2: {token}</p> */}
          <MoodifyTop props={props} export={exportPlaylistFlag} handledExport={handleExportDone}/>
        </SpotifyApiContext.Provider>
      ) : (
        // Display the login page
        <>
            <div className="spofity-login-center">
                <SpotifyAuth
                // redirectUri='http://localhost:3000/'
                redirectUri='https://moodify.party/'
                clientID={spotify_client}
                scopes={[Scopes.userReadPrivate, 'user-read-email',
                                                  'app-remote-control',
                                                  'streaming',
                                                  'user-library-modify',
                                                  'user-library-read',
                                                  'user-read-playback-state',
                                                  'user-modify-playback-state',
                                                  'user-read-currently-playing',
                                                  'playlist-modify-private',
                                                  'playlist-read-private',
                                                  'playlist-modify-public',
                                                  'playlist-read-collaborative'
                                                ]} // either style will work
                />
              <br></br>
              <p>*Premium account required*</p>
            </div>


        </>
      )}
    </div>
    </>
  )
}
export default MoodifyHome
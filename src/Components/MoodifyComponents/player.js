import logo from '../../moodifylogo.png';

import ErrorToast from './ErrorToast';

import '../../css/main.css'

import Slider from '@material-ui/core/Slider';
import VolumeDown from '@material-ui/icons/VolumeDown';
import VolumeUp from '@material-ui/icons/VolumeUp';

import {useHistory} from 'react-router-dom';

import React from 'react'
import Cookies from 'js-cookie'
import 'react-spotify-auth/dist/index.css'
import { useEffect, useState } from 'react'
import axios from "axios"
import { Button } from '@material-ui/core'
import IconButton from '@material-ui/core/IconButton'
import AddIcon from '@material-ui/icons/Add'
import PlayArrow from '@material-ui/icons/PlayArrow'
import PauseIcon from '@material-ui/icons/Pause'
import SkipNextIcon from '@material-ui/icons/SkipNext'
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious'



import { withStyles, makeStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import LinearProgress from '@material-ui/core/LinearProgress'
import { TrafficRounded } from '@material-ui/icons';


const StyledLinearProgress = withStyles((theme) => ({
  colorPrimary: {
    backgroundColor: '#111',
  },
  barColorPrimary: {
    backgroundColor: '#bbbbbb',
  }
}))(LinearProgress);


const StyledSlider = withStyles((theme) => ({
    colorPrimary: {
      color: '#bbbbbb',
    },
    thumbColorPrimary: {
      backgroundColor: '#888',
    }
  }))(Slider);
  

const StyledSliderProgress = withStyles((theme) => ({
    colorPrimary: {
        color: '#bbb',
    },
    thumbColorPrimary: {
        backgroundColor: '#888888cc',
    }
}))(Slider);


var currentlyWaiting = false;

const Player = (props) => {
    const history = useHistory();

    // Used for when token runs out to get new one.
    const relogin = () => history.push('/')

    // token is spotify api token
    const [token, setToken] = useState(Cookies.get('spotifyAuthToken'))

    const [showErrorPopup, setShowErrorPopup] = useState(false)
    const [errorMessage, setErrorMessage] = useState(undefined)
    
    const [seekPos, setSeek] = useState(0)

    const [updateSeekFromApi, setUpdateSeekFromApi] = useState(true)
    const [loop_time_ms, set_loop_time_ms] = useState(10000)

    const [playingTrack, setPlayingTrack] = useState()
    const [playerVolume, setPlayerVolume] = useState(10)

    const [updatePlayerFlag, setUpdatePlayerFlag] = useState(true)
    const [currentlyPlayingFlag, setcurrentlyPlayingFlag] = useState(false)

    const [showStartButton, setShowStartButton] = useState(true)

    // Used to update seekPosition
    const [time, setTime] = useState(Date.now());

    useEffect(() => {
      const interval = setInterval(() => setTime(Date.now()), 1000);
      return () => {
        clearInterval(interval);
      };
    }, []);



    useEffect(() => {
      setToken(Cookies.get('spotifyAuthToken'))
      // if(updatePlayerFlag){
      //   setUpdatePlayerFlag(false)
      //   player_util()
      //   Cookies.set('temploopflag', '1')
      // }
    }, []);

    useEffect(() => {
      if(currentlyPlayingFlag){
        update_seek()
      }
    }, [time])

    const remove_token = () => {
      Cookies.remove('spotifyAuthToken')
      relogin()
    }

    const handle_error_popup_cancel = () => {
      setShowErrorPopup(false)
    }

    const http_error_handling = (e) => {
        
        // Change to true for debugging
        // if(true){
        //     console.log(e.response);
        //     console.log(e.response.data);
        //     console.log(e.response.status);
        //     console.log(e.response.headers);
        //     console.log(e.response.reason);
        // }
        disable_player()

        console.log("Loop time increased to 30 seconds")
        set_loop_time_ms(30000)

        // If reponse is invalid token or permission, then remove token and refresh for new login
        if(e.response.status === 401 || e.response.status === 403){
            remove_token()
        }
        else if (e.response.status === 429){ // Rate limit- too many requests
            console.log("ERROR 429; LOOPING SHOULD STOP NOW")
            Cookies.set('temploopflag', '') // Stops main loop
            set_loop_time_ms(30000)
            remove_token()
        }
        else if(e.response.status === 404 && e.response.data.error.reason === "NO_ACTIVE_DEVICE"){
      
        }
        if(e.response){
          setErrorMessage(e.response)
          setShowErrorPopup(true)
        }



    }

    const add_song_to_user_library = (song_id) => {
      axios.create({
        baseURL: "https://api.spotify.com/v1/me/tracks/?ids=" + song_id,
        headers: {
          "Authorization": "Bearer " + token
        },
      }).put().then(response => {
        console.log(response.data);
      })
      .catch(e => {
        console.log(e.response.data);
        console.log(e.response.status);
        console.log(e.response.headers);
        
        http_error_handling(e)
      });
    }


    // Volume percentt is an int 0-100
    const change_volume = (volume_percent) => {
        if(volume_percent){
            axios.create({
            baseURL: "https://api.spotify.com/v1/me/player/volume?volume_percent="+volume_percent,
            headers: {
                "Accept" : "application/json",
                "Content-type": "application/json",
                "Authorization": "Bearer " + token
            },
            }).put().then(response => {
              console.log(response.data);
            })
            .catch(e => {
                http_error_handling(e)
            });
        }
    }
    
    // Calls spottify api. If user has a player open it will start playing.
    const player_play = () => {
      var prevState = currentlyPlayingFlag
      setcurrentlyPlayingFlag(true)
      const config = {
        method: 'put',
        url: 'https://api.spotify.com/v1/me/player/play',
        headers: {
          "Accept" : "application/json",
          "Content-type": "application/json",
          "Authorization": "Bearer " + token
        }
      }
      axios(config).then(response => {
        console.log(response.data);
        
      })
      .catch(e => {
        setcurrentlyPlayingFlag(prevState)
        http_error_handling(e)
      });
    }
    const player_pause = () => {
      var prevState = currentlyPlayingFlag
      setcurrentlyPlayingFlag(false)
      const config = {
        method: 'put',
        url: 'https://api.spotify.com/v1/me/player/pause',
        headers: {
          "Accept" : "application/json",
          "Content-type": "application/json",
          "Authorization": "Bearer " + token
        }
      }
      axios(config).then(response => {
        console.log(response.data);
        
      })
      .catch(e => {
        setcurrentlyPlayingFlag(prevState)
          http_error_handling(e)
      });
    }

    const player_seek = (seek_pos) => {
      const config = {
        method: 'put',
        url: 'https://api.spotify.com/v1/me/player/seek?position_ms=' + seek_pos,
        headers: {
          "Accept" : "application/json",
          "Content-type": "application/json",
          "Authorization": "Bearer " + token
        }
      }
      axios(config).then(response => {
        console.log(response.data);
      })
      .catch(e => {
        http_error_handling(e)
      });
    }

    // Pass true for next and false for previous
    const player_next_previous = (true_for_next) => {
      const config = {
        method: 'post',
        url: 'https://api.spotify.com/v1/me/player/' + (true_for_next ? 'next' : 'previous'),
        headers: {
          "Accept" : "application/json",
          "Content-type": "application/json",
          "Authorization": "Bearer " + token
        }
      }
      axios(config).then(response => {
        console.log(response.data);
        get_user_player_info()
      })
      .catch(e => {
        http_error_handling(e)
      });
    }

    const get_user_player_info = () => {
      axios.create({
        baseURL: "https://api.spotify.com/v1/me/player",
        headers: {
          "Accept" : "application/json",
          "Content-type": "application/json",
          "Authorization": "Bearer " + token
        },
      }).get().then(response => {
        console.log(response.data)
        setPlayingTrack(response.data)
        try{
            setcurrentlyPlayingFlag(response.data.is_playing)
            if(updateSeekFromApi && response.data.is_playing){
                setPlayerVolume(response.data.device.volume_percent)
                setSeek(response.data.progress_ms)
                //update_seek_time_util(response.data.progress_ms, response.data.item.duration_ms)
                // if(response.data.progress_ms + 4000 < response.data.item.duration_ms){
                //   update_time(1000, response.data.progress_ms + 1000);
                //   update_time(2000, response.data.progress_ms + 2000);
                //   update_time(3000, response.data.progress_ms + 3000);
                //   update_time(4000, response.data.progress_ms + 4000);
                //   update_time(5000, response.data.progress_ms + 5000);
                //   update_time(6000, response.data.progress_ms + 6000);
                //   update_time(7000, response.data.progress_ms + 7000);
                //   update_time(8000, response.data.progress_ms + 8000);
                //   update_time(9000, response.data.progress_ms + 9000);
                // }
            }
        }catch(e){
            console.log("Error adding player volume percent in get_user_player_info function in player.js")
            console.log(e)
        }
        
      })
      .catch(e => {
        http_error_handling(e)
        console.log("Erasing selected track")
        setPlayingTrack()
      });

    }

    const enable_player = () => {
      if(!currentlyWaiting){
        get_user_player_info()
        Cookies.set('temploopflag', '1')
        player_util()
        setShowStartButton(false)
      }
    }

    const disable_player = () => {
      Cookies.set('temploopflag', '')
      setPlayingTrack(undefined)
    }


    const player_util = async () => {
      while(Cookies.get('temploopflag')){
        get_user_player_info()
        currentlyWaiting = true
        await timeout(loop_time_ms)
        currentlyWaiting = false
        setToken(Cookies.get('spotifyAuthToken')) // Used to revoke token to relogin when token expires
      }
      console.log("MAIN LOOP STOPPED")
      if(Cookies.get('temploopflag') !== '1'){
        setShowStartButton(true)
      }
    }

    const timeout = (ms) => { //pass a time in milliseconds to this function
      return new Promise(resolve => setTimeout(resolve, ms));
    }


    const update_seek = () => {
      var temp = seekPos + 1000
      if(playingTrack){
        if(seekPos + 1000 < playingTrack.item.duration_ms){
          setSeek(temp)
        }else{
          get_user_player_info()
        }
      }
    }


    // Next 20 lines were used to update the seek time without unneeded api calls.
    // const update_time = async (time, val) => {
    //   await timeout(time)
    //   setSeek(val)
    //   console.log("Updated: " + val)
    // }

    // const update_seek_time_util = (progress, song_dur) => {
    //   for(var i = 1; i < (loop_time_ms / 1000); i += 1){
    //     (progress + (1000 * i) < song_dur) ? update_time(1000 * i, progress + (1000 * i)):console.log()
    //   }
    // }

    const calc_progress = (val1, val2) => {
      return (val1/val2)
    }

    function millisToMinutesAndSeconds(millis) {
        var minutes = Math.floor(millis / 60000);
        var seconds = ((millis % 60000) / 1000).toFixed(0);
        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    }

    const consoleOutDebug = () => {
        console.log(updatePlayerFlag)
    }

    const handleSliderVolumeChange = (event, newValue) => {
        setPlayerVolume(newValue)
        setUpdateSeekFromApi(false)
        

        // setSeek(seekPos + 100)
    }

    const handleSliderVolumeChangeConfirmed = (event, newValue) => {
        setUpdateSeekFromApi(true)
        change_volume(newValue)
    }

    const handleSeekChange = (event, newValue) => {
        setSeek(newValue)
        setUpdateSeekFromApi(false)
    }

    const handleSeekChangeConfirmed = (event, newValue) => {
        setUpdateSeekFromApi(true)
        player_seek(newValue)
    }

    return (
        <>
          <ErrorToast show={showErrorPopup} handleCancel={handle_error_popup_cancel} message={errorMessage}/>
            <div id="style-3" class="row width-100 player-height ">

            {playingTrack ? (
                <>
                <div className="player-info">

                    <div className='player-image'>
                        <img className="thumbnail rounded mt-2 ml-3" align="center" src={playingTrack.item.album.images[0].url} alt={playingTrack.item.album.images[2].url}></img>
                    </div>
                    <div className='player-song-info'>
                        <div className='ml-5 songtitle' align="left">
                            <p className="mt-2 text-height">{playingTrack.item.name}</p>
                        </div>
                        <div className='ml-5 artist' align="left">
                            <p className="text-height">{playingTrack.item.artists[0].name}</p>
                        </div>
                    </div>
                    
                </div>


                <div className="main_player_top" align="center">
                    <div className="player-volume player-song-info player-info2">
                        
                        <div className="progress_div">
                            <div className="play_pause_div progress_div">
                                <IconButton onClick={() => player_next_previous(false)}><SkipPreviousIcon style={{ color: "#bbb" }}></SkipPreviousIcon></IconButton>
                                
                                    {currentlyPlayingFlag ? (
                                        <IconButton onClick={() => player_pause()}>
                                            <PauseIcon style={{ color: "#bbb" }}></PauseIcon>
                                        </IconButton>
                                    ) : (
                                        <IconButton onClick={() => player_play()}>
                                            <PlayArrow style={{ color: "#bbb" }}></PlayArrow>
                                        </IconButton>
                                    )}  
                                <IconButton onClick={() => player_next_previous(true)}><SkipNextIcon style={{ color: "#bbb" }}></SkipNextIcon></IconButton>
                            </div>
                            <div className="bottom_div progress_div">
                                <div className="song_time_div">
                                    <p className="mr-2 mt-2">{millisToMinutesAndSeconds(seekPos)}</p>
                                </div>
                                <StyledSliderProgress className="player-progress" value={seekPos} onChange={handleSeekChange} onChangeCommitted={handleSeekChangeConfirmed} min={0} max={playingTrack.item.duration_ms} aria-labelledby="continuous-slider"/>
                                <div className="song_time_div">
                                    <p className="ml-2 mt-2">{millisToMinutesAndSeconds(playingTrack.item.duration_ms)}</p>
                                </div>
                            </div>
                        </div>
                        

                    </div>
                </div>

                <div className="player-volume">
                    <Button variant="contained" color="primary" size='small' onClick={disable_player}>Stop Player</Button>
                    <Button variant="contained" color="primary" size='small' onClick={get_user_player_info}>Sync</Button>
                    <div className="player-volume mr-4">
                    
                        <StyledSlider className="mt-2 pt-5" value={playerVolume} onChange={handleSliderVolumeChange} onChangeCommitted={handleSliderVolumeChangeConfirmed} aria-labelledby="continuous-slider"/>
                    </div>
                </div>

                </>
                    ):(
                <>
                <div className="col" align="center">
                    <div className="App-footer">
                        <img src={logo} className="App-logo mr-2" alt="logo"/>
                        <p class="header-text-main">Moodify</p>
                        <div className="footer-start-btn"><Button  variant="contained" color="primary" disabled={!showStartButton} onClick={enable_player}>Start Player</Button></div>
                    </div>
                </div>
                </>
            )}


            </div>
            {/* <IconButton onClick={() => testing()}>
                <PauseIcon style={{ color: "#bbb" }} fontSize='large'></PauseIcon>
            </IconButton> */}
        </>
    )
}
export default Player

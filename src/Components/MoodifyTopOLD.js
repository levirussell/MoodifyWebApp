import Player from './MoodifyComponents/player'

import logo from '../moodifylogo.png'

import {useHistory} from 'react-router-dom'

import React from 'react'
import Cookies from 'js-cookie'
import 'react-spotify-auth/dist/index.css'
import { useEffect, useState } from 'react'
import axios from "axios"
import { Button } from 'react-bootstrap'
import IconButton from '@material-ui/core/IconButton'
import AddIcon from '@material-ui/icons/Add'
import PlayArrow from '@material-ui/icons/PlayArrow'


import { withStyles, makeStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import LinearProgress from '@material-ui/core/LinearProgress'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormHelperText from '@material-ui/core/FormHelperText'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import Slider from '@material-ui/core/Slider'
import { offset } from 'dom-helpers'


const StyledTableCell = withStyles((theme) => ({
  root:{
    background: 'transparent',
  },
  body: {
    fontSize: 20,
    fontFamily: 'Helvetica',
    color: '#222222',
  }
}))(TableCell);


const StyledTableRow = withStyles((theme) => ({
  root: {
    '&:nth-of-type(even)': {
      // backgroundColor: theme.palette.action.hover,
      background: 'linear-gradient(45deg, #497386aa 10%, #e389b8aa 90%)',
      padding:0
    },
    '&:nth-of-type(odd)': {
      // backgroundColor: theme.palette.action.hover, 6d96b
      background: 'linear-gradient(45deg, #6d96b1ff 40%, #497386aa 95%)',
    },
  },
}))(TableRow);

const StyledLinearProgress = withStyles((theme) => ({
  colorPrimary: {
    backgroundColor: '#246fa1',
  },
  barColorPrimary: {
    backgroundColor: '#bbbbbb',
  }
}))(LinearProgress);


const StyledSlider = withStyles((theme) => ({
  colorPrimary: {
    color: '#246fa1',
  },
  thumbColorPrimary: {
    backgroundColor: '#bbbbbb',
  }
}))(Slider);

const useStyles = makeStyles({
  table: {
    minWidth: 550,
  },
  celladd: {
    width: 'auto',
    maxWidth: 80,
  },
  maxitemheight: {
    minHeight: 500,
    maxHeight: 500
  }
});

const features_map = new Map();

const MoodifyTop = (props) => {
    const history = useHistory();
    const classes = useStyles();

    // Used for when token runs out to get new one.
    const relogin = () => history.push('/')


    // token is spotify api token
    const [token, setToken] = useState(Cookies.get('spotifyAuthToken'))
    // user is json file from spotify with user data
    const [user, setUser] = useState()
    // playlist will hold all the json data from spotify api call
    // To get array of songs use: playlist.tracks.items
    const [playlist, setPlaylist] = useState({})
    // Currently used for table output
    // tracks is currently set as playlist.tracks.items from above
    const [tracks, setTracks] = useState([])
    //const [userSongsOffset, setOffset] = useState(0)
    var total_liked_songs = 0;
    var userSongsOffset = 0;
    var currently_retreiving_songs = false;

    

    const [category_playlists, setCategoryPlaylists] = useState([])
    const [selectedGenreName, setSelectedGenreName] = useState('')



    // Selected song for footer output
    const [selectedTrack, setSelectedTrack] = useState()
    const [selectedTrackIndex, setSelectedTrackIndex] = useState()

    const [updateUserData, setUpdateUserData] = useState(true)

    // Used for fetching music
    const [category, setCategories] = useState({})

    // Used for mood data
    const [happy, setHappy] = useState(0)
    const [dance, setDance] = useState(0)
    const [energy, setEnergy] = useState(0)
    

    // INIT
    useEffect(() => {
      setToken(Cookies.get('spotifyAuthToken'))
      if(updateUserData){
        setUpdateUserData(false)
      }
      getUserData()
      get_categories()
      get_liked_songs_util()
    }, []);


    // RUNS WHEN CURRENTLY PLAYLIST DATA CHANGES
    useEffect(() => {
      try{

        if(playlist.items){
          get_features_util(playlist.items)
          setTracks([...tracks, ...playlist.items])
        }
        
      }catch(e){
        console.log("useEffect() Error! For: playlist | Error: " + e)
      }
    }, [playlist]);



    const remove_token = () => {
      Cookies.remove('spotifyAuthToken')
      relogin()
    }

    const http_error_handling = (e) => {
      // If reponse is invalid token, then remove token and refresh for new login
      if(e){
        if(e.response){
          if(e.response.status === 401 || e.response.status === 403){
            remove_token()
          }
        }
      }
    }

    const get_features_util = (e) => {
      var temp_id_list = ''
      for(var index = 0; index < e.length; index += 1)
        temp_id_list += e[index].track.id + ","
      temp_id_list = temp_id_list.slice(0, -1)
      get_features(temp_id_list)
    }

    const getUserData = () => {

      axios.create({
        baseURL: "https://api.spotify.com/v1/me",
        headers: {
          "Accept" : "application/json",
          "Content-type": "application/json",
          "Authorization": "Bearer " + token
        }
      }).get().then(response => {
        console.log("User Data:")
        console.log(response.data)
        setUser(response.data);
      })
      .catch(e => {
        console.log(e.response.data);
        console.log(e.response.status);
        console.log(e.response.headers);

        http_error_handling(e)
      });
    }


    const get_user_liked_songs = (offset) => {
      currently_retreiving_songs = true
      axios.create({
        baseURL: "https://api.spotify.com/v1/me/tracks?offset=" + offset + "&limit=50",
        headers: {
          "Accept" : "application/json",
          "Content-type": "application/json",
          "Authorization": "Bearer " + token
        }
      }).get().then(response => {
        //console.log("User's liked songs:")
        //console.log(response.data);
        setPlaylist(response.data);
        total_liked_songs = response.data.total;
        currently_retreiving_songs = false
        return true;
      })
      .catch(e => {
        if (e.response){
          console.log(e.response.data);
          console.log(e.response.status);
          console.log(e.response.headers);
        }else{
          console.log("Error in get_user_like_songs")
        }
        http_error_handling(e)
        currently_retreiving_songs = false
        return false;
      });
    }


    const getPlaylist = (id) => {
      axios.create({
        baseURL: "https://api.spotify.com/v1/playlists/" + id,
        headers: {
          "Accept" : "application/json",
          "Content-type": "application/json",
          "Authorization": "Bearer " + token
        }
      }).get().then(response => {
        // console.log(response.data);
        setPlaylist(response.data.tracks);
      })
      .catch(e => {
        console.log(e.response.data);
        console.log(e.response.status);
        console.log(e.response.headers);


        http_error_handling(e)
      });
    }

    // Testing error handling of opening new tab to play if put request fails.
    const play_song = (uri) => {
      const config = {
        method: 'put',
        url: 'https://api.spotify.com/v1/me/player/play',
        headers: {
          "Accept" : "application/json",
          "Content-type": "application/json",
          "Authorization": "Bearer " + token
        },
        data: {
          "uris": [uri]
        }
      }

      axios(config).then(response => {
        console.log(response.data);
      })
      .catch(e => {
        console.log(e.response.data);
        console.log(e.response.status);
        console.log(e.response.headers);
        console.log(e.response.reason);
        if(e.response.status === 404 && e.response.data.error.reason === "NO_ACTIVE_DEVICE"){
          try{
            window.open("https://open.spotify.com/track/" + uri, "_blank")
          }catch(e){
            console.log("Error opening link to song:\n" + e)
          }
        }

        http_error_handling(e)
      });
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

    const get_categories = () => {
      const config = {
        method: 'get',
        url: 'https://api.spotify.com/v1/browse/categories',
        headers: {
          "Accept" : "application/json",
          "Content-type": "application/json",
          "Authorization": "Bearer " + token
        }
      }
      axios(config).then(response => {
        console.log(response.data)
        setCategories(response.data.categories.items)
      })
      .catch(e => {
        http_error_handling(e)
      });
    }

    // songIDList must be a comma separated string of the spotify song id's to get features of.
    const get_features = (songIDList) => {
      const config = {
        method: 'get',
        url: 'https://api.spotify.com/v1/audio-features/?ids=' + songIDList,
        headers: {
          "Accept" : "application/json",
          "Content-type": "application/json",
          "Authorization": "Bearer " + token
        }
      }
      axios(config).then(response => {
        // console.log("FEATURES:")
        // console.log(response.data)
        if(response.data.audio_features){
          map_features(response.data.audio_features)
        }
      })
      .catch(e => {
        http_error_handling(e)
      });
    }

    const map_features = (song_list) => {
      for(var index = 0; index < song_list.length; index += 1){
        //console.log(song_list[index])
        var id = song_list[index].id
        var danceability_temp = song_list[index].danceability
        var energy_temp = song_list[index].energy
        var valence_temp =  song_list[index].valence
        //console.log(id + " | " + danceability_temp + " | " + energy_temp + " | " + valence_temp)
        features_map.set(id, [danceability_temp, energy_temp, valence_temp])
      }
      console.log(features_map)
    }

    const get_playlists_from_category = (link) => {
      const config = {
        method: 'get',
        url: link + '/playlists',
        headers: {
          "Accept" : "application/json",
          "Content-type": "application/json",
          "Authorization": "Bearer " + token
        }
      }
      axios(config).then(response => {
        console.log("GOT CATS:")
        console.log(response.data)
        setCategoryPlaylists(response.data.playlists.items)
        //Temp code
        getPlaylist(response.data.playlists.items[0].id)
        // Delete 
      })
      .catch(e => {
        http_error_handling(e)
      });
    }

    const create_playlist = (songIDList) => {
      const config = {
        method: 'post',
        url: 'https://api.spotify.com/v1/users/' + user.id + '/playlists',
        headers: {
          "Accept" : "application/json",
          "Content-type": "application/json",
          "Authorization": "Bearer " + token
        },
        data: {
          "name": "Moodify Test Playlist",
          "description": "New playlist description",
          "public": false
        }
      }

      axios(config).then(response => {
        console.log(response.data);
        add_songs_to_playlist(response.data.id, songIDList)
      })
      .catch(e => {
        console.log("Failed...")
        http_error_handling(e)
        console.log(e)
      });
    }

    const add_songs_to_playlist = (playlistID, songIDList) => {
      const config = {
        method: 'post',
        url: 'https://api.spotify.com/v1/playlists/' + playlistID + '/tracks',
        headers: {
          "Accept" : "application/json",
          "Content-type": "application/json",
          "Authorization": "Bearer " + token
        },
        data: {
          "uris": songIDList
        }
      }

      axios(config).then(response => {
        console.log(response.data);
      })
      .catch(e => {
        http_error_handling(e)
      });
    }


    const test_create_function = () => {
      var list_to_add = [] 
      var temp_d, temp_e, temp_v, tol
      console.log(features_map)
      console.log(dance + " " + energy + " " + happy)
      for (const [key, value] of features_map) {
        temp_d = value[0] * 100
        temp_e = value[1] * 100
        temp_v = value[2] * 100
        tol = 15
        if (Math.abs(temp_d - dance) <= tol && Math.abs(temp_e - energy) <= tol && Math.abs(temp_v - happy) <= tol) {
          list_to_add.push("spotify:track:" + key)
        }
      }
      console.log(list_to_add)
      create_playlist(list_to_add)
    }

    const handle_category_change = (e) => {
      if(e.target.value !== ''){
        
        get_playlists_from_category(category[e.target.value].href)
        setSelectedGenreName(e.target.value)
      }else{
        setSelectedGenreName('Select Genre')
      }
    }


    const get_liked_songs_util = async () => {
      console.log("STARTING GETTING LIKED SONGS")
      console.log("Total liked songs: " + total_liked_songs)
      do{
        console.log("get_liked_songs_util | do-while start | Fetching more liked songs")
        await get_user_liked_songs(userSongsOffset)
        userSongsOffset += 50
        await delay(50)
        console.log("OFFSET: " + userSongsOffset + "\tTOTAL: " + total_liked_songs)
        while(currently_retreiving_songs){
          await delay(50)
        }
        
      } while(total_liked_songs - userSongsOffset >= 0);

      
      console.log("Finished getting all user liked songs")
      console.log(features_map)
    }

    const delay = (ms) => { //pass a time in milliseconds to this function
      return new Promise(resolve => setTimeout(resolve, ms));
    }


    const handleSliderHAPPYChange = (event, newValue) => {
      setHappy(newValue)
    }
    const handleSliderDANCEChange = (event, newValue) => {
      setDance(newValue)
    }
    const handleSliderENERGYChange = (event, newValue) => {
      setEnergy(newValue)
    }

    const test_function = () => {
      console.log(user)
    }

    return (
        <div className='container max-content'>
          
          <header className="App-secondary-header">
            {selectedTrack ? (
              <>
                <div className="row col">
                  <IconButton onClick={() => play_song(selectedTrack.track.uri)}><PlayArrow fontSize='large'></PlayArrow></IconButton>
                  <img className="thumbnail rounded mr-3 ml-2" src={selectedTrack.track.album.images[0].url} alt={selectedTrack.track.album.images[2].url}></img>
                  <div>
                    <div className='maintabletrackname'>
                      {selectedTrack.track.name}
                    </div>
                    <div className='maintabletrackname' align="left">
                      {selectedTrack.track.artists[0].name}
                    </div>
                  </div>
                </div>
              </>
            ):(
              <>
                <p class="font-weight-bold mt-3 moodifytext">No song selected</p>
              </>
            )}
          </header>
            {token ? (
                <>
                <div className='mainarea'>
                    {user ? (<h5 className="App">Logged in as {user.display_name}</h5>):(<h5 className="App">Loading...</h5>)}
                    {/* <Button className="mr-2" onClick={() => console.log("test")}>Test Button</Button>
                    <Button className="mr-2" onClick={() => console.log("test")}>Player Test Button</Button> */}

                      <FormControl className="ml-5">
                        <Select
                          value={selectedGenreName}
                          onChange={handle_category_change}
                          className={classes.selectEmpty}
                          inputProps={{ 'aria-label': 'Select Genre' }}>

                          <MenuItem value="" disabled>Placeholder</MenuItem>
                          {category && !!category.length && category.map((cat, index) => {
                            return <MenuItem value={index} key={index}>{cat.name}</MenuItem>})
                          }

                        </Select>
                        <FormHelperText>Select Genre</FormHelperText>
                      </FormControl>

                      {/* CURRENT TEST BUTTON*/}
                      <IconButton onClick={() => test_function()}>
                        TEST BUTTON
                      </IconButton>


                      <IconButton onClick={() => test_create_function()}>
                        Create Playlist
                      </IconButton>

                      
                      <StyledSlider className="mt-2" 
                                    value={happy}
                                    onChange={handleSliderHAPPYChange} 
                                    valueLabelDisplay="auto"
                                    aria-labelledby="continuous-slider"/>

                      <StyledSlider className="mt-2" 
                                    value={dance}
                                    onChange={handleSliderDANCEChange} 
                                    valueLabelDisplay="auto"
                                    aria-labelledby="continuous-slider"/>

                      <StyledSlider className="mt-2" 
                                    value={energy}
                                    onChange={handleSliderENERGYChange} 
                                    valueLabelDisplay="auto"
                                    aria-labelledby="continuous-slider"/>



                      <div id="style-2" className="ml-5 mr-5 mt-3 main-table">


                      

                      <TableContainer >
                        <Table className={classes.table} size="small" aria-label="a dense table">


                          <TableBody>
                            {tracks && tracks.map((track, index) => {
                              // console.log("Logging main table input:");
                              // console.log(index);
                              return <>
                                {index === selectedTrackIndex ? (
                                  <TableRow className="table-row hover-dim2solid" key={track.track.id}>
                                      <StyledTableCell className={classes.celladd} component="th" scope="row"><IconButton onClick={() => add_song_to_user_library(track.track.id)}><AddIcon></AddIcon></IconButton></StyledTableCell>
                                      <StyledTableCell onClick={() => {setSelectedTrack(track); setSelectedTrackIndex(index);}} align="left"><img className="player-image rounded" src={track.track.album.images[0].url} alt={track.track.album.images[2].url}></img></StyledTableCell>
                                      <StyledTableCell onClick={() => {setSelectedTrack(track); setSelectedTrackIndex(index);}} align="left"><div className='maintabletext'><div className='maintabletrackname'><a>{track.track.name}</a></div><div className='maintabletrackname'>{track.track.artists[0].name}</div></div></StyledTableCell>
                                      <StyledTableCell onClick={() => {setSelectedTrack(track); setSelectedTrackIndex(index);}} align="left"><div className='maintabletext'>{track.track.album.name}</div></StyledTableCell>
                                  </TableRow>
                                    ):(
                                  <TableRow className="table-row hover-dim2" key={track.track.id}>
                                      <StyledTableCell className={classes.celladd} component="th" scope="row"><IconButton onClick={() => add_song_to_user_library(track.track.id)}><AddIcon></AddIcon></IconButton></StyledTableCell>
                                      <StyledTableCell onClick={() => {setSelectedTrack(track); setSelectedTrackIndex(index);}} align="left"><img className="player-image rounded" src={track.track.album.images[0].url} alt={track.track.album.images[2].url}></img></StyledTableCell>
                                      <StyledTableCell onClick={() => {setSelectedTrack(track); setSelectedTrackIndex(index);}} align="left"><div className='maintabletext'><div className='maintabletrackname'><a>{track.track.name}</a></div><div className='maintabletrackname'>{track.track.artists[0].name}</div></div></StyledTableCell>
                                      <StyledTableCell onClick={() => {setSelectedTrack(track); setSelectedTrackIndex(index);}} align="left"><div className='maintabletext'>{track.track.album.name}</div></StyledTableCell>
                                  </TableRow>)
                                }
                              </>
                              })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </div>
                </div>
                    
                </>
            ) : (
                <><p>Error getting authentication token. Please refresh page.</p></>
            )}
        

        <footer className="App-footer">
          {/* <Player/> */}
        </footer>
      </div>
    )
}
export default MoodifyTop

// {playingTrack ? (
//   <>
//     <img className="thumbnail rounded mr-3" src={playingTrack.item.album.images[0].url} alt={playingTrack.item.album.images[2].url}></img>
//     <div>
//       <div className='maintabletrackname mt-2'>
//         {playingTrack.item.name}
//       </div>
//       <div className='maintabletrackname' align="left">
//         {playingTrack.item.artists[0].name}
//       </div>
//     </div>
//     {/* <div className='maintabletrackname ml-4'>
//       {playingTrack.progress_ms}
//     </div> */}
//     {/* <div className='maintabletrackname ml-4'>
//       {calc_progress(playingTrack.progress_ms, playingTrack.item.duration_ms)}
//       {(playingTrack.progress_ms) / (playingTrack.item.duration_ms)}
//     </div> */}
//     <div className="ml-3">
//       <StyledLinearProgress className="player-progress" variant="determinate" valueBuffer={100} value={100 * calc_progress(playingTrack.progress_ms, playingTrack.item.duration_ms)} />
//     </div>
//   </>
// ):(
//   <>
//     <img src={logo} className="App-logo mr-2" alt="logo"/>
//     <p class="font-weight-bold mt-3 moodifytext">Moodify</p>
//   </>
// )}
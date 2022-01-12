import Player from './MoodifyComponents/player'
import ErrorToast from './MoodifyComponents/ErrorToast'

import logo from '../moodifylogo.png'

import '../css/main.css'

import {useHistory} from 'react-router-dom'

import React from 'react'
import Cookies from 'js-cookie'
import 'react-spotify-auth/dist/index.css'
import { useEffect, useState } from 'react'
import axios from "axios"
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
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
import Chip from '@material-ui/core/Chip'
import Select from '@material-ui/core/Select'
import Slider from '@material-ui/core/Slider'
import { offset } from 'dom-helpers'
import ValueSelector from './MoodifyComponents/ValueSelector'
import CreatePlaylistModal from './MoodifyComponents/Create_Playlist_Modal'
import { CollectionsBookmarkOutlined } from '@material-ui/icons'


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
    maxWidth: "fit-content",
  },
  maxitemheight: {
    minHeight: 1000,
    maxHeight: 1000
  }
});

const features_map = new Map();
const song_map = new Map();
const console_output = true;
var total_liked_songs = 0;
var userSongsOffset = 0;
var currently_retreiving_songs = false;

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
    const [filteredTracks, setFilteredTracks] = useState([])
    //const [userSongsOffset, setOffset] = useState(0)

    const [filtered_songs_flag, setFilteredSongsFlag] = useState(false)

    

    const [category_playlists, setCategoryPlaylists] = useState([])
    const [selectedGenreName, setSelectedGenreName] = useState('')



    // Selected song for footer output
    const [selectedTrack, setSelectedTrack] = useState()
    const [selectedTrackIndex, setSelectedTrackIndex] = useState()

    const [updateUserData, setUpdateUserData] = useState(true)
    const [user_songs_flag, setUserSongsFlag] = useState(false)
    const [showPlaylistModal, setPlaylistModal] = useState(false)
    const [loadingprogress, setLoadingProgress] = useState(0)
    const [showErrorPopup, setShowErrorPopup] = useState(false)
    const [errorMessage, setErrorMessage] = useState(undefined)
    // Used for fetching music
    const [category, setCategories] = useState({})

    // Used for mood data

    const [happy, setHappy] = useState([0, 100])

    const [dance, setDance] = useState([0, 100])

    const [energy, setEnergy] = useState([0, 100])

    // Used to detect prop data updates
    // const [time, setTime] = useState(Date.now());

    // useEffect(() => {
    //   if(props.export == "Yes"){
    //     props.handledExport()
    //     clog(happy + " " + dance + " " + energy)
    //     show_create_playlist_modal()
    //   }
    // }, [time])

    // useEffect(() => {
    //   // For time update to detect prop changes
    //   const interval = setInterval(() => setTime(Date.now()), 1000);
    //   return () => {
    //     clearInterval(interval);
    //   };
    // }, []);

    useEffect(() => {
      if(props.export == "Yes"){
        props.handledExport()
        clog(happy + " " + dance + " " + energy)
        show_create_playlist_modal()
      }
    }, [props.export])


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



    useEffect(() => {
      try{

        if(playlist.items){
          get_features_util(playlist.items)
          setTracks([...tracks, ...playlist.items])
          song_map_update()
        }
        
      }catch(e){
        clog("useEffect() Error! For: playlist | Error: " + e)
      }
    }, [playlist]);

    useEffect(() => {
      // Prevents initial render from setting filtered_songs_tag
      if(filteredTracks.length > 0){
        setFilteredSongsFlag(true)
      }
    }, [filteredTracks])

    useEffect(() => {

        filter_songs()

    }, [happy, dance, energy])

    const remove_token = () => {
      Cookies.remove('spotifyAuthToken')
      relogin()
    }

    const http_error_handling = (e) => {
      // If reponse is invalid token, then remove token and refresh for new login
      if(e){
        if(e.response){
          setErrorMessage(e.response)
          if(e.response.status === 401 || e.response.status === 403){
            remove_token()
          }
          if(e.response.status === 502 || e.response.status === 500){
            return
          }
          console.log(e.response)
          
          setShowErrorPopup(true)
        }
      }
    }

    const song_map_update = () => {
      for (const song of tracks){
        song_map.set(song.track.id, song)
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
        clog("User Data:")
        clog(response.data)
        setUser(response.data);
      })
      .catch(e => {
        clog(e);
        clog(e.response);
        console.log("Here")
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
        //clog("User's liked songs:")
        clog(response.data);
        setPlaylist(response.data);
        total_liked_songs = response.data.total;
        currently_retreiving_songs = false
        return true;
      })
      .catch(e => {
        if (e.response){
          clog(e.response.data);
          clog(e.response.status);
          clog(e.response.headers);
        }else{
          clog("Error in get_user_like_songs")
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
        // clog(response.data);
        setPlaylist(response.data.tracks);
      })
      .catch(e => {
        clog(e.response.data);
        clog(e.response.status);
        clog(e.response.headers);


        http_error_handling(e)
      });
    }

    // Testing error handling of opening new tab to play if put request fails.
    const play_song = (uri, song_link) => {
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
        clog(response.data);

      })
      .catch(e => {
        clog(e.response.data);
        clog(e.response.status);
        clog(e.response.headers);
        clog(e.response.reason);
        if(e.response.status === 404 && e.response.data.error.reason === "NO_ACTIVE_DEVICE"){
          try{
            window.open(song_link, "_blank")
          }catch(e){
            clog("Error opening link to song:\n" + e)
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
        clog(response.data);
      })
      .catch(e => {
        clog(e.response.data);
        clog(e.response.status);
        clog(e.response.headers);
        
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
        clog(response.data)
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
        // clog("FEATURES:")
        // clog(response.data)
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
        //clog(song_list[index])
        var id = song_list[index].id
        var danceability_temp = song_list[index].danceability
        var energy_temp = song_list[index].energy
        var valence_temp =  song_list[index].valence
        //clog(id + " | " + danceability_temp + " | " + energy_temp + " | " + valence_temp)
        features_map.set(id, [danceability_temp, energy_temp, valence_temp])
      }
      clog("Audio Features retrieved...")
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
        clog("GOT CATS:")
        clog(response.data)
        setCategoryPlaylists(response.data.playlists.items)
        //Temp code
        getPlaylist(response.data.playlists.items[0].id)
        // Delete 
      })
      .catch(e => {
        http_error_handling(e)
      });
    }

    const create_playlist = (songIDList, name, description) => {
      const config = {
        method: 'post',
        url: 'https://api.spotify.com/v1/users/' + user.id + '/playlists',
        headers: {
          "Accept" : "application/json",
          "Content-type": "application/json",
          "Authorization": "Bearer " + token
        },
        data: {
          "name": name,
          "description": description,
          "public": false
        }
      }

      axios(config).then(response => {
        clog(response.data);
        // TODO: Handle playlists > 50 songs
        if(songIDList.length > 50){
          var list_of_lists = []
          var tempList = []
          var counter = 50
          var total = 0
          for(const id of songIDList){
            tempList.push(id)
            counter = counter - 1
            if(counter <= 0){
              counter = 50
              list_of_lists.push(tempList)
              tempList = []
            }
          }
          list_of_lists.push(tempList) // Get end songs

          add_songs_to_playlist_batch(response.data.id, list_of_lists)
          
        }else{
          add_songs_to_playlist(response.data.id, songIDList)
        }
        

        try{
          window.open(response.data.external_urls.spotify, "_blank")
        }catch(e){
          clog("Error opening link created playlist. ", e)
        }


      })
      .catch(e => {
        clog("Failed...")
        http_error_handling(e)
        clog(e)
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
        clog(response.data);
      })
      .catch(e => {
        http_error_handling(e)
      });
    }

    const add_songs_to_playlist_batch = async (playlistID, listofsonglist) => {
      for(const songIDList of listofsonglist){
        console.log(songIDList)
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
          clog(response.data);
        })
        .catch(e => {
          // Bad gateway. Wait 50ms and attempt request 1 more time, if fails again move on.
          if(e.response.status === 500 || e.response.status === 502) {
            
            // Try again
            axios(config).then(response => {
              clog(response.data);
            })
            .catch(e => {
              // http_error_handling(e)
            });
          }else{
            http_error_handling(e)
            return
          }

        });
        await delay(50)
      }
    }

    const test_request_fail = () => {
      console.log(props.testProp)
      // const config = {
      //   method: 'get',
      //   url: 'https://api.spotify.com/v1/browse/categorie',
      //   headers: {
      //     "Accept" : "application/json",
      //     "Content-type": "application/json",
      //     "Authorization": "Bearer " + token
      //   }
      // }
      // axios(config).then(response => {
      //   clog(response.data)
      //   setCategories(response.data.categories.items)
      // })
      // .catch(e => {
      //   console.log("Error Test Message Start:")
      //   console.log(e)
      //   console.log(e.response)
      //   setErrorMessage(e.response)
      //   setShowErrorPopup(true)
      // });
    }


    const show_create_playlist_modal = () => {

      if(filteredTracks.length > 0){
        setPlaylistModal(true)
      }

    }

    const handle_error_popup_cancel = () => {
      setShowErrorPopup(false)
    }

    const handle_playlist_create = (playlistName, playlistDescription) => {
      var list_to_add = []
      for(const song of filteredTracks){
        list_to_add.push(song.track.uri)
      }
      create_playlist(list_to_add, playlistName, playlistDescription)
      // console.log(filteredTracks)
      // console.log(list_to_add)
      setPlaylistModal(false)
    }

    const handle_playlist_cancel = () => {
      setPlaylistModal(false)
    }

    const filter_songs = () => {
      var list_to_add = []
      var temp_d, temp_e, temp_v
      clog(happy + " " + dance + " " + energy)
      for (const [key, value] of features_map) {
        temp_d = value[0] * 100
        temp_e = value[1] * 100
        temp_v = value[2] * 100
        
        if ((temp_d > dance[0] && temp_d < dance[1]) && 
            (temp_e > energy[0] && temp_e < energy[1]) &&
            (temp_v > happy[0] && temp_v < happy[1])) {

          
          // TODO: Track all songs who's audio features are undefined
          if (song_map.get(key) !== undefined){
            list_to_add.push(song_map.get(key))
          }


        }
      }
      setFilteredTracks(list_to_add)
      clog(list_to_add)

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
      clog("STARTING GETTING LIKED SONGS")
      clog("Total liked songs: " + total_liked_songs)
      if (user_songs_flag === false){
        do{
          // clog("get_liked_songs_util | do-while start | Fetching more liked songs")
          setLoadingProgress((userSongsOffset / total_liked_songs) * 100)
          await get_user_liked_songs(userSongsOffset)
          userSongsOffset += 50
          await delay(50)
          clog("OFFSET: " + userSongsOffset + "\tTOTAL: " + total_liked_songs)
          while(currently_retreiving_songs){
            await delay(50)
          }
          
        } while(total_liked_songs - userSongsOffset >= 0);
      }else{
        clog("ERROR! Tried to get liked songs, but offset not 0. Have songs already been retrieved?")
      }

      setUserSongsFlag(true)
      clog("Finished getting all user liked songs")
      clog(features_map)
    }

    const delay = (ms) => { //pass a time in milliseconds to this function
      return new Promise(resolve => setTimeout(resolve, ms));
    }


    const test_function = () => {
      clog(user)
    }

    const clog = (input) => {
      if(console_output){
        console.log(input)
      }
    }

    return (
      <>
        <CreatePlaylistModal  showModal={showPlaylistModal}
                              handleSubmit={handle_playlist_create}
                              handleCancel={handle_playlist_cancel} 
                              description={`Happiness: ${happy[0]} - ${happy[1]}\nDanceability: ${dance[0]} - ${dance[1]}\nEnergy: ${energy[0]} - ${energy[1]}`}/>

        <ErrorToast show={showErrorPopup} 
                    handleCancel={handle_error_popup_cancel} 
                    message={errorMessage}/>

        <div className='main-container'>
          
            {token ? (
                <>
                <div className='mainarea'>

                      

                      <div className='userinput-header'>
                        <ValueSelector title="Happiness" value={happy} onValueChanged={setHappy} updateList={filter_songs}/>
                        <ValueSelector title="Danceability" value={dance} onValueChanged={setDance} updateList={filter_songs}/>
                        <ValueSelector title="Energy" value={energy} onValueChanged={setEnergy} updateList={filter_songs}/>
                        {/* <Button onClick={() => filter_songs()}>
                        Filter
                        </Button> */}
                        {/* <div className="export-playlist-btn">
                          <Button variant="contained" color="inherit" onClick={() => show_create_playlist_modal()}>Export Playlist</Button>
                          <Button variant="contained" color="inherit" onClick={test_request_fail}>Test {props.testProp}</Button>
                        </div> */}
                        
                        {/* {user_songs_flag ? (<a>user_songs_flag: True</a>):(<a>user_songs_flag: False</a>)}
                        {filtered_songs_flag ? (<a>filtered_songs_flag: True</a>):(<a>filtered_songs_flag: False</a>)} */}
                      </div>



                      {/* <IconButton onClick={() => test_function()}>
                        TEST BUTTON
                      </IconButton>


                      <IconButton onClick={() => show_create_playlist_modal()}>
                        Create Playlist
                      </IconButton> */}


                      <div id="style-2" className="main-table">
                        <TableContainer>
                          <Table className={classes.table} size="small" aria-label="a dense table">


                            {filtered_songs_flag ? (
                              <TableBody>
                                {filteredTracks.length > 0 && filteredTracks && filteredTracks.map((track, index) => {
                                  // clog("Logging main table input:");
                                  // clog(index);
                                  return <>
                                    <TableRow className="table-row hover-dim2" key={track.track.id}>

                                      <StyledTableCell className="maintableplayicon" >
                                        <IconButton onClick={() => play_song(track.track.uri, track.track.external_urls.spotify)}><PlayArrow></PlayArrow></IconButton>
                                      </StyledTableCell>

                                      <StyledTableCell onClick={() => {setSelectedTrack(track); setSelectedTrackIndex(index);}} align="left">
                                        <img className="player-image rounded" src={track.track.album.images[0].url} alt={track.track.album.images[2].url}/>
                                      </StyledTableCell>

                                      <StyledTableCell onClick={() => {setSelectedTrack(track); setSelectedTrackIndex(index);}} align="left">
                                        <div className='maintabletext'>
                                          <div className='maintabletrackname'>
                                            <a>{track.track.name}</a>
                                          </div>
                                          <div className='maintableartistname'>
                                            <a href={track.track.artists[0].external_urls.spotify}>{track.track.artists[0].name}</a>
                                          </div>
                                        </div>
                                      </StyledTableCell>

                                      <StyledTableCell onClick={() => {setSelectedTrack(track); setSelectedTrackIndex(index);}} align="left">
                                        <div className='maintabletext'>
                                          <a href={track.track.album.external_urls.spotify}>{track.track.album.name}</a>
                                        </div>
                                      </StyledTableCell>

                                    </TableRow>
                                  </>

                                })}
                              </TableBody>
                            ):(
                              <TableBody>
                                {user_songs_flag ? (
                                  <>

                                  {tracks && tracks.map((track, index) => {
                                    // clog("Logging main table input:");
                                    // clog(index);
                                    return <>
                                         
                                        <TableRow className="table-row hover-dim2" key={track.track.id}>

                                            <StyledTableCell className="maintableplayicon" >
                                              <IconButton onClick={() => play_song(track.track.uri, track.track.external_urls.spotify)}><PlayArrow></PlayArrow></IconButton>
                                            </StyledTableCell>

                                            <StyledTableCell onClick={() => {setSelectedTrack(track); setSelectedTrackIndex(index);}} align="left">
                                              <img className="player-image rounded" src={track.track.album.images[0].url} alt={track.track.album.images[2].url}/>
                                            </StyledTableCell>

                                            <StyledTableCell onClick={() => {setSelectedTrack(track); setSelectedTrackIndex(index);}} align="left">
                                              <div className='maintabletext'>
                                                <div className='maintabletrackname'>
                                                  <a>{track.track.name} - Liked</a>
                                                </div>
                                                <div className='maintableartistname'>
                                                  <a href={track.track.artists[0].external_urls.spotify}>{track.track.artists[0].name}</a>
                                                </div>
                                              </div>
                                            </StyledTableCell>

                                            <StyledTableCell onClick={() => {setSelectedTrack(track); setSelectedTrackIndex(index);}} align="left">
                                              <div className='maintabletext'>
                                                <a href={track.track.album.external_urls.spotify}>{track.track.album.name}</a>
                                              </div>
                                            </StyledTableCell>

                                        </TableRow>
   
                                    </>

                                  })}

                                  </>):(
                                  <>

                                    <TableRow className="table-row hover-dim2solid">
                                      <StyledTableCell>
                                        <LinearProgress variant="determinate" value={loadingprogress} />
                                      </StyledTableCell>
                                    </TableRow>

                                  </>)
                                  }
                              </TableBody>
                            )}


                          </Table>
                        </TableContainer>
                      </div>
                </div>
                    
                </>
            ) : (
                <><p>Error getting authentication token. Please refresh page.</p></>
            )}
        

        <footer className="App-footer">
          <Player/>
        </footer>
      </div>
      </>
    )
}

export default MoodifyTop


import React from 'react'


import { useEffect, useState } from 'react'
import { TextField, Button } from '@material-ui/core'
// import IconButton from '@material-ui/core/IconButton'


// import { withStyles, makeStyles } from '@material-ui/core/styles'
// import Chip from '@material-ui/core/Chip'
// import Slider from '@material-ui/core/Slider'

import '../../css/CreatePlaylistModal.css'




const CreatePlaylistModal = (props) => {
    // Used for mood data
    const [title, setTitle] = useState("Moodify Playlist")
    const [desc, setDesc] = useState()

    

    // INIT
    useEffect(() => {
        setDesc(props.description)
    }, []);

    useEffect(() => {
        setDesc(props.description)
    }, [props.description]);


    const handleCancel = () => {
        props.handleCancel()
    }

    const handleSubmit = () => {
        props.handleSubmit(title, desc)
    }

    return (
        <>
        {props.showModal ? (
            <div className='modal_main'>
                <div className='modal-child1-main'>
                    <div className='modal-header1'>
                        Create Playlist
                    </div>
                    <div className='modal-body1'>
                        <TextField
                            required
                            id="outlined-multiline-static"
                            label="Playlist Name"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            />
                        <TextField
                            id="outlined-multiline-static"
                            label="Playlist Description"
                            multiline
                            rows={4}
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            />
                    </div>
                    <div className='modal-footer1'>
                        <Button onClick={handleCancel}>Cancel</Button>
                        <Button onClick={handleSubmit}>Submit</Button>
                    </div>
                </div>
                TESTESTEST TRUE
            </div>
        ):(
            <></>
            // <div className='modal_main'>
            //     TESTESTEST FALSE
            // </div>
        )}
      </>
    )
}
export default CreatePlaylistModal


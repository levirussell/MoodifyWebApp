
import React from 'react'


import { useEffect, useState } from 'react'
import { TextField, Button } from '@material-ui/core'
// import IconButton from '@material-ui/core/IconButton'


// import { withStyles, makeStyles } from '@material-ui/core/styles'
// import Chip from '@material-ui/core/Chip'
// import Slider from '@material-ui/core/Slider'

import '../../css/ErrorToast.css'




const ErrorToast = (props) => {
    // Used for mood data
    const [title, setTitle] = useState("Moodify Playlist")


    

    // INIT
    useEffect(() => {

    }, []);




    const handleClose = () => {
        props.handleCancel()
    }

    return (
        <>
        {props.show ? (
            <div className='error_main'>
                <div className='error-child1-main'>
                    <div className='error-header1'>
                        Error {props.message.status}
                    </div>
                    <div className='error-body1'>
                        {props.message.status == "404" ? (
                            <a>Request endpoint not found.</a>
                        ) : (
                            <>
                            <a>{props.message.data}</a>
                            </>
                        )}
                        
                    </div>
                    <div className='error-footer1'>
                        <Button onClick={handleClose}>Close</Button>
                    </div>
                </div>
            </div>
        ):(
            <></>
            // <div className='error_main'>
            //     TESTESTEST FALSE
            // </div>
        )}
      </>
    )
}
export default ErrorToast


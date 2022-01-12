



import React from 'react'


import { useEffect, useState } from 'react'

import IconButton from '@material-ui/core/IconButton'


import { withStyles, makeStyles } from '@material-ui/core/styles'
import Chip from '@material-ui/core/Chip'
import Slider from '@material-ui/core/Slider'

import '../../css/ValueSelector.css'


const StyledSlider = withStyles((theme) => ({
  colorPrimary: {
    color: '#246fa1',
  },
  thumbColorPrimary: {
    backgroundColor: '#bbbbbb',
  }
}))(Slider);

const ValueSelector = (props) => {
    // Used for mood data
    const [tempvalue, setTempValue] = useState([0, 100])

    

    // INIT
    useEffect(() => {
      setTempValue(props.value)
    }, []);

    const minDistance = 10;

    const handleSliderChange = (event, newValue) => {
      // https://mui.com/components/slider/


      
      if (!Array.isArray(newValue)) {
        return;
      }
      
      if (newValue[1] - newValue[0] < minDistance) {
        if (newValue[1] === tempvalue[1]) {
          const clamped = Math.min(newValue[0], 100 - minDistance);
          setTempValue([clamped, clamped + minDistance]);
          // props.onValueChanged([clamped, clamped + minDistance]);
        } else {
          const clamped = Math.max(newValue[1], minDistance);
          setTempValue([clamped - minDistance, clamped]);
          // props.onValueChanged([clamped - minDistance, clamped]);
        }
      } else {
        setTempValue(newValue);
        // props.onValueChanged(newValue);
      }
    }

    const handleSliderCommitted = (event, newValue) => {
      props.onValueChanged(tempvalue)
      console.log(tempvalue)
      // props.updateList()
    }


    return (
      <div className='slider'>
        <Chip label={`${props.title}: ${tempvalue[0]} - ${tempvalue[1]}`} variant="outlined" />                     
                    
        <Slider className="" 
                      value={tempvalue}
                      onChange={handleSliderChange}
                      onChangeCommitted={handleSliderCommitted} 
                      valueLabelDisplay="auto"
                      />
      </div>
    )
}
export default ValueSelector


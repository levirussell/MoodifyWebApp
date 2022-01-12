import { BrowserRouter, Route, Switch, Link, useRouteMatch, useParams } from 'react-router-dom';
import ParticlesBg  from "particles-bg";
import { Button } from 'react-bootstrap';
import MoodifyHome from './Components/MoodifyHome';
import './App.css';
import './bootstrap/css/bootstrap.min.css';

function App() {
  return (
    <>
    {/* <div className="transparent">

      <ParticlesBg
      color="#000" num={5}
        type="circle"
        bg={{ position: "fixed", zIndex: -1,}}
      />

    </div> */}

      <BrowserRouter>
        <Switch>
          <Route path="/" exact component={MoodifyHome}/>
        </Switch>
      </BrowserRouter>

    </>
  );
}

export default App;

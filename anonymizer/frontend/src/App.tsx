import React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import LayoutController from './Controllers/LayoutController/LayoutController';
import RoutesController from './Controllers/RoutesController/RoutesController';

function App() {
    return (
        <Router>
            <LayoutController>
                <RoutesController />
            </LayoutController>
        </Router>
    );
}

export default App;

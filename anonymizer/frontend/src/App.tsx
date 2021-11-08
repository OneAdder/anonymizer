import React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import LayoutController from './Controllers/LayoutController/LayoutController';
import RoutesController from './Controllers/RoutesController/RoutesController';
import {pdfjs} from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
console.log(pdfjs.version)

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

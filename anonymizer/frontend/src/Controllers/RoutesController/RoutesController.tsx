import React from 'react';
import routes from '@routes';
import {Switch, Route} from 'react-router-dom';
import {NotFound, UploadPage} from '@pages/index';



const RoutesController = () => {
    return (
        <Switch>
            <Route 
                exact
                path={[
                    routes.root,
                    routes.upload
                ]}>
                <UploadPage />
            </Route>
            <Route path="*">
                <NotFound />
            </Route>
        </Switch>
    );
};

export default RoutesController;
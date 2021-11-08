import React from 'react';
import {useStateContext} from '../Context/useState';
import Loading from '../Contents/Loading/Loading';
import ErrorView from '../Contents/Error/Error';
import ContentView from '../Contents/Content/ContentView';

const ContentController = () => {
    const state = useStateContext();
    if (state.fetching) return <Loading />;
    if (state.error) return <ErrorView />;
    if (state.data) return <ContentView />;
    return null;
}


export default ContentController;
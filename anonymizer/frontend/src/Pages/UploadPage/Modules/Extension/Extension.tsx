import React  from 'react';
import Empty from './Contents/Empty/Empty';
import useFileList from '../../Hooks/useFilesList';
import List from './Contents/List/List';
import Scrollbars from 'react-custom-scrollbars';

const Extension = () => {
    const data = useFileList();
    if (!data.length) return <Empty />;
    else return (
        <Scrollbars hideTracksWhenNotNeeded>
            <List />
        </Scrollbars>
    );
};

export default Extension;
import React  from 'react';
import Empty from './Contents/Empty/Empty';
import useFileList from '../../Hooks/useFilesList';
import List from './Contents/List/List';


const Extension = () => {
    const data = useFileList();
    if (!data.length) return <Empty />;
    else return <List />;
};

export default Extension;
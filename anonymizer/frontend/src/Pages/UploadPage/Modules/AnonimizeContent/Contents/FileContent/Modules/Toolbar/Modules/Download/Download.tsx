import React from 'react';
import {Button} from '@root/Components/Controls';
import {DownloadOutlined} from '@ant-design/icons';
import {useActiveUrl} from '../../../../../../Hooks/useActiveUrl';


const Download = () => {
    const url = useActiveUrl();
    if (!url) return null;
    return (
        <a  
            href={url}
            download>
            <Button 
                color="orange"
                icon={<DownloadOutlined />}
                type="primary">
                Скачать
            </Button>
        </a>
    );
};

export default Download;
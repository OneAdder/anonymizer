import React from 'react';
import {Button} from 'antd';
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
                icon={<DownloadOutlined />}
                type="primary">
                Скачать
            </Button>
        </a>
    )
}

export default Download;
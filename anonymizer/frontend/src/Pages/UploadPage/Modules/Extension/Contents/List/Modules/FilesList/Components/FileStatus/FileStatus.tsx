import * as React from 'react';
import {iFiles} from '@types';
import {Tooltip} from 'antd';
import Status from '@root/Components/Status/Status';

type iFileStatus = {
    status: iFiles.Status
}

const textMapper = (status: iFiles.Status) =>  {
    switch (status) {
        case 'error':
            return 'Ошибка обработки файла';
        case 'success':
            return 'Анонимизирован';
        case 'loading':
            return 'Загрузка...';
        default:
            return 'Неизвестно';
    }
};

const toolTipMapper = (status: iFiles.Status) => {
    switch (status) {
        case 'error':
            return 'Анонимизация для данного файла не доступна';
        case 'success':
            return 'Документ анонимизирован и доступен к просмотру';
        case 'loading':
            return 'Выполняется анонимизация файла';
        default:
            return 'Неизвестно';
    }
};

const colorMapper = (status: iFiles.Status) => {
    switch (status) {
        case 'error':
            return 'red';
        case 'success':
            return 'green';
        case 'loading':
            return 'yellow';
        default:
            return 'yellow';
    }
};


const FileStatus = (props: iFileStatus) => {
    return (
        <div>
            <Tooltip title={toolTipMapper(props.status)}>
                <div>
                    <Status color={colorMapper(props.status)}>
                        {textMapper(props.status)}
                    </Status>
                </div>
            </Tooltip>
        </div>
    );
};

export default FileStatus;
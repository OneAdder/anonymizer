import React from 'react';
import {iSidebarItem} from '../types';
import FileIcon from '../Icons/File';
import {matchPath, useLocation} from 'react-router-dom';
import routes from '@routes';


export const useSidebarData = () => {
    const location = useLocation();
    const data:iSidebarItem[] = [
        {
            active: false,
            icon: <FileIcon />,
            url: [
                routes.upload,
                routes.root
            ],
            desc: 'Работа с документами'
        }
    ];
    return data.map((item) => {
        item.active = Boolean(
            matchPath(location.pathname, {
                path: item.url,
                exact: true
            })
        );
        return item;
    });
};


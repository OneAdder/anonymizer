import React from 'react';
import {notification} from 'antd';


const NotificationComponent = () => {
    const test = notification.useNotification();
    console.log(test);
};

export default NotificationComponent;
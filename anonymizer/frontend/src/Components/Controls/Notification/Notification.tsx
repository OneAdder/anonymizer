import React from 'react';
import {notification} from 'antd';
import {ArgsProps} from 'antd/lib/notification';
import Box from '@root/Components/Box/Box';
import styles from './Notification.module.less';

type iOpenProps = {
    antProps?: Partial<ArgsProps>;
    title: string | JSX.Element;
    desc: string | JSX.Element;
    icon?: JSX.Element | null;
}

const NotificationComponent = {
    open: (props: iOpenProps) => {
        notification.open({
            ...props.antProps,
            placement: 'bottomRight',
            className: styles.wrapper,
            closeIcon: <></>,
            message: (
                <div>
                    <div className={styles.title}>
                        {props.title}
                        <Box visible={Boolean(props.icon)}>
                            <div className={styles.icon}>
                                {props.icon}
                            </div>
                        </Box>
                    </div>
                    <div className={styles.content}>
                        {props.desc}
                    </div>
                </div>
            )
        });
    },
    close: notification.close
};

export default NotificationComponent;
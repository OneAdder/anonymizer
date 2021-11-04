import React from 'react';
import Icon from '../../Icons/NoDataImg';
import styles from './EmptyTemplate.module.less';


type iEmptyTemplate = {
    icon: JSX.Element;
    title: string | JSX.Element;
    desc: string | JSX.Element;
}

const EmptyTemplate = (props: iEmptyTemplate) => {
    return (
        <div className={styles.wrapper}>
            <div className={styles.content}>
                {props.icon}
                <div className={styles.title}>
                    {props.title}
                </div>
                <div className={styles.desc}>
                    {props.desc}
                </div>
            </div>
        </div>
    );
};


export default EmptyTemplate;
import React, {useMemo} from 'react';
import {iSidebarItem} from '../../types';
import {Link} from 'react-router-dom';
import classnames from 'classnames';
import styles from './SidebarItem.module.less';

type iSidebarItemProps = {
    item: iSidebarItem;
}

const SidebarItem = (props: iSidebarItemProps) => {
    const {item} = props;
    const url = useMemo(() => {
        const {url} = item;
        if (Array.isArray(url)) return url[0]; 
        else return url;
    }, [item]);

    const classes = {
        wrapper: classnames(
            styles.wrapper,
            {
                [styles.wrapperActive]: item.active
            }
        )
    };
    return (
        <Link to={url}>
            <div className={classes.wrapper}>
                <div className={styles.icon}>
                    {item.icon}
                </div>
            </div>
        </Link>
    );
};

export default SidebarItem;
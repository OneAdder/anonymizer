import React from 'react';
import styles from './Status.module.less';
import classnames from 'classnames';

type iStatus = {
    color: 'red' | 'green' | 'yellow'
    children: JSX.Element | string;
}

const Status = (props: iStatus) => {

    const classes = {
        dot: classnames(
            styles.dot,
            {
                [styles.dotGreen]: props.color === 'green',
                [styles.dotYellow]: props.color === 'yellow',
                [styles.dotRed]: props.color === 'red',
            }
        )
    }
    return (
        <div className={styles.wrapper}>
            <div className={classes.dot} />
            {props.children}
        </div>
    )
}


export default Status;
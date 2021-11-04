import React from 'react';
import styles from './PaddingContainer.module.less';


type iPaddingContainer = {
    children: JSX.Element;
}

const PaddingContainer = (props: iPaddingContainer) => {
    return (
        <div className={styles.wrapper}>
            {props.children}
        </div>
    );
};

export default PaddingContainer;
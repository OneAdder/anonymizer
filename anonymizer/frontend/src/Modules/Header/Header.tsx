import React from 'react';
import Logo from '@root/Icons/Logo';
import styles from './Header.module.less';

const Header = () => {
    return (
        <div className={styles.wrapper}>
            <div className={styles.icon}>
                <Logo />
            </div>
        </div>
    );
};


export default Header;
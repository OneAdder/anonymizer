import React from 'react';
import {Result} from 'antd';
import styles from './NotFound.module.less';

const NotFound = () => {
    return (
        <div className={styles.wrapper}>
            <Result 
                status="404"
                title="404"
                extra={
                    <div className={styles.extra}>
                        Запрашиваемая вами страница не найдена. <br />
                        Возможно вы ошиблись а адрессной строке, <br />
                        либо используете не актуальную ссылку
                    </div>
                }
            />
        </div>
    )
}

export default NotFound;
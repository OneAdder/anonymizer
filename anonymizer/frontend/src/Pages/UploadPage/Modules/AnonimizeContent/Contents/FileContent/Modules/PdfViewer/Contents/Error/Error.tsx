import React from 'react';
import { Result } from 'antd';
import styles from './Error.module.less';


const ErrorView = () => {
    return (
        <div className={styles.wrapper}>
            <Result 
                status="500"
                title="Ошибка при загрузке документа"
                extra={
                    <div>
                        При загрузке документа произошла ошибка. <br />
                        Ошибка может носить временный характер, попробуйте загрузить снова
                    </div>
                }
            />
        </div>
    );
};


export default ErrorView;
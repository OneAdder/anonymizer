import React, {useMemo, useEffect} from 'react';
import {Button, ButtonProps} from 'antd';
import {getProps} from '@root/Utils/Object/getProps';
import classnames from 'classnames';
import styles from './Button.module.less';

type iButtonComponent = Omit<ButtonProps, 'type'> & {
    color: 'orange' | 'blue';
    type?: ButtonProps['type'] | 'defaultColor';
}


const getType = (type: iButtonComponent['type']):ButtonProps['type'] => {
    if (!type) return 'default';
    if (type === 'defaultColor') return 'default';
    return type;
};


const ButtonComponent = (props: iButtonComponent) => {
    const antdProps = useMemo(() => {
        return getProps(props, ['color']);
    }, [props]);
    return React.createElement(
        Button, 
        {
            ...antdProps,
            type: getType(props.type),
            className: classnames(
                styles.btn, props.className,
                {
                    [styles.btnBlue]: props.color === 'blue',
                    [styles.btnColorDefault]: props.type === 'defaultColor'
                }
            )
        }
    );
};

ButtonComponent.defaultProps = {
    color: 'blue'
};

export default ButtonComponent;
import React from 'react';
import {Layout, LayoutProps} from 'antd';
import styles from './Layout.module.less';
import classnames from 'classnames';
import { BasicProps } from 'antd/lib/layout/layout';
import { SiderProps } from 'antd/lib/layout';

const CustomLayout = (props: LayoutProps) => {
    return React.createElement(
        Layout,
        {
            ...props,
            className: classnames(
                props.className,
                styles.layout
            )
        }
    )
}

const CustomHeader = (props: BasicProps) => {
    return React.createElement(
        Layout.Header,
        {
            ...props,
            className: classnames(
                props.className,
                styles.header
            )
        }
    )
}
const CustomContent = (props: BasicProps) => {
    return React.createElement(
        Layout.Content,
        {
            ...props,
            className: classnames(
                props.className,
                styles.content
            )
        }
    )
}
const CustomSider = (props: SiderProps) => {
    return React.createElement(
        Layout.Sider,
        {
            ...props,
            collapsedWidth: 56,
            className: classnames(
                props.className,
                styles.sider
            )
        }
    )
}

const LayoutWrapper = (props: BasicProps) => {
    return React.createElement(
        'div',
        {
            ...props,
            className: classnames(
                props.className,
                styles.wrapper
            )
        }
    )
}

CustomLayout.Header = CustomHeader;
CustomLayout.Content = CustomContent;
CustomLayout.Sider = CustomSider;
CustomLayout.Wrapper = LayoutWrapper;

export default CustomLayout;
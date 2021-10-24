import React from 'react';
import Layout from '@components/Customized/Layout/Layout';
import HeaderModule from '@modules/Header/Header';
import LkSidebar from '@modules/LkSidebar/LkSidebar';
import {Affix} from 'antd';
import styles from './LkLayout.module.less';

const {Header, Content, Sider, Wrapper} = Layout;

type iLkLayout = {
    header: JSX.Element;
    sider: JSX.Element;
    children: JSX.Element;
}

const LkLayout = (props: iLkLayout) => {
    return (
        <Wrapper>
            <Header>
                {props.header}
            </Header>
            <Layout>
                <Affix className={styles.affix}>
                    <Sider
                        className={styles.sider} 
                        collapsed>
                        {props.sider}
                    </Sider>
                </Affix>
                <Content>
                    {props.children}
                </Content>
            </Layout>
        </Wrapper>
    )
}

LkLayout.defaultProps = {
    header: <HeaderModule />,
    sider: <LkSidebar />
}


export default LkLayout;
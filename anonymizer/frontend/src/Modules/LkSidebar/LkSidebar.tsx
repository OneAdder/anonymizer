import React from 'react';
import styles from './LkSidebar.module.less';
import SidebarItem from './Components/SidebarItem/SidebarItem';
import {useSidebarData} from './Hooks/useSidebarData';
import {Tooltip} from 'antd';

const LkSidebar = () => {
    const data = useSidebarData();
    return (
        <div className={styles.wrapper}>
            {
                data.map((item, index) => (
                    <Tooltip 
                        getTooltipContainer={(node) => node}
                        placement="right"
                        title={item.desc}
                        key={index}>
                        <div>
                            <SidebarItem 
                                item={item} 
                                key={index}
                            />
                        </div>
                    </Tooltip>
                ))
            }
        </div>
    );
};

export default LkSidebar;
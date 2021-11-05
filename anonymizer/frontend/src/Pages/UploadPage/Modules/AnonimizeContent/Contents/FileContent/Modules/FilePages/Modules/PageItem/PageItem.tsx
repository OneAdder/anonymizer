import React from 'react';
import {useActiveSettings} from '../../../../../../../../Hooks/useActiveSettings';
import {Page} from 'react-pdf';
import styles from './PageItem.module.less';

type iPageComponent = {
    index: number;
}

const PageItem = (props: iPageComponent) => {
    const settings = useActiveSettings();
    if (!settings) return null;
    return (
        <Page

            scale={settings.scale}
            className={styles.wrapper}
            renderAnnotationLayer={false}
            renderTextLayer={true}
            pageNumber={props.index + 1}>
            <div>
                asd
            </div>
        </Page>
    );
};

export default PageItem;
import React from 'react';
import {useStateContext} from '../../Context/useState';
import PdfPage from './Modules/PdfPage/PdfPage';
import styles from './ContentView.module.less';

const ContentView = () => {
    const state = useStateContext();
    if (!state.data) return null;
    if (!state.data.numPages) return null
    
    return (
        <div>
            {
                new Array(state.data.numPages)
                    .fill('')
                    .map((item, index) => (
                        <div 
                            className={styles.page}
                            key={index}>
                            <PdfPage 
                                index={index}
                            />
                        </div>
                    ))
            }
        </div>
    );
};

export default ContentView;
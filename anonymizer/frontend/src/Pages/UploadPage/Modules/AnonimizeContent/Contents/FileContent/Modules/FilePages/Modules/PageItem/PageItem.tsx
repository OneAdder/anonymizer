import React, {useEffect, useState} from 'react';
import {useActiveSettings} from '../../../../../../../../Hooks/useActiveSettings';
import {Page} from 'react-pdf';
import {Stage, Layer, Rect, } from 'react-konva';
import Konva from 'konva';
import styles from './PageItem.module.less';
import Box from '@root/Components/Box/Box';
import {Button} from '@root/Components/Controls';
import jsPDF from 'jspdf';

type iPageComponent = {
    index: number;
}



const PageItem = (props: iPageComponent) => {
    const settings = useActiveSettings();
    const [height, setHeight] = useState(0);
    const [width, setWidth] = useState(0);
    const pageRef = React.useRef<HTMLCanvasElement>(null);
    const konvaRef = React.useRef<Konva.Layer>(null);

    useEffect(() => {
        if (!pageRef.current) return;
        setHeight(pageRef.current.height);
        setWidth(pageRef.current.width);
    }, [settings?.scale])

    

    // useEffect(() => {
    //     if (!pageRef.current) return;
    //     let active = false;
    //     let startX = 0;
    //     let startY = 0;
    //     const context = pageRef.current.getContext('2d');

    //     pageRef.current.onmousedown = (event) => {
    //         active = true;
    //         startX = event.offsetX;
    //         startY = event.offsetY;
    //         const state = context?.save();
    //         console.log(startX, startY, state);
    //     }
    //     pageRef.current.onmouseup = (event) => {
    //         active = false;
    //         startX = 0;
    //         startY = 0;
    //         context?.restore()
    //     }
    //     pageRef.current.onmousemove = (event) => {
    //         if (!active) return;
    //         if (!pageRef.current) return;
    //         const x = startX * 2;
    //         const y = startY * 2;
    //         const dx = event.offsetX * 2 - startX * 2;
    //         const dy = event.offsetY * 2 - startY * 2;
    //         context?.restore();
    //         context?.fillRect(x,y,dx,dy);
    //     }
    // }, [pageRef.current])


    if (!settings) return null;

    return (
        <>
            {/* <Button onClick={() => {
                if (!pageRef.current) return;
                const pdf = new jsPDF(
                    width > height ? 'l' : 'p', 
                    'px', 
                    [height/2, width/2]);
                pdf
                    .addPage()
                    .addImage(
                    pageRef.current.toDataURL(),
                    0,
                    0,
                    width / 2,
                    height / 2
                );
                pdf.save('canvas.pdf')
            }}>
                Сохранить
            </Button> */}
            <Page
                scale={settings.scale}
                className={styles.wrapper}
                renderAnnotationLayer={false}
                canvasRef={pageRef}
                onLoadSuccess={() => {
                    if (pageRef.current) {
                        setHeight(pageRef.current.height);
                        setWidth(pageRef.current.width);
                    }
                }}
                onRenderSuccess={() => {
                    if (!pageRef.current) return;
                    if (!konvaRef.current) return;
                }}
                renderMode="canvas"
                renderTextLayer={false}
                pageNumber={props.index + 1}>
            </Page>
        </>
    );
};

export default PageItem;
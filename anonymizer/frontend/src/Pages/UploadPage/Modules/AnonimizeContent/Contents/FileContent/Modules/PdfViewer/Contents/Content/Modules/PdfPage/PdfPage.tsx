import React, {useEffect, useRef, useState, useMemo, useCallback} from 'react';
import {Button} from '@root/Components/Controls';
import { PDFPageProxy } from 'react-pdf';
import {useStateContext} from '../../../../Context/useState';
import {Stage, Layer, Rect, Image} from 'react-konva';
import Konva from 'konva';
import {useActiveSettings} from '../../../../../../../../../../Hooks/useActiveSettings';
import jsPDF from 'jspdf';

type iPdfPage = {
    index: number;
}

const PdfPage = (props: iPdfPage) => {
    const state = useStateContext();
    const layerDocRef = useRef<Konva.Layer>(null);
    const stageRef = useRef<Konva.Stage>(null);
    const settings = useActiveSettings();
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [page, setPage] = useState<PDFPageProxy|null>(null);


    useEffect(() => {
        //get page data
        if (!state.data) return;
        if (!layerDocRef.current) return;
        
        state
            .data
            .getPage(props.index + 1)
            .then((page:PDFPageProxy) => {
                setPage(page);
            })
    }, [state.data, props.index]);

    useEffect(() => {
        //render canvas
        if (!page) return;
        if (!layerDocRef.current) return;
        const scale = settings?.scale ? settings.scale : 1;
        const viewport = page.getViewport({scale});
        const context = layerDocRef.current.getContext();
        setWidth(viewport.width);
        setHeight(viewport.height);
        page.render({
            canvasContext: context,
            viewport
        });
    }, [page, settings?.scale]);

    if (!state.data) return null;
    if (!settings) return null;
    
    return (
        <div>
            {/* <Button onClick={() => {
                if (!layerDocRef.current) return;
                if (!stageRef.current) return;
                const pdf = new jsPDF(
                    width > height ? 'l' : 'p', 
                    'px', 
                    [height/2, width/2]);
                pdf
                    .addImage(
                        layerDocRef.current.getCanvas().toDataURL('',1),
                        0,
                        0,
                        width / 2,
                        height / 2
                    )
                    .addImage(
                        stageRef.current.toDataURL({pixelRatio: 2}),
                        0,
                        0,
                        width / 2,
                        height / 2
                    )

                pdf.save('canvas.pdf')
            }}>
                Сохранить
            </Button> */}
            <Stage 
                ref={stageRef}
                width={width} 
                height={height}>
                <Layer ref={layerDocRef} />
                <Layer>
                    <Rect 
                        x={0}
                        y={0}
                        visible={false}
                        
                    />
                    <Rect
                        opacity={0.1}
                        x={60 * settings.scale}
                        y={125 * settings.scale} 
                        width={50 * settings.scale}
                        height={20 * settings.scale}
                        fill="red"
                    />
                </Layer>
            </Stage>
        </div>
    );
};


export default PdfPage;
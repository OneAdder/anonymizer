import React, {useEffect, useRef, useState, useMemo, useCallback} from 'react';
import {PDFPageProxy} from 'react-pdf';
import {useStateContext} from '../../../../Context/useState';
import {Stage, Layer, Rect, Image} from 'react-konva';
import Konva from 'konva';
import {useActiveSettings} from '../../../../../../../../../../Hooks/useActiveSettings';
import getRectSize from './Utils/getRectSize';
import {useDispatch} from 'react-redux';
import Actions from '@actions';
import {useActiveFile} from '@root/Pages/UploadPage/Hooks/useActiveFile';
import {Menu} from 'antd';
import styles from './PdfPage.module.less';

type iPdfPage = {
    index: number;
}

const PdfPage = (props: iPdfPage) => {
    const state = useStateContext();
    const layerDocRef = useRef<Konva.Layer>(null);
    const layerVerificationRef = useRef<Konva.Layer>(null);
    const file = useActiveFile();
    const stageRef = useRef<Konva.Stage>(null);
    const settings = useActiveSettings();
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [page, setPage] = useState<PDFPageProxy|null>(null);
    const [selectVisible, setSelectVisible] = useState(false);
    const [selectX2, setSelectX2] = useState(0);
    const [selectY2, setSelectY2] = useState(0);
    const [selectX1, setSelectX1] = useState(0);
    const [selectY1, setSelectY1] = useState(0);
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuX, setMenuX] = useState(0);
    const [menuY, setMenuY] = useState(0);
    const [menuKey, setMenuKey] = useState('');
    const dispatch = useDispatch();
    const rectSize = useMemo(() => {
        return getRectSize(selectX1, selectX2, selectY1, selectY2);
    }, [selectX1, selectX2, selectY1, selectY2]);


    useEffect(() => {
        //get page data
        if (!state.data) return;
        if (!layerDocRef.current) return;
        
        state
            .data
            .getPage(props.index + 1)
            .then((page:PDFPageProxy) => {
                setPage(page);
            });
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
    if (!file) return null;
    if (!file.file) return null;
    
    return (
        <div 
            data-id="page-item"
            data-number={props.index}
            className={styles.page}>
            <div
                className={styles.menu}
                style={{
                    display: menuVisible ? 'block' : 'none',
                    position:'absolute',
                    left: `${menuX}px`,
                    top: `${menuY}px`,
                    zIndex: 101
                }}>
                <Menu>
                    <Menu.Item 
                        key="delete"
                        onClick={() => {
                            if (!file.file) return;
                            dispatch(Actions.Pages.UploadPage.deleteVerificationNode({
                                fileId: file.file.uid,
                                nodeId: menuKey
                            }));
                            setMenuVisible(false);
                            setMenuKey('');
                        }}>
                        Удалить
                    </Menu.Item>
                </Menu>
            </div>
            <Stage 
                ref={stageRef}
                width={width} 
                onMouseDown={(event) => {

                    setMenuVisible(false);
                    if (!settings.verification) return;
                    if (!stageRef.current) return;
                    if (settings.mode === 'until') return;
                    setSelectVisible(true);
                    const stage = stageRef.current;
                    event.evt.preventDefault();
                    const position = stage.getPointerPosition();
                    if (!position) return;
                    setSelectX1(position.x);
                    setSelectX2(position.x);
                    setSelectY1(position.y);
                    setSelectY2(position.y);
                }}
                onMouseUp={(event) => {
                    if (!file?.file) return;
                    if (!layerVerificationRef.current) return;
                    event.evt.preventDefault();
                    if (!selectVisible) return;
                    setSelectVisible(false);
                    dispatch(Actions.Pages.UploadPage.addVerificationNode({
                        id: file.file.uid,
                        node: {
                            height: rectSize.height / settings.scale,
                            width: rectSize.width / settings.scale,
                            x: rectSize.x / settings.scale,
                            y: rectSize.y / settings.scale,
                            pageIndex: props.index
                        }
                    }));
                    setSelectX1(0);
                    setSelectX2(0);
                    setSelectY1(0);
                    setSelectY2(0);
                }}
                onMouseMove={(event) => {
                    if (!stageRef.current) return;
                    if (!selectVisible) return;
                    const stage = stageRef.current;
                    event.evt.preventDefault();
                    const position = stage.getPointerPosition();
                    if (!position) return;
                    setSelectX2(position.x);
                    setSelectY2(position.y);
                }}
                height={height}>
                <Layer 
                    name="test"
                    ref={layerDocRef} 
                />
                <Layer  
                    ref={layerVerificationRef}>
                    {
                        settings.mode === 'after' && file
                            .verificationNodes
                            .filter((item) => item.pageIndex === props.index)
                            .map((item) => (
                                <Rect 
                                    key={item.key}
                                    x={settings.scale * item.x}
                                    y={settings.scale * item.y}
                                    onMouseEnter={() => {
                                        if (!stageRef.current) return;
                                        if (item.verificated) return;
                                        stageRef.current.container().style.cursor = 'pointer';
                                    }}
                                    onMouseLeave={() => {
                                        if (!stageRef.current) return;
                                        if (item.verificated) return;
                                        stageRef.current.container().style.cursor = 'default';
                                    }}
                                    height={settings.scale * item.height}
                                    width={settings.scale * item.width}
                                    onContextMenu={(event) => {
                                        if (item.verificated) return;
                                        event.evt.preventDefault();
                                        event.evt.stopPropagation();
                                        if (!stageRef.current) return;
                                        const position = stageRef.current.getPointerPosition();
                                        if (!position) return;
                                        setMenuVisible(true);
                                        setMenuX(position.x);
                                        setMenuY(position.y + 10);
                                        setMenuKey(item.key);
                                    }}
                                    opacity={
                                        item.verificated
                                            ? 1
                                            : 0.5
                                    }
                                    cornerRadius={
                                        item.verificated
                                            ? 0
                                            : 4
                                    }
                                    fill={
                                        item.verificated
                                            ? '#000'
                                            : '#CCE4FB'
                                    }
                                />
                            ))
                    }
                    <Rect 
                        fill="#CCC"
                        opacity={0.5}
                        cornerRadius={4}
                        x={rectSize.x}
                        y={rectSize.y}
                        visible={selectVisible}
                        width={rectSize.width}
                        height={rectSize.height}
                    />
                </Layer>
            </Stage>
        </div>
    );
};


export default PdfPage;
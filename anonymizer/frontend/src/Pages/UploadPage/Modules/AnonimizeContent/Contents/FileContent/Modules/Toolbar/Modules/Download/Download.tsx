import React from 'react';
import {Button} from '@root/Components/Controls';
import {DownloadOutlined} from '@ant-design/icons';
import {useActiveUrl} from '../../../../../../Hooks/useActiveUrl';
import {useActiveSettings} from '../../../../../../../../Hooks/useActiveSettings';
import Box from '@root/Components/Box/Box';
import {message} from 'antd';
import jsPDF from 'jspdf';
import {useActiveFile} from '../../../../../../../../Hooks/useActiveFile';

const Download = () => {
    const url = useActiveUrl();
    const settings = useActiveSettings();
    const file = useActiveFile();

    if (!file) return null;
    if (!file.file) return null;
    if (!settings) return null;
    if (!url) return null;

    return (
        <Box visible={settings.mode === 'after'}>
            <Button 
                color="orange"
                onClick={() => {
                    const pages = document.querySelectorAll(`[data-id="page-item"]`);
                    if (!pages.length) {
                        message.error('Ошибка при скачивании файла');
                    }
                    const firstPageCanvases = pages[0].querySelectorAll('canvas');
                    const firstPageCanvas = firstPageCanvases[0];
                    const width = firstPageCanvas.width;
                    const height = firstPageCanvas.height;
                    const pdf = new jsPDF(
                        width > height ? 'l' : 'p', 
                        'px', 
                        [height/2, width/2]
                    );
                    pages.forEach((page, index) => {
                        const canvases = page.querySelectorAll('canvas');
                        canvases.forEach((canvas) => {
                            pdf.addImage(
                                canvas.toDataURL('',1),
                                0,
                                0,
                                width / 2,
                                height / 2
                            );
                        });
                        if (index !== pages.length - 1) {
                            pdf.addPage();
                        }
                    });
                    pdf.save(file.file?.name);
                }}
                disabled={settings.verification}
                icon={<DownloadOutlined />}
                type="primary">
                Скачать
            </Button>
        </Box>
    );
};

export default Download;
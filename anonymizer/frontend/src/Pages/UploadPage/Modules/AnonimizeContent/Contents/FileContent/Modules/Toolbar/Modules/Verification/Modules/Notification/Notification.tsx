import React from 'react';
import {notification} from '@root/Components/Controls';
import TurnOnIcon from '../../../../../../../../Icons/Notification/VerificationTurnOn';
import TurnOffIcon from '../../../../../../../../Icons/Notification/VerificationTurnOff';

export const turnOnNotification = {
    open: () => {
        notification.open({
            title: 'Режим верификации включен',
            desc: 'Как только вы закончите верификацию, нажмите на кнопку «Завершить» в верхнем меню',
            icon: <TurnOnIcon />,
            antProps: {
                duration: 8
            }
        });
    }
};

export const turnOffNotification = {
    open: () => {
        notification.open({
            title: 'Верификация завершена',
            desc: 'Верификация текста успешно завершена. Можете скачать обезличенный документ.',
            icon: <TurnOffIcon />,
            antProps: {
                duration: 8
            }
        });
    }
};


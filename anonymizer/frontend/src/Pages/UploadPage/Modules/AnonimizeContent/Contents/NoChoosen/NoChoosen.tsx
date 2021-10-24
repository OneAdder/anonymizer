import React from 'react';
import EmptyTemplate from '../../Components/EmptyTemplate/EmptyTemplate';
import Icon from '../../Icons/NoChooseImg';

const NoChoosen = () => {
    return (
        <EmptyTemplate 
            icon={<Icon />}
            title="Выберите документ"
            desc="Вы не выбрали документ для обезличивания"
        /> 
    )
}

export default NoChoosen;
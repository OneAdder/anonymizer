import React from 'react';
import Icon from '../../Icons/NoDataImg';
import EmptyTemplate from '../../Components/EmptyTemplate/EmptyTemplate';

const NoData = () => {
    return (
        <EmptyTemplate 
            icon={<Icon />}
            title="Начните обезличивание"
            desc={
                <>
                    Вы можете начать обезличивание <br />
                    документа, нажав на кнопку
                </>
            }
        />
    )
}


export default NoData;
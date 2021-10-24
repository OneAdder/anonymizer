import React from 'react';
import LkLayout from '@root/Layouts/LkLayout/LkLayout';


type iLayoutController = {
    children: JSX.Element;
}

const LayoutController = (props: iLayoutController) => {
    return (
        <LkLayout>
            {props.children}
        </LkLayout>
    )
}

export default LayoutController;
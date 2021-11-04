import React from 'react';


type iBox = {
    children: JSX.Element;
    visible: boolean;
}

const Box = (props: iBox) => {
    if (!props.visible) return null;
    return (
        <>
            {props.children}
        </>
    );
};

export default Box;
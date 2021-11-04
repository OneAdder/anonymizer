


export const getProps = <Source>(props: Source, exclude: (keyof Source)[]) => {
    const result = {...props};
    exclude.forEach((item) => {
        delete result[item];
    });
    return result;
};
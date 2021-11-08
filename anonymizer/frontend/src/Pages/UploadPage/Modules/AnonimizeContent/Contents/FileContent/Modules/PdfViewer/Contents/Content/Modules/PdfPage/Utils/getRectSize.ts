




export const getRectSize = (x1: number, x2: number, y1: number, y2: number) => {
    return {
        x: Math.min(x1, x2),
        y: Math.min(y1, y2),
        width: Math.abs(x2 - x1),
        height: Math.abs(y2 - y1)
    };
};

export default getRectSize;
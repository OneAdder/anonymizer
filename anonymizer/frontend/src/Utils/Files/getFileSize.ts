

export const getFileSize = (size: number) => {
    const postfix = ['bytes', 'Kb', 'Mb', 'Gb'];
    let index = 0;
    let localSize = size;
    while (localSize > 1024) {
        localSize = localSize / 1024;
        index = index + 1;
    }
    return `${localSize.toFixed(1)} ${postfix[index]}`;
};
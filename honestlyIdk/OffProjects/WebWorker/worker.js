self.onmessage = ({ data }) => {
    setTimeout(() => {
        if (data[0][1] === data[1][1]) self.postMessage({ nodeIds: [data[0][0], data[1][0]], equal: true })
        else if (data[0][1] > data[1][1]) self.postMessage({ nodeIds: [data[0][0], data[1][0]] });
        else self.postMessage({ nodeIds: [data[1][0], data[0][0]] });
    }, 1);
};
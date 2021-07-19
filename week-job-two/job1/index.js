export function findMax (arr = []) {
    if (!Array.isArray(arr)) {
        console.error('The parameter arr is not an array!');
        return;
    }

    return arr.reduce((a, b) => {
        return a > b ? a : b;
    }, 0);
}
module.exports = {
    isUUID: (str) => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(str);
    },
    isStrNumbersOnly(str) {
        const regex = /^[0-9]+$/;
        return regex.test(str);
    }
}
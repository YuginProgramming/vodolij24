export const numberFormatFixing = (phone) => {
    console.log(phone.length)
    if (phone.length == 12) {
        return phone;
    } else if (phone.length == 13) {
        const fixedNumber = phone.slice(1);
        return fixedNumber;
    } else if (phone.length == 10) {
        const fixedNumber = '38' + phone;
        return fixedNumber;
    } else if (phone.length == 9) {
        const fixedNumber = '380' + phone;
        return fixedNumber;
    } else if (phone.length == 11) {
        const fixedNumber = '3' + phone;
        return fixedNumber;
    }
}


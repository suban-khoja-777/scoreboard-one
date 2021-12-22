const generateRandomId = () => {
    return (
        (Math.random()*1000).toString(16).substr(0,5).replace('.','') 
        + '-' + 
        (Math.random()*1000).toString(16).substr(0,5).replace('.','') 
    );
}

export const generatePlayerId = () => {
    return 'P-'+generateRandomId();
}

export const generateGameId = () => {
    return 'G-'+generateRandomId();
}

export const generateRoundId = () => {
    return 'R-'+generateRandomId();
}

const getDateString = () => {
    let dateArr = new Date().toDateString().split(' ');
    dateArr.shift();
    return dateArr[1] + ' ' + dateArr[0] + ' ' +dateArr[2];
}

const getTimeString = () => {
    return new Date().toLocaleTimeString();
}

export const getDateTimeAsString = () => {
    return getDateString() + ' ' + getTimeString();
}


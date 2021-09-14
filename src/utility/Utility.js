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


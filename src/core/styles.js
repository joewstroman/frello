
const getRandomColor = () => {
    let red = (135 + Math.floor(Math.random() * 120)).toString(16);
    let green = (135 + Math.floor(Math.random() * 120)).toString(16);
    let blue = (200 + Math.floor(Math.random() * 55)).toString(16);
  
    return `#${red}${green}${blue}D6`;
}
  
const iconStyles = () => {
    return {cursor: "pointer", fontSize: "13px"}
}

const headerStyles = (color) => {
    let styles = {
        backgroundColor: color,
        color: "white",
        margin: "0"
    }
    return styles;
}

const cardStyles = () => {
    return { 
        padding: "5px 0px",
        backgroundColor: "rgb(242,242,242)"
    }
}

const boardStyles = () => {
    let styles = { 
        margin: "5px 0px",
        backgroundColor: "rgb(242,242,242)",
        textAlign: "center", 
        minWidth: 300,
        border: 1,
        borderStyle: "groove",
        borderRadius: "5px",
        overflow: "hidden"
    }
return styles;
}

const appStyles = () => {
    let styles = {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-around',
        padding: 25 / 2,
    }
    return styles;
}

export { appStyles, boardStyles, cardStyles, getRandomColor, headerStyles, iconStyles }

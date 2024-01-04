const generateKeyboard = (columns, buttons) => {
    const keyboard = [];
    let row = [];
  
    buttons.forEach((button, index) => {
      let buttonOBJ = button[0];
      if(typeof(buttonOBJ) === 'string') buttonOBJ = { text: button[0] };
      row.push(buttonOBJ);
  
      if ((index + 1) % columns === 0 || index === buttons.length - 1) {
        keyboard.push(row);
        row = [];
      }
    });
  
    return keyboard;
  }
      
  export {
    generateKeyboard
  }
function displayShape() {
    const rows = 5;
    let output = '';

    for (let i = rows; i > 0; i--) {
        for (let j = 0; j < i; j++) {
            output += '*  ';
        }
        output += '\n';
    }

    console.log(output);
}

displayShape();

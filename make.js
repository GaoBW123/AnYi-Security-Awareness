const fs = require('fs');
const path = require('path');

const opPattern = /--(\w+)/;
const propPattern = /\$\{(\w+)\}/g;

let args = process.argv;
let execArgs = process.execArgv;
let varMap = new Map();


let now = "";
args.slice(2).forEach((val, idx) => {
    if(opPattern.test(val)) {
        now = opPattern.exec(val)[1];        
    } else {
        if (varMap.get(now) === undefined) {
            varMap.set(now, [val]);
        } else {
            varMap.get(now).push(val); 
        }
    }
});

if (varMap.get("tmp") == undefined) {
    varMap.set("tmp", ["./templates/def.tsx.tem"]);
}
if (varMap.get("out") == undefined) {
    varMap.set("out", ["./src/components"]);
}

let temConStr = fs.readFileSync(path.join(__dirname, varMap.get("tmp")[0])).toString();

for (const name of varMap.get("name")) {
    let text = temConStr.replace(propPattern, name);
    if(!fs.existsSync(path.join(__dirname, varMap.get("out")[0], name))) {
        fs.mkdirSync(path.join(__dirname, varMap.get("out")[0], name));
    }
    fs.writeFileSync(path.join(__dirname, varMap.get("out")[0], name, name + "." + varMap.get("ext")[0]), text);
}
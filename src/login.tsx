import * as React from "react";
import * as ReactDom from "react-dom/client";

import Login from "./components/Login/Login";

let root = ReactDom.createRoot(document.getElementById("root"));
root.render(<Login/>);
import * as React from "react";
import * as ReactDom from "react-dom/client";
import App from "./components/App/App";

let root = ReactDom.createRoot(document.getElementById("root"));
root.render(<App/>);
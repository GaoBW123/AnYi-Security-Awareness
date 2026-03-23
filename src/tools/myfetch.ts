
export const fetch1 = (url: string, handle:(data: any) => void, opt = {method: "POST"} as RequestInit ):void => {
    fetch(url, opt)
    .then(res => res.json())
    .then(data => {if(data["status"] === 200) return data["data"]; else throw new Error(data["message"]);})
    .then(data => handle(data))
    .catch(err => alert(err));
}
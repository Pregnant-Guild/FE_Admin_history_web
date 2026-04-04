import { API } from "../../../api";

export default async function GetUser() {
  let data = await fetch(API.User.CURRENT, {
    credentials: "include",
  });

  let result = await data.json();
  console.log("Current User from GetUser component:", result);
  return <div className="">GetUser</div>;
}

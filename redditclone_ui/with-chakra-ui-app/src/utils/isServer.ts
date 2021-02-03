//this util function is created to return false when called from server
//for example, prevent some function from being called when server-side rendered
export const isServer = () => typeof window === "undefined";

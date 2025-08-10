export function getToken() {
    const tokenStr = localStorage.getItem("token");
    if (tokenStr) {
        return tokenStr as string;
    } else {
        return null;
    }
}
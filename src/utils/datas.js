export function hojeISO() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

export function mesRefDeDataISO(dataISO) {
    return dataISO.slice(0, 7); // "YYYY-MM"
}

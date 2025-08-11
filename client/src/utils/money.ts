export const money = (n: number | string) =>
    Number(n).toLocaleString('ru-RU', {
        style: 'currency',
        currency: 'KZT',
        maximumFractionDigits: 0
    })
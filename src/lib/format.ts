export function formatCurrency(amountCents: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amountCents / 100);
}

export function formatDate(date: Date) {
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
    }).format(date);
}


export const randomId = () => Math.random().toString(36).substring(2);

export const getI = (arr: { id: string }[], id: string) => arr.findIndex(item => item.id === id);

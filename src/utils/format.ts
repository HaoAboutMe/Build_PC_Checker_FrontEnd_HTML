export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("vi-VN").format(date);
};

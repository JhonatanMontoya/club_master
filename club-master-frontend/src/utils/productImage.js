const LOCAL_PREFIX = '/products/';

export function getProductImageUrl(producto) {
  if (!producto) return `${LOCAL_PREFIX}default.svg`;
  const url = producto.imagen_url;
  if (url?.startsWith(LOCAL_PREFIX)) return url;
  if (producto.id) return `${LOCAL_PREFIX}${producto.id}.jpg`;
  return `${LOCAL_PREFIX}default.svg`;
}

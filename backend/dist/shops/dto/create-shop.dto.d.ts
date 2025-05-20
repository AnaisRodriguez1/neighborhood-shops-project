declare const CATEGORY_LIST: readonly ["comida", "electronica", "ropa", "libros", "hogar", "mascotas", "belleza", "farmacia", "papeleria", "ferreteria", "jardineria", "juguetes", "deportes", "otro"];
type Category = typeof CATEGORY_LIST[number];
export declare class CreateShopDto {
    name: string;
    description?: string;
    deliveryAvailable?: boolean;
    pickupAvailable?: boolean;
    address: string;
    categories?: Category[];
}
export {};

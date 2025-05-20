import { ProductsService } from 'src/products/products.service';
export declare class SeedService {
    private readonly productService;
    private readonly axios;
    constructor(productService: ProductsService);
    executeSeed(): Promise<string>;
}

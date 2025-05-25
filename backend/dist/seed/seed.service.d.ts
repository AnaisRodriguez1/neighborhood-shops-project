import { User } from 'src/auth/entities/user.entity';
import { Model } from 'mongoose';
export declare class SeedService {
    private readonly userModel;
    private readonly axios;
    constructor(userModel: Model<User>);
    executeSeed(): Promise<string>;
}

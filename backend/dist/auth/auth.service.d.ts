import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private readonly userModel;
    private readonly jwtService;
    constructor(userModel: Model<User>, jwtService: JwtService);
    create(createUserDto: CreateUserDto): Promise<{
        email: string;
        id: any;
        name: string;
        token: string;
    } | undefined>;
    login(loginUserDto: LoginUserDto): Promise<{
        id: any;
        name: string;
        role: string[];
        token: string;
    }>;
    checkAuthStatus(user: User): {
        token: string;
    };
    private getJwtToken;
}

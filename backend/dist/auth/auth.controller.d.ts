import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from 'src/auth/entities/user.entity';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    createUser(createUserDto: CreateUserDto): Promise<{
        email: string;
        id: any;
        name: string;
        token: string;
    } | undefined>;
    loginUser(LoginUserDto: LoginUserDto): Promise<{
        id: any;
        name: string;
        role: string[];
        token: string;
    }>;
    checkAuthStatus(user: User): {
        token: string;
    };
    testingPrivateRoute2(user: User, id: string, rawHeaders: string[]): {
        ok: boolean;
        message: string;
        user: User;
        id: string;
        rawHeaders: string[];
    };
}

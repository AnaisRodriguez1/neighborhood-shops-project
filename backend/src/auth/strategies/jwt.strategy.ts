import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "../entities/user.entity";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ConfigService } from "@nestjs/config";
import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy ){    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<User>,
        configService: ConfigService
    ){
        const jwtSecret = configService.get<string>('JWT_SECRET') || configService.get<string>('jwtSecret') || 'fallback-development-secret';
        
        super({
            secretOrKey: jwtSecret,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }

    async validate( payload: JwtPayload ): Promise<User> {

        const { id } = payload;

        // Use findById which searches by _id by default
        const user = await this.userModel.findById(id);

        if (!user)
            throw new UnauthorizedException('Token not valid');

        if (!user.isActive)
            throw new UnauthorizedException('User is inactive, talk with an admin');

        // The user object returned by Mongoose is fine to return here.
        // Passport will attach this user object to the request.
        return user;
    }
}
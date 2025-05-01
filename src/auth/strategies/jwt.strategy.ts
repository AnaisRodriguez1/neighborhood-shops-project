import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "../entities/user.entity";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ConfigService } from "@nestjs/config";
import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy ){

    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<User>,
        configService: ConfigService
){
    super({
        secretOrKey: configService.get<string>('JWT_SECRET') ?? 'dev-secret',
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        
    });
    }

    async validate( payload: JwtPayload ): Promise<User> {

        const {email} = payload;

        const user = await this.userModel.findOne({email});
        if(!user)
            throw new UnauthorizedException('Token not valid');
        if(!user.isActive)
            throw new UnauthorizedException('User is inactived, talk with an admin');

        return user;
    }   
}
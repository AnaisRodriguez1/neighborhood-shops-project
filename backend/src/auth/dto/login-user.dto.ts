import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class LoginUserDto{

    @IsString()
    @IsEmail({},{ message: 'El correo debe tener un formato válido.' })
    email:string;

    @IsString()
    @MinLength(6,{ message: '' })
    @MaxLength(50,{ message: '' })
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'La contraseña debe tener una letra mayúscula, una letra minúscula y un número.'
    })
    password:string;
}
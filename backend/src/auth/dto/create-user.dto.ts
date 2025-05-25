import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {

    @IsString({ message: 'El email debe ser un texto.' })
    @IsEmail({}, { message: 'El email debe tener un formato válido.' })
    email: string;

    @IsString({ message: 'La contraseña debe ser un texto.' })
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
    @MaxLength(50, { message: 'La contraseña no debe superar los 50 caracteres.' })
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
        { message: 'La contraseña debe tener una letra mayúscula, una letra minúscula y un número.' }
    )
    password: string;

    @IsString({ message: 'El nombre debe ser un texto.' })
    @MinLength(1, { message: 'El nombre es obligatorio.' })
    name: string;
}

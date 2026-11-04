import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from "class-validator";

export class RegisterDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @MaxLength(100)
  @Matches(/^(?=.*[A-Z])(?=.*[@$!%*?&])/, {
    message:
      "Password must contain at least one uppercase letter and one special character",
  })
  password: string;
}

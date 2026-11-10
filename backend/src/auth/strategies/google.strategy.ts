
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-google-oauth20";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>("GOOGLE_CLIENT_ID"),
      clientSecret: configService.getOrThrow<string>("GOOGLE_CLIENT_SECRET"),
      callbackURL: configService.getOrThrow<string>("GOOGLE_CALLBACK_URL"),
      scope: ["email", "profile"],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    const email = profile.emails?.[0]?.value;

    if (!email) {
      throw new UnauthorizedException(
        "Google account did not provide an email address",
      );
    }

    const name = profile.name ?? {};

    return {
      email,
      firstName: name.givenName ?? "",
      lastName: name.familyName ?? "",
      profileImage: profile.photos?.[0]?.value ?? null,
      provider: "google",
      providerId: profile.id,
    };
  }
}

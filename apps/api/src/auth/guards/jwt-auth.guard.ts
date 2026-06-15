import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()

//A thin wrapper. AuthGuard('jwt') triggers the strategy named 'jwt' (our JwtStrategy). We wrap it in a named class so it's clean to use and easy to extend later.
export class JwtAuthGuard extends AuthGuard('jwt') {}

//
// Strategy (File 1)	Guard (File 2)
// Answers	HOW do I validate a token?	WHERE/WHEN should validation run?
// Contains	the rules: extract from Bearer header, verify signature, check expiry, load user	the trigger: "apply that validation to this route"
// Runs by itself?	❌ No — it's just a registered definition, sitting idle	✅ Yes — it's what you attach to routes with @UseGuards

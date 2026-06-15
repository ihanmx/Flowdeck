import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

// the shape our JwtStrategy.validate() returns and attaches to request.user
export type AuthUser = { id: string; email: string; name: string | null };

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user: AuthUser }>();
    return request.user;
  },
);

//a NestJS helper that builds a parameter decorator. You give it a function; Nest calls that function every time the decorated parameter is used, and whatever it returns becomes the value of that parameter.

// _data — any argument you pass into the decorator when using it. Example: if you wrote @CurrentUser('email'), then _data would be 'email'. We don't use it (hence the _ prefix = "intentionally unused"), but it lets you make configurable decorators like:

// // could let you do @CurrentUser('email') to grab just the email:
// (data: string, ctx) => {
//   const user = ctx.switchToHttp().getRequest().user;
//   return data ? user[data] : user;
// }
// ctx: ExecutionContext — an abstraction over "the current request context." NestJS can run over HTTP, WebSockets, or microservices — ExecutionContext is a universal handle that works for all of them. Since we're in an HTTP app:

// ctx.switchToHttp() — "treat this as an HTTP context."
// .getRequest() — "give me the underlying request object" (the Express request).
// request.user — the user object that JwtStrategy.validate() returned and Passport attached. We return it → it becomes the @CurrentUser() user parameter.

// The full flow once more:

// JwtStrategy.validate() → returns user → Passport sets request.user
//                                               │
// @CurrentUser() decorator → reads request.user ┘ → injects into your parameter

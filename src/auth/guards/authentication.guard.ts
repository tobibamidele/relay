import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../auth.service.js";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly authService: AuthService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authorizationHeader: string = request.headers["authorization"];
        if (!authorizationHeader) {
            throw new UnauthorizedException('API Key is missing');
        }

        const apiKey = authorizationHeader.split(' ')[1];
        if (!apiKey) {
            throw new UnauthorizedException('API Key is missing');
        }

        try {
            const project = await this.authService.findActiveProjectByAPIKey(apiKey);
            if (!project) {
                throw new UnauthorizedException('Invalid API Key');
            }

            // Attach project to request for downstream controllers
            request.project = project;
            return true;
        } catch (error) {
            // Re-throw NestJS HTTP exceptions or wrap unexpected DB/runtime errors
            if (error instanceof UnauthorizedException) {
                throw error;
            }

            console.error('Auth Guard Error: ', error)
            throw new UnauthorizedException('Authentication failed');
        }
    }
}

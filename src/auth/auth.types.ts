import { Request } from "@nestjs/common"

export interface AuthenticatedRequest extends Request {
  project: {
    id: string,
    name: string,
  }
}

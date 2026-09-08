import { Global, Module } from "@nestjs/common";
import { DRIZZLE, drizzleProvider } from "./database.provider.js";

@Global()
@Module({
  providers: [drizzleProvider],
  exports: [DRIZZLE],
})

export class DatabaseModule {}

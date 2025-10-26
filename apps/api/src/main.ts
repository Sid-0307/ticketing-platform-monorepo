import "dotenv/config";
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Request, Response, NextFunction } from "express";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: "http://localhost:3000",
    credentials: true,
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`API Server running on http://localhost:${port}`);
}

bootstrap();

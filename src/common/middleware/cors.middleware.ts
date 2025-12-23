import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AppConfigService } from '@/config/app-config.service';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  constructor(private readonly configService: AppConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const corsConfig = this.configService.cors;

    if (!corsConfig.enabled) {
      return next();
    }

    // 使用 originalUrl 获取完整的请求路径（包含查询参数）
    // 或者使用 baseUrl + url 的组合
    const fullPath = req.originalUrl.split('?')[0]; // 移除查询参数
    const requestPath = fullPath || req.path;

    if (
      !this.shouldApplyCors(
        requestPath,
        corsConfig.includePaths,
        corsConfig.excludePaths,
      )
    ) {
      return next();
    }

    const origin = this.getOrigin(req, corsConfig.origin);
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    if (corsConfig.credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    if (corsConfig.methods) {
      const methods = Array.isArray(corsConfig.methods)
        ? corsConfig.methods.join(',')
        : corsConfig.methods;
      res.setHeader('Access-Control-Allow-Methods', methods);
    }

    if (corsConfig.allowedHeaders) {
      const headers = Array.isArray(corsConfig.allowedHeaders)
        ? corsConfig.allowedHeaders.join(',')
        : corsConfig.allowedHeaders;
      res.setHeader('Access-Control-Allow-Headers', headers);
    }

    if (corsConfig.exposedHeaders) {
      const headers = Array.isArray(corsConfig.exposedHeaders)
        ? corsConfig.exposedHeaders.join(',')
        : corsConfig.exposedHeaders;
      res.setHeader('Access-Control-Expose-Headers', headers);
    }

    if (corsConfig.maxAge) {
      res.setHeader('Access-Control-Max-Age', String(corsConfig.maxAge));
    }

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    next();
  }

  private shouldApplyCors(
    path: string,
    includePaths?: string[],
    excludePaths?: string[],
  ): boolean {
    if (excludePaths && excludePaths.length > 0) {
      const isExcluded = excludePaths.some((pattern) =>
        this.matchPath(path, pattern),
      );
      if (isExcluded) {
        return false;
      }
    }

    if (includePaths && includePaths.length > 0) {
      return includePaths.some((pattern) => this.matchPath(path, pattern));
    }

    return true;
  }

  private matchPath(path: string, pattern: string): boolean {
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$',
    );
    return regex.test(path);
  }

  private getOrigin(
    req: Request,
    allowedOrigin: string | string[] | RegExp | RegExp[],
  ): string | null {
    const requestOrigin = req.headers.origin;

    if (!requestOrigin) {
      return null;
    }

    if (allowedOrigin === '*') {
      return '*';
    }

    if (typeof allowedOrigin === 'string') {
      return allowedOrigin === requestOrigin ? requestOrigin : null;
    }

    if (Array.isArray(allowedOrigin)) {
      const matched = allowedOrigin.some((origin) => {
        if (typeof origin === 'string') {
          return origin === requestOrigin;
        }
        if (origin instanceof RegExp) {
          return origin.test(requestOrigin);
        }
        return false;
      });
      return matched ? requestOrigin : null;
    }

    if (allowedOrigin instanceof RegExp) {
      return allowedOrigin.test(requestOrigin) ? requestOrigin : null;
    }

    return null;
  }
}

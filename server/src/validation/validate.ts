import type { NextFunction, Request, Response } from "express";
import type { ZodError, ZodSchema } from "zod";

export class HttpError extends Error {
  status: number;
  details?: Array<{ field: string; message: string }>;

  constructor(status: number, message: string, details?: Array<{ field: string; message: string }>) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function validationError(err: ZodError): HttpError {
  return new HttpError(
    400,
    "Validation failed",
    err.issues.map((issue) => ({
      field: issue.path.map(String).join(".") || "body",
      message: issue.message,
    })),
  );
}

export function validate<T>(schema: ZodSchema<T>): (req: Request, _res: Response, next: NextFunction) => void {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(validationError(result.error));
      return;
    }
    req.body = result.data;
    next();
  };
}

export function notFound(what: string): HttpError {
  return new HttpError(404, `${what} not found`);
}

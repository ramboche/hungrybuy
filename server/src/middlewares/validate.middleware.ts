import { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { z } from "zod";

export function validate<T>(
  schema: ZodType<T>,
  property: "body" | "params" | "query" = "body",
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[property]);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: z.treeifyError(result.error),
      });
    }

    req[property] = result.data;
    next();
  };
}

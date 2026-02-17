import type { NextFunction, Request, Response } from "express";

export class AppError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function asyncHandler<
  TReq extends Request = Request,
  TRes extends Response = Response
>(
  fn: (req: TReq, res: TRes, next: NextFunction) => Promise<unknown>
) {
  return (req: TReq, res: TRes, next: NextFunction) => {
    void fn(req, res, next).catch(next);
  };
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ message: "Route not found" });
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const requestId = req.headers["x-request-id"];

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      requestId
    });
  }

  console.error("Unhandled error", { requestId, err });

  return res.status(500).json({
    message: "Internal server error",
    requestId
  });
}

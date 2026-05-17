import { Response } from "express";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function ok<T>(res: Response, data?: T, message?: string): Response {
  return res.status(200).json({ success: true, data, message } as ApiResponse<T>);
}

export function created<T>(res: Response, data?: T, message?: string): Response {
  return res.status(201).json({ success: true, data, message } as ApiResponse<T>);
}

export function noContent(res: Response): Response {
  return res.status(204).send();
}

export function fail(
  res: Response,
  error: string,
  status = 400
): Response {
  return res.status(status).json({ success: false, error } as ApiResponse);
}

export function unauthorized(res: Response, error = "Unauthorized"): Response {
  return res.status(401).json({ success: false, error } as ApiResponse);
}

export function forbidden(res: Response, error = "Forbidden"): Response {
  return res.status(403).json({ success: false, error } as ApiResponse);
}

export function notFound(res: Response, error = "Resource not found"): Response {
  return res.status(404).json({ success: false, error } as ApiResponse);
}

export function serverError(res: Response, error = "Internal server error"): Response {
  return res.status(500).json({ success: false, error } as ApiResponse);
}
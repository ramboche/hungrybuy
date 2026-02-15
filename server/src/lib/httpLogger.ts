import { pinoHttp } from "pino-http";
import { logger } from "./logger";
import { randomUUID } from "crypto";

export const httpLogger = pinoHttp({
  logger,

  genReqId: (req) => {
    const id = req.headers["x-request-id"] || randomUUID();
    return id;
  },

  customLogLevel: (_, res, err) => {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },

  serializers: {
    req(req) {
      return {
        id: req.id,
        method: req.method,
        url: req.url,
        query: req.query,
        params: req.params,
        headers: {
          host: req.headers.host,
          "user-agent": req.headers["user-agent"],
          "x-forwarded-for": req.headers["x-forwarded-for"],
          referer: req.headers.referer,
        },
        origin: {
          port: req.remotePort,
        },
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
  autoLogging: {
    ignore: (req) => {
      if (req.url === "/health" || req.url === "/favicon.ico") return true;
      return false;
    },
  },
});

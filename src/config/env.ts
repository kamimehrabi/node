import dotenv from "dotenv";
dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  mongoUri:
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart_job_portal",
  jwtSecret: process.env.JWT_SECRET || "dev_jwt_secret_change_me",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  redisUrl: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  smtpHost: process.env.SMTP_HOST || "smtp.gmail.com",
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  httpsKeyPath: process.env.HTTPS_KEY_PATH || "",
  httpsCertPath: process.env.HTTPS_CERT_PATH || "",
};

export const isProd = env.nodeEnv === "production";


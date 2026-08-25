import type { Core } from '@strapi/strapi';

/**
 * Plugin configuration
 * 
 * users-permissions: Strapi's built-in auth plugin.
 * - jwtSecret: Used to sign JWT tokens (from env var for security)
 * - jwt.expiresIn: How long a JWT is valid. After this, user must re-login.
 *   7 days is a balance between security and convenience.
 * - register.allowedFields: Extra fields users can send during registration.
 *   By default Strapi v5 blocks ALL extra fields. We allow 'role' so
 *   users can choose their role (student/instructor) when signing up.
 */

const allowedMediaTypes = [
  'image/*',
  'video/*',
  'audio/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.*',
  'text/plain',
  'text/csv',
];

const deniedExecutableTypes = [
  'application/vnd.microsoft.portable-executable',
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-executable',
  'application/x-dosexec',
  'application/x-sh',
  'text/x-shellscript',
  'application/x-mach-binary',
];

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '7d', // JWT expires after 7 days
      },
      register: {
        allowedFields: ['role'], // Allow role selection during registration
      },
    },
  },
  upload: {
    config: {
      security: {
        allowedTypes: allowedMediaTypes,
        deniedTypes: deniedExecutableTypes,
      },
    },
  },
});

export default config;

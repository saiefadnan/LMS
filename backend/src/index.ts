import type { Core } from '@strapi/strapi';
import { registerAuthExtensions } from './utils/auth-extensions';
import { bootstrapRoles } from './utils/role-bootstrapper';
import { seedDemoData } from './utils/demo-seeder';

export default {
  /**
   * Register phase — runs before the app is initialized.
   * Used to extend Strapi's core functionality.
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    registerAuthExtensions(strapi);
  },

  /**
   * Bootstrap phase — runs before the app starts.
   * Used to seed databases, set up roles/permissions, and seed realistic demo data.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await bootstrapRoles(strapi);
    await seedDemoData(strapi);
  },
};

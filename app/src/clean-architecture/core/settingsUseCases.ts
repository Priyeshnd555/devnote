import { createSettingsRepository } from "../adapters/repositories";
import { createAuthUseCases } from "./authUseCases";
import { Settings } from "./entities";

export const createSettingsUseCases = () => {
  const currentUser = createAuthUseCases().getCurrentUser();
  const id = currentUser.user ? currentUser.user.id : "";
  const settingsRepo = createSettingsRepository(id);

  return {
    getSettings: (): Settings => {
      return settingsRepo.get();
    },

    setSpace: (
      space: "Work" | "Personal" | "Project"
    ): { success: boolean; settings: Settings } => {
      const settings = settingsRepo.get();
      settings.space = space;
      settingsRepo.save(settings);
      return { success: true, settings: settings };
    },
  };
};

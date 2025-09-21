import { createSettingsRepository } from "../adapters/repositories";
import { Settings } from "./entities";

export const createSettingsUseCases = () => {
  const settingsRepo = createSettingsRepository();

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
      return { success: true, settings: settingsRepo.get() };
    },
  };
};

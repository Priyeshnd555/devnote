import {
  createUserRepository,
  createAuthRepository,
  createLocalStorageRepository,
} from "../adapters/repositories";
import { UserFactory } from "./entities";

/**
 * --- AUTH USE CASES ---
 * Handles all authentication-related logic.
 */

const userRepo = createUserRepository();
const authRepo = createAuthRepository();

export const createAuthUseCases = () => ({
  // Signs up a new user.
  signUp: (email, password) => {
    if (!email || !password) {
      return { success: false, error: "Email and password are required." };
    }
    const existingUser = userRepo.findByEmail(email);
    if (existingUser) {
      return { success: false, error: "User with this email already exists." };
    }
    const user = UserFactory.create({ email, password });
    userRepo.save(user);
    authRepo.setAuthenticatedUser(user);
    createLocalStorageRepository().merge(user.id);
    return { success: true, user };
  },

  // Signs in an existing user.
  signIn: (email, password) => {
    const user = userRepo.findByEmail(email);
    if (!user || user.password !== password) {
      return { success: false, error: "Invalid email or password." };
    }
    authRepo.setAuthenticatedUser(user);
    createLocalStorageRepository().merge(user.id);
    return { success: true, user };
  },

  // Signs out the current user.
  signOut: () => {
    authRepo.clearAuthenticatedUser();
    return { success: true };
  },

  // Gets the currently authenticated user.
  getCurrentUser: () => {
    const user = authRepo.getAuthenticatedUser();
    return { success: true, user };
  },
});
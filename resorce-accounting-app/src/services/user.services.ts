import users from "../api/users.json";

export const userService = {
  getUsers() {
    return users;
  },

  getUserById(id: string) {
    return users.find(u => u.id === id);
  },

  getUserDevices(userId: string) {
    const user = users.find(u => u.id === userId);
    return user?.devices || [];
  },

  getUserSoftwares(userId: string) {
    const user = users.find(u => u.id === userId);
    return user?.softwares || [];
  },

  getUserHistory(userId: string) {
    const user = users.find(u => u.id === userId);
    return user?.history || [];
  },
};
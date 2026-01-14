import { STUDENT_STATS } from "../data/student";

export const studentService = {
  getStats: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(STUDENT_STATS);
      }, 600);
    });
  },
};

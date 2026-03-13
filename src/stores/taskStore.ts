import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task } from '@/lib/types';

interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  
  // Actions
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  removeTask: (taskId: string) => void;
  setCurrentTask: (task: Task | null) => void;
  getTaskById: (taskId: string) => Task | undefined;
  clearCompletedTasks: () => void;
}

// localStorage key
const STORAGE_KEY = 'tingyi-jia-tasks';

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      currentTask: null,

      addTask: (task) => {
        set((state) => ({
          tasks: [task, ...state.tasks],
          currentTask: task,
        }));
      },

      updateTask: (task) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.task_id === task.task_id ? { ...t, ...task } : t
          ),
          currentTask: state.currentTask?.task_id === task.task_id 
            ? { ...state.currentTask, ...task } 
            : state.currentTask,
        }));
      },

      removeTask: (taskId) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.task_id !== taskId),
          currentTask: state.currentTask?.task_id === taskId 
            ? null 
            : state.currentTask,
        }));
      },

      setCurrentTask: (task) => {
        set({ currentTask: task });
      },

      getTaskById: (taskId) => {
        return get().tasks.find((t) => t.task_id === taskId);
      },

      clearCompletedTasks: () => {
        set((state) => ({
          tasks: state.tasks.filter(
            (t) => t.status !== 'success' && t.status !== 'failed'
          ),
        }));
      },
    }),
    {
      name: STORAGE_KEY,
      // 版本控制 - 用于自动清理旧数据
      version: 1,
    }
  )
);
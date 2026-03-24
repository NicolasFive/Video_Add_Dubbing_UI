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

const stripTaskFiles = (task: Task): Task => {
  const { files: _files, ...rest } = task;
  return rest;
};

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      currentTask: null,

      addTask: (task) => {
        const normalizedTask = stripTaskFiles(task);
        set((state) => ({
          tasks: [normalizedTask, ...state.tasks],
          currentTask: normalizedTask,
        }));
      },

      updateTask: (task) => {
        const normalizedTask = stripTaskFiles(task);
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.task_id === normalizedTask.task_id ? { ...t, ...normalizedTask } : t
          ),
          currentTask: state.currentTask?.task_id === normalizedTask.task_id 
            ? { ...state.currentTask, ...normalizedTask } 
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
        set({ currentTask: task ? stripTaskFiles(task) : null });
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
      version: 2,
      partialize: (state) => ({
        tasks: state.tasks.map(stripTaskFiles),
        currentTask: state.currentTask ? stripTaskFiles(state.currentTask) : null,
      }),
    }
  )
);
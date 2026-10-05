import { useMemo, useState } from 'react'
import { initialTasks, TaskContext } from './taskState.js'

/** Shared in-memory demo state; navigating between List and Detail keeps tasks. */
export default function TaskProvider({ children }) {
  const [tasks, setTasks] = useState(initialTasks)
  const [listView, setListView] = useState({
    activeTaskTab: 'all', filters: { project: '', status: '', priority: '', month: '' },
    page: 1, selectedTaskId: initialTasks[0].id, checkedTaskIds: [initialTasks[0].id],
    detailTab: 'comments', commentDraft: '', showAllFiles: false,
  })
  const value = useMemo(() => ({ tasks, setTasks, listView, setListView }), [tasks, listView])
  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}


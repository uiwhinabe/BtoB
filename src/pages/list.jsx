import { useEffect, useRef, useState } from 'react'
import Header from '../component/Header.jsx'
import { useNavigate } from 'react-router-dom'
import { useTasks, projectOptions } from '../component/taskState.js'
import Sidebar from '../component/sidebar.jsx'
import TaskCreateModal from '../component/TaskCreateModal.jsx'
import profile from '../assets/sidebar-profile.png'
import chevronRight from '../assets/list-chevron-right.svg'
import checkIcon from '../assets/list-check.svg'
import menuPlus from '../assets/list-menu-plus.svg'
import addTaskIcon from '../assets/list-add-task.svg'
import calendarIcon from '../assets/list-calendar.svg'
import commentDots from '../assets/list-comment-dots.svg'
import sendIcon from '../assets/list-send.svg'
import emojiIcon from '../assets/list-emoji.svg'
import photographIcon from '../assets/list-photograph.svg'
import documentIcon from '../assets/list-document.svg'
import fileDot from '../assets/list-file-dot.svg'
import addFileIcon from '../assets/list-add-file.svg'
import detailIcon from '../assets/list-menu-detail.svg'
import editIcon from '../assets/list-menu-edit.svg'
import assigneeIcon from '../assets/list-menu-assignee.svg'
import linkIcon from '../assets/list-menu-link.svg'
import chatIcon from '../assets/list-chat.svg'
import './list.css'

const PAGE_SIZE = 8
const menuItems = [
  { label: '詳細を見る', icon: detailIcon }, { label: 'タスクを編集', icon: editIcon },
  { label: '担当者を変更', icon: assigneeIcon }, { label: 'リンクをコピー', icon: linkIcon },
]
const badgeColors = { '未着手': 'gray', '進行中': 'blue', '完了': 'green', '高': 'red', '中': 'yellow', '低': 'green' }
function Badge({ value }) { return <span className={`task-list-badge task-list-badge--${badgeColors[value] || 'gray'}`}>{value}</span> }
function Checkbox({ checked, onChange, label }) {
  return <label className="task-list-checkbox"><input type="checkbox" checked={checked} onChange={onChange} aria-label={label} /><span>{checked && <img src={checkIcon} alt="" />}</span></label>
}

export default function List() {
  const { tasks, setTasks, listView, setListView } = useTasks()
  const navigate = useNavigate()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const monthOptions = [...new Set(tasks.map(task => task.deadline.slice(0, 7)))].sort()
  const [activeTaskTab, setActiveTaskTab] = useState(listView.activeTaskTab)
  const [filters, setFilters] = useState(listView.filters)
  const [page, setPage] = useState(listView.page)
  const [selectedTaskId, setSelectedTaskId] = useState(listView.selectedTaskId)
  const [checkedTaskIds, setCheckedTaskIds] = useState(listView.checkedTaskIds)
  const [detailTab, setDetailTab] = useState(listView.detailTab)
  const [menuOpen, setMenuOpen] = useState(false)
  const [commentDraft, setCommentDraft] = useState(listView.commentDraft)
  const [showAllFiles, setShowAllFiles] = useState(listView.showAllFiles)
  const menuRef = useRef(null)
  const fileInputRef = useRef(null)
  const commentInputRef = useRef(null)

  const filteredTasks = tasks.filter(task =>
    (activeTaskTab === 'all' || task.isMyTask) &&
    (!filters.project || task.project === filters.project) &&
    (!filters.status || task.status === filters.status) &&
    (!filters.priority || task.priority === filters.priority) &&
    (!filters.month || task.deadline.startsWith(filters.month)))
  const pageCount = Math.max(1, Math.ceil(filteredTasks.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const visibleTasks = filteredTasks.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const selectedTask = visibleTasks.find(task => task.id === selectedTaskId) || visibleTasks[0] || null
  const checked = (id) => checkedTaskIds === null ? id === selectedTask?.id : checkedTaskIds.includes(id)

  useEffect(() => {
    setListView({ activeTaskTab, filters, page, selectedTaskId, checkedTaskIds, detailTab, commentDraft, showAllFiles })
  }, [activeTaskTab, filters, page, selectedTaskId, checkedTaskIds, detailTab, commentDraft, showAllFiles, setListView])

  useEffect(() => {
    if (!menuOpen) return
    function closeOutside(event) { if (!menuRef.current?.contains(event.target)) setMenuOpen(false) }
    function closeEscape(event) { if (event.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeEscape)
    return () => { document.removeEventListener('pointerdown', closeOutside); document.removeEventListener('keydown', closeEscape) }
  }, [menuOpen])

  function resetSelection() {
    setSelectedTaskId(null)
    setCheckedTaskIds(null)
    setCommentDraft('')
    setMenuOpen(false)
    setShowAllFiles(false)
  }
  function createTask(task) {
    setTasks(current => [task, ...current])
    // Reveal the new task even when the previous tab/filter would hide it.
    setActiveTaskTab(task.isMyTask ? activeTaskTab : 'all')
    setFilters({ project: '', status: '', priority: '', month: '' })
    setPage(1)
    selectTask(task)
    setDetailTab('comments')
  }
  function changeTab(tab) { setActiveTaskTab(tab); setPage(1); resetSelection() }
  function changeFilter(key, value) { setFilters(current => ({ ...current, [key]: value })); setPage(1); resetSelection() }
  function changePage(nextPage) { setPage(Math.min(pageCount, Math.max(1, nextPage))); resetSelection() }
  function openTaskMenuItem(label) {
    setMenuOpen(false)
    if (label === '詳細を見る' && selectedTask) navigate(`/detail/${encodeURIComponent(selectedTask.id)}`)
  }
  function selectTask(task) { setSelectedTaskId(task.id); setCheckedTaskIds([task.id]); setCommentDraft(''); setMenuOpen(false); setShowAllFiles(false) }
  function toggleChecked(task) {
    setCheckedTaskIds(current => { const ids = current ?? (selectedTask ? [selectedTask.id] : []); return ids.includes(task.id) ? ids.filter(id => id !== task.id) : [...ids, task.id] })
  }
  function addComment(event) {
    event.preventDefault()
    const text = commentDraft.trim()
    if (!text || !selectedTask) return
    const comment = { id: crypto.randomUUID(), name: '高橋 健太', time: 'たった今', text, profile, crop: 'default' }
    setTasks(current => current.map(task => task.id === selectedTask.id ? { ...task, comments: [...task.comments, comment] } : task))
    setCommentDraft('')
  }
  function addFiles(event) {
    if (!selectedTask) return
    const files = Array.from(event.target.files || []).map(file => ({ id: crypto.randomUUID(), name: file.name, type: file.name.split('.').pop().toUpperCase(), size: file.size >= 1048576 ? `${(file.size / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB` }))
    setTasks(current => current.map(task => task.id === selectedTask.id ? { ...task, files: [...task.files, ...files] } : task))
    setShowAllFiles(true)
    event.target.value = ''
  }

  return <div className={`task-list-page task-list-page--${activeTaskTab}`}>
    <div className="task-list-sidebar"><Sidebar showTaskSubmenu /></div>
    <div className="task-list-main">
      <div className="task-list-header"><Header title="Task" /></div>
      <main className="task-list-content">
        <div className="task-list-workspace">
          <div className="task-list-left">
            <nav className="task-list-breadcrumb" aria-label="Breadcrumb"><span>Task</span><img src={chevronRight} alt="" /><span>List</span><img src={chevronRight} alt="" /><span aria-current="page">{activeTaskTab === 'all' ? 'All Tasks' : 'My Tasks'}</span></nav>
            <div className="task-list-toolbar">
              <div className="task-list-tabs" role="tablist" aria-label="Task lists">
                <button id="all-tasks-tab" role="tab" aria-controls="task-table-panel" aria-selected={activeTaskTab === 'all'} onClick={() => changeTab('all')}>All Tasks <span>({tasks.length})</span></button>
                <button id="my-tasks-tab" role="tab" aria-controls="task-table-panel" aria-selected={activeTaskTab === 'my'} onClick={() => changeTab('my')}>My Tasks <span>({tasks.filter(task => task.isMyTask).length})</span></button>
              </div>
              <div className="task-list-filters">
                {[{ key: 'project', label: 'プロジェクト', options: projectOptions }, { key: 'status', label: 'ステータス', options: ['未着手', '進行中', '完了'] }, { key: 'priority', label: '優先度', options: ['高', '中', '低'] }, { key: 'month', label: '月', options: monthOptions }].map(filter => <label key={filter.key} className={`task-list-filter task-list-filter--${filter.key}`}>
                  <span>{filter.label}</span><select aria-label={filter.label} value={filters[filter.key]} onChange={event => changeFilter(filter.key, event.target.value)}>
                    <option value="">{filter.key === 'month' ? 'すべての月' : 'すべて'}</option>
                    {filter.options.map(option => <option value={option} key={option}>{filter.key === 'month' ? `${option.slice(0,4)}年${Number(option.slice(5))}月` : option}</option>)}
                  </select>
                </label>)}
                <button type="button" className="task-list-add-task" onClick={() => setIsCreateModalOpen(true)}><img src={addTaskIcon} alt="" />タスクを追加</button>
              </div>
            </div>
            <div id="task-table-panel" role="tabpanel" aria-labelledby={`${activeTaskTab === 'all' ? 'all' : 'my'}-tasks-tab`} className="task-list-table-panel">
              <div className="task-list-table-scroll"><table className="task-list-table"><colgroup><col className="task-list-col-name" /><col className="task-list-col-project" /><col className="task-list-col-status" /><col className="task-list-col-priority" /><col className="task-list-col-deadline" /></colgroup>
                <thead><tr>{['タスク名', 'プロジェクト', 'ステータス', '優先度', '期限'].map(heading => <th scope="col" key={heading}>{heading}</th>)}</tr></thead>
                <tbody>{visibleTasks.map(task => <tr key={task.id} className={selectedTask?.id === task.id ? 'task-list-row--selected' : ''} onClick={() => selectTask(task)}>
                  <td><div className="task-list-name-cell"><span onClick={event => event.stopPropagation()}><Checkbox checked={checked(task.id)} onChange={() => toggleChecked(task)} label={`${task.name}を選択`} /></span><button type="button" aria-pressed={selectedTask?.id === task.id} onClick={event => { event.stopPropagation(); selectTask(task) }}>{task.name}</button></div></td>
                  <td>{task.project}</td><td><Badge value={task.status} /></td><td><Badge value={task.priority} /></td><td><div className="task-list-deadline-cell"><span>{task.deadline}</span>{task.overdue && <span>期限超過</span>}</div></td>
                </tr>)}</tbody>
              </table></div>
              {visibleTasks.length === 0 && <p className="task-list-empty" role="status">条件に一致するタスクはありません。</p>}
            </div>
            <nav className="task-list-pagination" aria-label="ページ切り替え">
              <button onClick={() => changePage(currentPage + 1)} disabled={currentPage >= pageCount}>Next</button>
              {Array.from({ length: pageCount }, (_, index) => pageCount - index).map(number => <button key={number} onClick={() => changePage(number)} aria-current={currentPage === number ? 'page' : undefined} aria-label={`ページ ${number}`}>{number}</button>)}
              <button onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
            </nav>
          </div>
          <aside className="task-list-detail" aria-label="Quick Detail">
            {selectedTask ? <>
              <div className="task-list-detail-menu" ref={menuRef}>
                {detailTab === 'files' && <button type="button" className="task-list-edit" onClick={() => setMenuOpen(true)}>編集</button>}
                <button type="button" className="task-list-menu-toggle" aria-label="タスクメニュー" aria-haspopup="menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(open => !open)}><img src={menuPlus} alt="" /></button>
                {menuOpen && <div className="task-list-dropdown" role="menu">{menuItems.map(item => <button key={item.label} role="menuitem" onClick={() => openTaskMenuItem(item.label)}>{item.label}<img src={item.icon} alt="" /></button>)}</div>}
              </div>
              <div className="task-list-detail-title"><div><p>{selectedTask.project}</p><h1>{selectedTask.name}</h1></div><Badge value={selectedTask.status} /></div>
              <div className="task-list-assignee"><div className="task-list-avatar"><img src={selectedTask.profile} alt={`${selectedTask.assignee} プロフィール`} /></div><div><p>担当者</p><strong>{selectedTask.assignee}</strong><p>{selectedTask.role}</p></div></div>
              <dl className="task-list-metadata"><div><dt>優先度</dt><dd><Badge value={selectedTask.priority} /></dd></div><div><dt>リスク</dt><dd><Badge value={selectedTask.risk} /></dd></div><div><dt>期限</dt><dd className="task-list-detail-deadline"><img src={calendarIcon} alt="" />{selectedTask.deadline}</dd></div></dl>
              <section className="task-list-description"><h2>概要</h2><p>{selectedTask.description}</p></section>
              <section className="task-list-detail-progress"><h2>進捗率</h2><div><div className="task-list-progress-track" role="progressbar" aria-label="進捗率" aria-valuenow={selectedTask.progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${selectedTask.progress}%` }} /></div><strong>{selectedTask.progress}%</strong></div></section>
              <div className="task-list-detail-tabs" role="tablist" aria-label="Quick Detail tabs">
                <button id="task-comments-tab" role="tab" aria-controls="task-detail-tabpanel" aria-selected={detailTab === 'comments'} onClick={() => setDetailTab('comments')}>コメント <span>({selectedTask.comments.length})</span></button>
                <button id="task-files-tab" role="tab" aria-controls="task-detail-tabpanel" aria-selected={detailTab === 'files'} onClick={() => setDetailTab('files')}>ファイル <span>({selectedTask.files.length})</span></button>
              </div>
              <div id="task-detail-tabpanel" role="tabpanel" aria-labelledby={`task-${detailTab}-tab`} className={`task-list-detail-body task-list-detail-body--${detailTab}`}>
                {detailTab === 'comments' ? <>
                  <div className="task-list-comments">{selectedTask.comments.map(comment => <article key={comment.id} className="task-list-comment"><div className={`task-list-comment-avatar task-list-comment-avatar--${comment.crop}`}><img src={comment.profile} alt="" /></div><div><header><span>{comment.name}</span><time>{comment.time}</time><img src={commentDots} alt="" /></header><p>{comment.text}</p></div></article>)}</div>
                  <form className="task-list-comment-form" onSubmit={addComment}><button type="submit" aria-label="コメントを送信" disabled={!commentDraft.trim()}><img src={sendIcon} alt="" /></button><input ref={commentInputRef} aria-label="コメントを入力" placeholder="コメントを入力..." value={commentDraft} onChange={event => setCommentDraft(event.target.value)} /><button type="button" aria-label="絵文字を追加" onClick={() => { setCommentDraft(current => current + '😊'); commentInputRef.current?.focus() }}><img src={emojiIcon} alt="" /></button><button type="button" aria-label="ファイルを添付" onClick={() => { setDetailTab('files'); fileInputRef.current?.click() }}><img src={photographIcon} alt="" /></button></form>
                </> : <div className="task-list-files">{(showAllFiles ? selectedTask.files : selectedTask.files.slice(0, 2)).map(file => <article key={file.id} className="task-list-file"><img src={documentIcon} alt="" /><div><h3>{file.name}</h3><p>{file.type}・{file.size}</p></div><span aria-hidden="true" className="task-list-file-dots">{[0,1,2].map(dot => <img src={fileDot} alt="" key={dot} />)}</span></article>)}
                  {!showAllFiles && selectedTask.files.length > 2 && <button type="button" className="task-list-more-files" onClick={() => setShowAllFiles(true)}>残り{selectedTask.files.length - 2}件を表示</button>}
                  <button type="button" className="task-list-add-file" onClick={() => fileInputRef.current?.click()}><img src={addFileIcon} alt="" />ファイルを追加</button>
                </div>}
              </div>
              <input ref={fileInputRef} className="task-list-file-input" type="file" multiple onChange={addFiles} aria-label="追加するファイル" />
            </> : <p className="task-list-empty">タスクを選択すると詳細が表示されます。</p>}
          </aside>
        </div>
      </main>
      <div className="task-list-chat" aria-label="AIチャット"><img src={chatIcon} alt="" /></div>
    </div>
    <TaskCreateModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onCreate={createTask} projects={projectOptions} />
  </div>
}

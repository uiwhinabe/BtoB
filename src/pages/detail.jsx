import { useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Header from '../component/Header.jsx'
import Sidebar from '../component/sidebar.jsx'
import { defaultTaskId, useTasks } from '../component/taskState.js'
import chevron from '../assets/list-chevron-right.svg'
import calendarIcon from '../assets/list-calendar.svg'
import checkIcon from '../assets/list-check.svg'
import dots from '../assets/list-comment-dots.svg'
import documentIcon from '../assets/list-document.svg'
import addFileIcon from '../assets/list-add-file.svg'
import editIcon from '../assets/list-menu-edit.svg'
import './detail.css'

const badgeColors = { '未着手': 'gray', '進行中': 'blue', '完了': 'green', '低': 'green', '中': 'yellow', '高': 'red' }
function Badge({ value }) { return <span className={`task-detail-badge task-detail-badge--${badgeColors[value] || 'gray'}`}>{value}</span> }
function Progress({ value, label }) {
  return <div className="task-detail-progress"><div role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} className="task-detail-progress__track"><span style={{ width: `${value}%` }} /></div><strong>{value}%</strong></div>
}
function deadlineDistance(deadline) {
  const [year, month, day] = deadline.split('/').map(Number)
  const today = new Date()
  const days = Math.round((Date.UTC(year, month - 1, day) - Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) / 86400000)
  return days < 0 ? `${Math.abs(days)}日超過` : days === 0 ? '今日まで' : `残り${days}日`
}

export default function Detail() {
  const { id = defaultTaskId } = useParams()
  const { tasks } = useTasks()
  const task = tasks.find(item => item.id === id)
  return <div className="task-detail-page">
    <div className="task-detail-sidebar"><Sidebar showTaskSubmenu /></div>
    <div className="task-detail-main">
      <div className="task-detail-header"><Header title="Task" /></div>
      <main className="task-detail-scroll"><div className="task-detail-content">
        <nav className="task-detail-breadcrumb" aria-label="Breadcrumb"><Link to="/list">Task</Link><img src={chevron} alt="" /><span aria-current="page">Detail</span></nav>
        <Link className="task-detail-back" to="/list"><img src={chevron} alt="" />リストに戻る</Link>
        {task ? <TaskContent key={task.id} task={task} /> : <section className="task-detail-card task-detail-not-found"><h1>タスクが見つかりません</h1><p>タスク一覧からタスクを選択してください。</p><Link to="/list">リストに戻る</Link></section>}
      </div></main>
    </div>
  </div>
}

function TaskContent({ task }) {
  const { setTasks } = useTasks()
  const [bottomTab, setBottomTab] = useState('files')
  const [showAllFiles, setShowAllFiles] = useState(false)
  const [updateMessage, setUpdateMessage] = useState('')
  const [addMessage, setAddMessage] = useState('')
  const fileInputRef = useRef(null)
  const subtasks = task.subtasks || []
  const completedCount = subtasks.filter(subtask => subtask.completed).length
  const subtaskProgress = subtasks.length ? Math.round(completedCount / subtasks.length * 100) : 0
  const progress = subtasks.length ? subtaskProgress : task.progress
  const memos = task.memos || (task.memo ? [{ id: `${task.id}-memo`, text: task.memo }] : [])

  function changeTask(values) { setTasks(current => current.map(item => item.id === task.id ? { ...item, ...values } : item)) }
  function toggleSubtask(subtaskId) {
    setTasks(current => current.map(item => {
      if (item.id !== task.id) return item
      const nextSubtasks = item.subtasks.map(subtask => subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask)
      return { ...item, subtasks: nextSubtasks, progress: Math.round(nextSubtasks.filter(subtask => subtask.completed).length / nextSubtasks.length * 100) }
    }))
    setUpdateMessage('')
  }
  function addFiles(event) {
    const additions = Array.from(event.target.files || []).map(file => ({ id: crypto.randomUUID(), name: file.name, type: file.name.includes('.') ? file.name.split('.').pop().toUpperCase() : 'FILE', size: file.size >= 1048576 ? `${(file.size / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB` }))
    setTasks(current => current.map(item => item.id === task.id ? { ...item, files: [...item.files, ...additions] } : item))
    setShowAllFiles(true)
    event.target.value = ''
  }

  return <>
    <div className="task-detail-title"><p>{task.project}</p><div><h1>{task.name}</h1><Badge value={task.status} /></div></div>
    <div className="task-detail-grid">
      <section className="task-detail-card task-detail-overview" aria-label="Task details">
        <h2>概要</h2><p className="task-detail-description">{task.description}</p>
        {(task.details || []).length > 0 && <div className="task-detail-requirements"><h2>詳細</h2><ul>{task.details.map(text => <li key={text}>{text}</li>)}</ul></div>}
        <section className="task-detail-subtasks" aria-labelledby="task-detail-subtasks-title">
          <div className="task-detail-section-heading"><h2 id="task-detail-subtasks-title">サブタスク <span>{completedCount} / {subtasks.length}</span></h2><button className="task-detail-update" type="button" disabled={!subtasks.length} onClick={() => { changeTask({ progress }); setUpdateMessage('更新しました。') }}>更新する</button></div>
          <Progress value={subtaskProgress} label="サブタスク進捗率" />
          <ul className="task-detail-subtask-list">{subtasks.map(subtask => <li key={subtask.id}>
            <label className="task-detail-subtask-name"><span className="task-detail-checkbox"><input type="checkbox" checked={subtask.completed} onChange={() => toggleSubtask(subtask.id)} aria-label={`${subtask.name}を完了`} /><span>{subtask.completed && <img src={checkIcon} alt="" />}</span></span><span>{subtask.name}</span></label>
            <Badge value={subtask.completed ? '完了' : subtask.pendingStatus} /><time dateTime={subtask.deadline.replaceAll('/', '-')}>{subtask.deadline}</time><span className="task-detail-dots" aria-hidden="true"><img src={dots} alt="" /></span>
          </li>)}</ul>
          <div className="task-detail-subtask-footer"><button className="task-detail-primary" type="button" onClick={() => { setUpdateMessage(''); setAddMessage('サブタスクの追加機能は準備中です。') }}><img src={addFileIcon} alt="" />サブタスクを追加</button><span className="task-detail-feedback" role="status">{updateMessage || addMessage}</span></div>
        </section>
      </section>
      <section className="task-detail-card task-detail-information" aria-labelledby="task-detail-information-title">
        <div className="task-detail-section-heading"><h2 id="task-detail-information-title">タスク情報</h2><button className="task-detail-primary task-detail-edit" type="button" disabled><img src={editIcon} alt="" />編集</button></div>
        <dl>
          <div className="task-detail-information-row"><dt>プロジェクト</dt><dd>{task.project}</dd></div>
          <div className="task-detail-information-row"><dt>担当者</dt><dd><div className="task-detail-assignee"><div className="task-detail-avatar"><img src={task.profile} alt={`${task.assignee} プロフィール`} /></div><div><strong>{task.assignee}</strong><p>{task.role}</p></div></div><button type="button" className="task-detail-change-assignee" disabled>担当者を変更</button></dd></div>
          <div className="task-detail-information-row"><dt>期限</dt><dd className="task-detail-deadline"><time dateTime={task.deadline.replaceAll('/', '-')}><img src={calendarIcon} alt="" />{task.deadline}</time><span>{deadlineDistance(task.deadline)}</span></dd></div>
          <div className="task-detail-information-row"><dt><label htmlFor="task-detail-status">ステータス</label></dt><dd><select id="task-detail-status" className={`task-detail-select task-detail-select--${badgeColors[task.status]}`} value={task.status} onChange={event => changeTask({ status: event.target.value })}>{['未着手', '進行中', '完了'].map(status => <option key={status}>{status}</option>)}</select></dd></div>
          <div className="task-detail-information-row"><dt><label htmlFor="task-detail-priority">優先度</label></dt><dd><select id="task-detail-priority" className={`task-detail-select task-detail-select--${badgeColors[task.priority]}`} value={task.priority} onChange={event => changeTask({ priority: event.target.value })}>{['低', '中', '高'].map(priority => <option key={priority}>{priority}</option>)}</select></dd></div>
          <div className="task-detail-information-row task-detail-information-row--progress"><dt>進捗率</dt><dd><Progress value={progress} label="タスク進捗率" /></dd></div>
        </dl>
      </section>
      <section className="task-detail-card task-detail-comments" aria-labelledby="task-detail-comments-title"><h2 id="task-detail-comments-title">コメント <span>({task.comments.length})</span></h2><div className="task-detail-comment-list">{task.comments.map(comment => <article key={comment.id} className="task-detail-comment"><div className={`task-detail-comment-avatar task-detail-comment-avatar--${comment.crop}`}><img src={comment.profile} alt="" /></div><div className="task-detail-comment-content"><header><strong>{comment.name}</strong><time>{comment.time}</time><span className="task-detail-dots" aria-hidden="true"><img src={dots} alt="" /></span></header><p>{comment.text}</p></div></article>)}</div></section>
      <section className="task-detail-card task-detail-files" aria-label="Files and memo">
        <div className="task-detail-files-heading"><div role="tablist" aria-label="ファイルとメモ" className="task-detail-bottom-tabs"><button id="task-detail-files-tab" type="button" role="tab" aria-controls="task-detail-bottom-panel" aria-selected={bottomTab === 'files'} onClick={() => setBottomTab('files')}>ファイル ({task.files.length})</button><button id="task-detail-memo-tab" type="button" role="tab" aria-controls="task-detail-bottom-panel" aria-selected={bottomTab === 'memo'} onClick={() => setBottomTab('memo')}>メモ ({memos.length})</button></div>{bottomTab === 'files' && <button type="button" className="task-detail-primary task-detail-add-file" onClick={() => fileInputRef.current?.click()}><img src={addFileIcon} alt="" />ファイルを追加</button>}</div>
        <div id="task-detail-bottom-panel" role="tabpanel" aria-labelledby={`task-detail-${bottomTab}-tab`} className="task-detail-bottom-panel">
          {bottomTab === 'files' ? <>{(showAllFiles ? task.files : task.files.slice(0, 2)).map(file => <article key={file.id} className="task-detail-file"><img src={documentIcon} alt="" /><div><h3>{file.name}</h3><p>{file.type}・{file.size}</p></div><span className="task-detail-dots" aria-hidden="true"><img src={dots} alt="" /></span></article>)}{!showAllFiles && task.files.length > 2 && <button type="button" className="task-detail-more-files" onClick={() => setShowAllFiles(true)}>残り{task.files.length - 2}件を表示</button>}</> : memos.filter(memo => memo.text).map(memo => <p key={memo.id} className="task-detail-memo">{memo.text}</p>)}
        </div>
        <input ref={fileInputRef} type="file" hidden multiple aria-label="詳細にファイルを追加" onChange={addFiles} />
      </section>
    </div>
  </>
}

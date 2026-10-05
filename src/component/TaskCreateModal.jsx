import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import profile from '../assets/sidebar-profile.png'
import addFileIcon from '../assets/list-add-file.svg'
import checkIcon from '../assets/list-check.svg'
import chevron from '../assets/list-chevron-right.svg'
import calendarIcon from '../assets/list-calendar.svg'
import logoBack from '../assets/login-logo-back.svg'
import logoMiddle from '../assets/login-logo-middle.svg'
import logoFront from '../assets/login-logo-front.svg'
import './TaskCreateModal.css'

const emptyForm = { name: '', project: '', assignee: '', status: '', priority: '', deadline: '', description: '', memo: '', files: [] }
const defaultProjects = ['デザインシステム刷新', '管理システム構築', 'データプラットフォーム構築', 'ショッピングアプリリニューアル', '社内業務ツール改善']
const assignees = ['高橋 健太', '松本 健', '山田 大輔', '佐藤 優希', '伊藤 春香']
const requiredFields = ['name', 'project', 'assignee', 'status', 'priority', 'deadline', 'description']
const dateValue = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

// Conditional mounting resets both stages and all input values on every opening.
export default function TaskCreateModal({ isOpen, onClose, onCreate, projects = defaultProjects, currentUser = '高橋 健太' }) {
  return isOpen ? createPortal(<CreateDialog onClose={onClose} onCreate={onCreate} projects={projects} currentUser={currentUser} />, document.body) : null
}

function CreateDialog({ onClose, onCreate, projects, currentUser }) {
  const [formData, setFormData] = useState(emptyForm)
  const [modalStep, setModalStep] = useState('form')
  const [errors, setErrors] = useState({})
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [createError, setCreateError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const dialogRef = useRef(null)
  const fileRef = useRef(null)
  const submittedRef = useRef(false)
  const id = useId()
  const titleId = `${id}-title`

  useEffect(() => {
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    const root = document.getElementById('root')
    const previousInert = root?.inert
    document.body.style.overflow = 'hidden'
    if (root) root.inert = true
    dialogRef.current?.querySelector('input')?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      if (root) root.inert = previousInert
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus()
    }
  }, [])

  function update(key, value) {
    setFormData(current => ({ ...current, [key]: value }))
    setErrors(current => ({ ...current, [key]: '' }))
  }
  function attachFiles(files) {
    const additions = Array.from(files || []).map(file => ({ id: crypto.randomUUID(), name: file.name, type: file.name.includes('.') ? file.name.split('.').pop().toUpperCase() : 'FILE', size: file.size >= 1048576 ? `${(file.size / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB` }))
    setFormData(current => ({ ...current, files: [...current.files, ...additions] }))
  }
  async function handleSubmit(event) {
    event.preventDefault()
    if (submittedRef.current) return
    const nextErrors = Object.fromEntries(requiredFields.filter(key => !formData[key].trim()).map(key => [key, '必須項目を入力してください。']))
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      dialogRef.current.querySelector(`[name="${Object.keys(nextErrors)[0]}"]`)?.focus()
      return
    }
    submittedRef.current = true
    setSubmitting(true)
    setCreateError('')
    const today = dateValue(new Date())
    const newTask = {
      id: crypto.randomUUID(), name: formData.name.trim(), project: formData.project,
      assignee: formData.assignee, role: 'フロントエンドエンジニア', profile,
      status: formData.status, priority: formData.priority,
      // The inspected form has no risk input; new tasks start with low risk.
      risk: '低', deadline: formData.deadline.replaceAll('-', '/'),
      overdue: formData.deadline < today && formData.status !== '完了',
      description: formData.description.trim(), memo: formData.memo.trim(),
      progress: formData.status === '完了' ? 100 : 0,
      comments: [], files: formData.files, isMyTask: formData.assignee === currentUser,
    }
    try {
      await onCreate(newTask)
      setModalStep('success')
      dialogRef.current?.focus()
    } catch {
      submittedRef.current = false
      setCreateError('タスクを作成できませんでした。もう一度お試しください。')
    } finally { setSubmitting(false) }
  }
  function trapFocus(event) {
    if (event.key !== 'Tab') return
    const controls = Array.from(dialogRef.current.querySelectorAll('button:not(:disabled), input, select, textarea, [tabindex="0"]')).filter(control => control.getClientRects().length)
    const first = controls[0], last = controls.at(-1)
    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) { event.preventDefault(); last?.focus() }
    else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialogRef.current)) { event.preventDefault(); first?.focus() }
  }
  function field(key, label, control, optional = false) {
    return <div className={`task-create-modal__field task-create-modal__field--${key}`}>
      <label htmlFor={`${id}-${key}`}>{label}{optional ? <small>（任意）</small> : <span aria-hidden="true">*</span>}</label>
      {control({ id: `${id}-${key}`, name: key, value: formData[key], onChange: event => update(key, event.target.value), required: !optional, 'aria-invalid': Boolean(errors[key]), 'aria-describedby': errors[key] ? `${id}-${key}-error` : undefined })}
      {errors[key] && <p id={`${id}-${key}-error`} className="task-create-modal__error" role="alert">{errors[key]}</p>}
    </div>
  }
  function select(key, label, options) {
    return field(key, label, props => <select {...props}><option value="">選択してください</option>{options.map(value => <option key={value} value={value}>{value}</option>)}</select>)
  }
  const monthYear = calendarMonth.getFullYear(), monthIndex = calendarMonth.getMonth()
  const firstWeekday = new Date(monthYear, monthIndex, 1).getDay()
  const calendarDays = Array.from({ length: 42 }, (_, index) => new Date(monthYear, monthIndex, index - firstWeekday + 1))

  return <div className="task-create-modal-overlay">
    <section ref={dialogRef} className={`task-create-modal task-create-modal--${modalStep}`} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} onKeyDown={trapFocus}>
      <header className="task-create-modal__brand"><div><span className="task-create-modal__logo">{[logoBack, logoMiddle, logoFront].map(src => <img src={src} alt="" key={src} />)}</span><strong>Flowbite</strong></div><button type="button" className="task-create-modal__close" aria-label="モーダルを閉じる" onClick={onClose} disabled={submitting}><span /></button></header>
      {modalStep === 'form' ? <form className="task-create-modal__form" onSubmit={handleSubmit} noValidate>
        <div className="task-create-modal__header"><h2 id={titleId}>タスクを作成</h2><div><button type="button" onClick={onClose} disabled={submitting}>キャンセル</button><button type="submit" className="task-create-modal__primary" disabled={submitting}>{submitting ? '作成中...' : 'タスクを作成'}</button></div></div>
        <div className="task-create-modal__body">
          <div className="task-create-modal__left">
            {field('name', 'タスク名', props => <input {...props} placeholder="タスク名を入力してください" />)}
            {select('project', 'プロジェクト名', projects)}
            <div className="task-create-modal__select-row">{select('priority', '優先度', ['高', '中', '低'])}{select('status', 'ステータス', ['未着手', '進行中', '完了'])}</div>
            {field('description', 'タスク概要', props => <textarea {...props} placeholder="タスク概要を入力してください。" />)}
            <div className="task-create-modal__attachments"><h3>添付ファイル</h3><button type="button" className="task-create-modal__dropzone" onClick={() => fileRef.current?.click()} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); attachFiles(event.dataTransfer.files) }}><span><img src={addFileIcon} alt="" />ファイルを追加</span><small>ドラッグ＆ドロップまたはクリックしてファイルを選択</small></button><input ref={fileRef} type="file" multiple hidden aria-label="添付ファイルを選択" onChange={event => { attachFiles(event.target.files); event.target.value = '' }} />{formData.files.length > 0 && <ul>{formData.files.map(file => <li key={file.id}><span>{file.name} · {file.size}</span><button type="button" aria-label={`${file.name}を削除`} onClick={() => update('files', formData.files.filter(item => item.id !== file.id))}>削除</button></li>)}</ul>}</div>
          </div>
          <div className="task-create-modal__right">
            {select('assignee', '担当者', [...new Set([currentUser, ...assignees])])}
            <div className="task-create-modal__date-area">{field('deadline', '期限', props => <div className="task-create-modal__date-control"><input {...props} type="date" /><button type="button" aria-label="カレンダーを開く" aria-expanded={calendarOpen} onClick={() => setCalendarOpen(open => !open)}><img src={calendarIcon} alt="" /></button></div>)}
              {calendarOpen && <div className="task-create-modal__calendar"><header><button type="button" aria-label="前の月" onClick={() => setCalendarMonth(new Date(monthYear, monthIndex - 1, 1))}><img src={chevron} alt="" /></button><strong>{monthYear}年{monthIndex + 1}月</strong><button type="button" aria-label="次の月" onClick={() => setCalendarMonth(new Date(monthYear, monthIndex + 1, 1))}><img src={chevron} alt="" /></button></header><div className="task-create-modal__calendar-grid">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <span key={day}>{day}</span>)}{calendarDays.map(date => <button type="button" key={dateValue(date)} aria-label={dateValue(date)} aria-pressed={formData.deadline === dateValue(date)} className={date.getMonth() !== monthIndex ? 'task-create-modal__other-month' : ''} onClick={() => update('deadline', dateValue(date))}>{date.getDate()}</button>)}</div><footer><button type="button" onClick={() => { const today = new Date(); update('deadline', dateValue(today)); setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1)) }}>今日</button><button type="button" onClick={() => setCalendarOpen(false)}>確認</button></footer></div>}
            </div>
            {field('memo', 'メモ', props => <textarea {...props} placeholder="メモを入力してください。" />, true)}
          </div>
        </div>
        {createError && <p className="task-create-modal__error" role="alert">{createError}</p>}
      </form> : <div className="task-create-modal__success"><span className="task-create-modal__success-icon"><img src={checkIcon} alt="" /></span><h2 id={titleId}>タスクを作成しました</h2><p>作成したタスクをタスク一覧に追加しました。</p><button type="button" className="task-create-modal__primary" onClick={onClose}>確認</button></div>}
    </section>
  </div>
}

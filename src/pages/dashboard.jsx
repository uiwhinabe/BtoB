import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../component/Header.jsx'
import Sidebar from '../component/sidebar.jsx'
import folderIcon from '../assets/dashboard-folder.svg'
import alertIcon from '../assets/dashboard-alert.svg'
import cautionIcon from '../assets/dashboard-caution.svg'
import clockIcon from '../assets/dashboard-clock.svg'
import arrowIcon from '../assets/dashboard-arrow.svg'
import checkIcon from '../assets/dashboard-check.svg'
import blueDot from '../assets/dashboard-status-blue.svg'
import grayDot from '../assets/dashboard-dot-gray.svg'
import redDot from '../assets/dashboard-dot-red.svg'
import yellowDot from '../assets/dashboard-dot-yellow.svg'
import greenDot from '../assets/dashboard-dot-green.svg'
import './dashboard.css'

const summaryCards = [
  { label: 'プロジェクト', count: 5, icon: folderIcon, color: 'project' },
  { label: '期限超過', count: 4, icon: alertIcon, color: 'overdue' },
  { label: '優先度が高いタスク', count: 3, icon: cautionIcon, color: 'priority' },
  { label: '今週の期限', count: 7, icon: clockIcon, color: 'week' },
]
const projectProgress = [
  { name: 'ショッピングアプリリニューアル', percent: 80 },
  { name: '管理システム構築', percent: 60 },
  { name: '社内業務ツール改善', percent: 40 },
  { name: 'データプラットフォーム改善', percent: 30 },
  { name: 'デザインシステム刷新', percent: 20 },
]
const todayTasks = ['デイリースタンドアップ', 'プロジェクト進捗レビュー', 'リソース状況の確認・調整', '次スプリントの計画']
const attentionTasks = [
  { name: 'ログインエラー修正', project: '管理システム構築', status: '進行中', priority: '高', due: '2026/09/28', overdue: true },
  { name: '権限設定改善', project: '社内業務ツール改善', status: '進行中', priority: '中', due: '2026/10/02' },
  { name: 'データ検証', project: 'データプラットフォーム構築', status: '進行中', priority: '中', due: '2026/09/28', overdue: true },
  { name: '開発ドキュメント作成', project: 'デザインシステム刷新', status: '未着手', priority: '低', due: '2026/09/26', overdue: true },
  { name: '簡単決済API開発', project: 'ショッピングアプリリニューアル', status: '進行中', priority: '高', due: '2026/10/02' },
  { name: 'サーバー移行', project: '社内業務ツール改善', status: '進行中', priority: '高', due: '2026/10/05' },
  { name: 'Form Component作成', project: 'デザインシステム刷新', status: '進行中', priority: '高', due: '2026/10/04' },
]
const upcomingDeadlines = [
  { date: '09/30(水)', task: '商品検索機能改善', project: 'ショッピングアプリリニューアル', remaining: '明日' },
  { date: '10/01(木)', task: '注文管理ページ実装', project: '管理システム構築', remaining: '2日後' },
  { date: '10/01(木)', task: 'Button Component作成', project: 'デザインシステム刷新', remaining: '2日後' },
  { date: '10/02(金)', task: '決済API開発', project: 'ショッピングアプリリニューアル', remaining: '3日後' },
  { date: '10/03(土)', task: '分析ダッシュボード実装', project: 'データプラットフォーム構築', remaining: '4日後' },
]
const teamWorkload = [
  { name: 'Backend', initials: 'BE', percent: 90, color: '#ff2222' },
  { name: 'Frontend', initials: 'FE', percent: 78, color: '#1c64f2' },
  { name: 'QA', initials: 'QA', percent: 61, color: '#1c64f2' },
  { name: 'Design', initials: 'DS', percent: 54, color: '#56ff22' },
]
const priorities = { '高': { color: 'red', icon: redDot }, '中': { color: 'yellow', icon: yellowDot }, '低': { color: 'green', icon: greenDot } }

function SectionHeading({ title, linkText, to }) {
  return <div className="dashboard-section-heading">
    <h2>{title}</h2>
    <Link to={to} className="dashboard-link">{linkText}<img src={arrowIcon} alt="" /></Link>
  </div>
}

function ProgressBar({ name, percent, color = '#1c64f2' }) {
  return <div className="dashboard-progress">
    <div className="dashboard-progress__track" role="progressbar" aria-label={name} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
      <div className="dashboard-progress__fill" style={{ width: `${percent}%`, backgroundColor: color }} />
    </div>
    <span>{percent}%</span>
  </div>
}

export default function Dashboard() {
  const [checkedTasks, setCheckedTasks] = useState([true, false, false, false])
  return (
    <div className="dashboard-page">
      <div className="dashboard-sidebar"><Sidebar /></div>
      <div className="dashboard-main">
        <div className="dashboard-header"><Header /></div>
        <main className="dashboard-scroll" aria-label="Dashboard content">
          <div className="dashboard-content">
            <h1 className="dashboard-greeting">Hi, 高橋 健太</h1>
            <section className="dashboard-summary" aria-label="概要">
              {summaryCards.map((card) => <article key={card.label} className="dashboard-summary-card">
                <div className={`dashboard-summary-icon dashboard-summary-icon--${card.color}`}><img src={card.icon} alt="" /></div>
                <div className="dashboard-summary-text"><h2>{card.label}</h2><p><strong>{card.count}</strong><span>件</span></p></div>
              </article>)}
            </section>
            <div className="dashboard-middle">
              <section className="dashboard-panel dashboard-projects">
                <div className="dashboard-projects-inner">
                  <SectionHeading title="プロジェクトの進捗状況" linkText="すべてのプロジェクトを見る" to="/workspace" />
                  <div className="dashboard-project-list">{projectProgress.map((project) => <div className="dashboard-project-row" key={project.name}><span>{project.name}</span><ProgressBar name={project.name} percent={project.percent} /></div>)}</div>
                </div>
              </section>
              <section className="dashboard-panel dashboard-today">
                <SectionHeading title="今日の予定" linkText="すべて見る" to="/list" />
                <div className="dashboard-today-list">{todayTasks.map((task, index) => <label key={task} className="dashboard-today-task">
                  <span className="dashboard-checkbox"><input type="checkbox" checked={checkedTasks[index]} onChange={() => setCheckedTasks((current) => current.map((checked, position) => position === index ? !checked : checked))} /><span>{checkedTasks[index] && <img src={checkIcon} alt="" />}</span></span>
                  <span>{task}</span>
                </label>)}</div>
              </section>
            </div>
            <section className="dashboard-panel dashboard-attention">
              <div className="dashboard-attention-inner">
                <SectionHeading title="確認が必要なタスク" linkText="すべてのタスクを見る" to="/list" />
                <div className="dashboard-table-scroll"><table className="dashboard-table">
                  <colgroup><col className="dashboard-col-task" /><col className="dashboard-col-project" /><col className="dashboard-col-status" /><col className="dashboard-col-priority" /><col className="dashboard-col-due" /></colgroup>
                  <thead><tr>{['タスク名', 'プロジェクト', 'ステータス', '優先度', '期限'].map((heading) => <th key={heading} scope="col">{heading}</th>)}</tr></thead>
                  <tbody>{attentionTasks.map((task) => <tr key={task.name}>
                    <td>{task.name}</td><td>{task.project}</td>
                    <td><span className={`dashboard-badge dashboard-badge--${task.status === '進行中' ? 'blue' : 'gray'}`}><img src={task.status === '進行中' ? blueDot : grayDot} alt="" />{task.status}</span></td>
                    <td><span className={`dashboard-badge dashboard-badge--${priorities[task.priority].color}`}><img src={priorities[task.priority].icon} alt="" />{task.priority}</span></td>
                    <td><span className="dashboard-due">{task.due}{task.overdue && <span>期限超過</span>}</span></td>
                  </tr>)}</tbody>
                </table></div>
              </div>
            </section>
            <div className="dashboard-bottom">
              <section className="dashboard-panel dashboard-deadlines">
                <SectionHeading title="今後の期限状況" linkText="タスクを見る" to="/list" />
                <div className="dashboard-deadline-list">{upcomingDeadlines.map((deadline) => <div className="dashboard-deadline-row" key={deadline.task}>
                  <span className="dashboard-date">{deadline.date}</span><span>{deadline.task}</span><span>{deadline.project}</span><span className={`dashboard-badge dashboard-badge--${deadline.remaining === '明日' ? 'red' : 'gray'}`}>{deadline.remaining}</span>
                </div>)}</div>
              </section>
              <section className="dashboard-panel dashboard-workload">
                <SectionHeading title="チームの業務量" linkText="リソースを確認する" to="/workspace" />
                <div className="dashboard-team-list">{teamWorkload.map((team) => <div key={team.name} className="dashboard-team-row">
                  <span className="dashboard-team-avatar">{team.initials}</span><span className="dashboard-team-name">{team.name}</span><ProgressBar name={team.name} percent={team.percent} color={team.color} />
                  {team.name === 'Backend' && <span className="dashboard-badge dashboard-badge--red">高負荷</span>}
                </div>)}</div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

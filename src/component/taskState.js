import { createContext, useContext } from 'react'
import profile from '../assets/sidebar-profile.png'
import satoProfile from '../assets/list-comment-sato.png'
import itoProfile from '../assets/list-comment-ito.png'

// Rows visible in the two Figma screens come first. Remaining rows are demo data for pagination.
const taskRows = [
  ['開発ドキュメント作成', 'デザインシステム刷新', '未着手', '低', '2026/09/26', true],
  ['権限設定改善', 'デザインシステム刷新', '進行中', '中', '2026/09/27', true],
  ['ログインエラー修正', '管理システム構築', '進行中', '高', '2026/09/28', true],
  ['データ検証', 'データプラットフォーム構築', '進行中', '中', '2026/09/28', false],
  ['商品検索機能改善', 'ショッピングアプリリニューアル', '進行中', '中', '2026/09/30', false, true],
  ['注文管理ページ実装', '管理システム構築', '進行中', '中', '2026/10/01', false, true],
  ['Button Component作成', 'デザインシステム刷新', '進行中', '中', '2026/10/01'],
  ['決済API開発', 'ショッピングアプリリニューアル', '進行中', '高', '2026/10/02'],
  ['通知機能改善', '社内業務ツール改善', '進行中', '中', '2026/10/02', false, true],
  ['分析ダッシュボード実装', 'データプラットフォーム構築', '進行中', '中', '2026/10/03', false, true],
  ['Form Component作成', 'デザインシステム刷新', '進行中', '中', '2026/10/04', false, true],
  ['サーバー移行', '社内業務ツール改善', '進行中', '高', '2026/10/05'],
  ['決済APIテスト', 'ショッピングアプリリニューアル', '未着手', '高', '2026/10/06'],
  ['商品一覧ページ改善', 'ショッピングアプリリニューアル', '未着手', '中', '2026/10/07'],
  ['管理画面のテスト', '管理システム構築', '未着手', '中', '2026/10/08'],
  ['ユーザー管理機能', '管理システム構築', '進行中', '高', '2026/10/09'],
  ['データ連携処理', 'データプラットフォーム構築', '未着手', '中', '2026/10/10'],
  ['レポート出力機能', 'データプラットフォーム構築', '進行中', '低', '2026/10/11'],
  ['入力フォーム改善', 'デザインシステム刷新', '未着手', '中', '2026/10/12'],
  ['アクセシビリティ確認', 'デザインシステム刷新', '進行中', '中', '2026/10/13'],
  ['検索APIテスト', 'ショッピングアプリリニューアル', '未着手', '高', '2026/10/14'],
  ['業務フロー確認', '社内業務ツール改善', '進行中', '低', '2026/10/15'],
  ['ログ監視設定', '社内業務ツール改善', '未着手', '中', '2026/10/16'],
  ['リリース準備', '管理システム構築', '未着手', '高', '2026/10/17'],
  ['運用マニュアル更新', '社内業務ツール改善', '未着手', '低', '2026/10/18'],
]
const listTasks = taskRows.map(([name, project, status, priority, deadline, overdue = false, isMyTask = false], index) => ({
  id: `task-${index + 1}`, name, project, status, priority, risk: priority, deadline, overdue, isMyTask,
  assignee: isMyTask ? '高橋 健太' : '山田 大輔', role: 'フロントエンドエンジニア', profile,
  description: name === '注文管理ページ実装' ? '管理者が注文情報を一覧で確認し、\n注文ステータスの確認・更新を行える管理ページを実装する。' : `${project}の「${name}」を対応し、実装内容を確認する。`,
  progress: name === '注文管理ページ実装' ? 80 : status === '未着手' ? 0 : 30 + (index % 6) * 10,
  comments: name === '注文管理ページ実装' ? [
    { id: 'order-comment-1', name: '佐藤 優希', time: '2時間前', text: '注文一覧の検索機能、動作確認しました。\n問題ありません。', profile: satoProfile, crop: 'sato' },
    { id: 'order-comment-2', name: '伊藤 春香', time: '1日前', text: 'APIとの連携部分を修正しました。\n再度ご確認をお願いします。', profile: itoProfile, crop: 'ito' },
  ] : [],
  files: name === '注文管理ページ実装' ? [
    { id: 'order-file-1', name: '注文管理画面仕様書.pdf', type: 'PDF', size: '2.4 MB' },
    { id: 'order-file-2', name: '注文一覧UI.png', type: 'PNG', size: '860 KB' },
    // The third file is not expanded in Figma; this is example metadata.
    { id: 'order-file-3', name: '注文管理API仕様.md', type: 'MD', size: '12 KB' },
  ] : [],
}))

const orderDetails = [
  '注文情報を一覧表示する',
  '注文番号・顧客名で検索できるようにする',
  '注文ステータスでフィルターできるようにする',
  '注文ステータスを画面上から更新できるようにする',
  '注文APIと連携して最新の注文情報を表示する',
]
const orderSubtasks = ['注文一覧UIの実装', '検索・フィルター機能の実装', '注文APIとの連携', '注文ステータス更新機能の実装', '動作確認・修正']
export const initialTasks = listTasks.map(task => ({
  ...task,
  details: task.id === 'task-6' ? orderDetails : [],
  // Individual due dates are unavailable; inherit the task deadline for the demo.
  subtasks: task.id === 'task-6' ? orderSubtasks.map((name, index) => ({ id: `order-subtask-${index + 1}`, name, completed: index < 4, pendingStatus: '進行中', deadline: task.deadline })) : [],
  // Only the memo count is specified. Do not invent the missing memo text.
  memos: task.id === 'task-6' ? [{ id: 'order-memo-1', text: null }, { id: 'order-memo-2', text: null }] : [],
}))
export const defaultTaskId = 'task-6'
export const projectOptions = [...new Set(initialTasks.map(task => task.project))]
export const TaskContext = createContext(null)

export function useTasks() {
  const context = useContext(TaskContext)
  if (!context) throw new Error('TaskProvider is required')
  return context
}

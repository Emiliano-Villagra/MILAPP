import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import TopBar from './TopBar'
import styles from './Layout.module.css'

export default function Layout() {
  return (
    <div className={styles.shell}>
      <TopBar />
      <main className={styles.main}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}

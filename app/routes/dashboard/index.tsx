import { useOutletContext } from 'react-router'
import type { SessionData } from '~/lib/session'

const DashboardIndex = () => {
  const data = useOutletContext<SessionData>()

  console.log(data, 'outlet data in dashboard index')
  return <div className='heading'>DashboardIndex</div>
}

export default DashboardIndex

import { useLocation } from 'react-router-dom';
import BottomNav from '../common/BottomNav';
import TopBar from './TopBar';
import ActiveWorkoutBanner from '../common/ActiveWorkoutBanner';
import useWorkoutStore from '../../store/workoutStore';

const AppLayout = ({ children }) => {
  const location = useLocation();
  const { activeWorkout } = useWorkoutStore();

  // Don't show BottomNav and TopBar on login, signup, or workout pages
  const hideNav = ['/login', '/signup'].includes(location.pathname) ||
                  location.pathname.startsWith('/workout/');

  // Add padding top if there's an active workout and not on workout page
  const hasActiveBanner = activeWorkout && !location.pathname.startsWith('/workout/');

  // Calculate top padding: ActiveWorkoutBanner (72px if present)
  const topPadding = hideNav ? 0 : (hasActiveBanner ? '72px' : '0');

  return (
    <div style={{
      minHeight: '100vh',
      paddingBottom: hideNav ? 0 : '80px',
      paddingTop: topPadding
    }}>
      <ActiveWorkoutBanner />
      {children}
      {!hideNav && <BottomNav />}
    </div>
  );
};

export default AppLayout;

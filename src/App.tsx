import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home';
import HostScreen from './pages/HostScreen';
import StudentScreen from './pages/StudentScreen';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/host/:roomId',
    element: <HostScreen />,
  },
  {
    path: '/play/:roomId',
    element: <StudentScreen />,
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;

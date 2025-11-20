import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { pollNotifications } from '../store/slices/notificationSlice';
import { selectToken } from '../store/slices/authSlice';

export const useNotifications = () => {
  const dispatch = useDispatch();
  const token = useSelector(selectToken);

  useEffect(() => {
    if (!token) return;

    const poll = () => {
      dispatch(pollNotifications());
    };

    // Initial poll
    poll();

    // Interval
    const intervalId = setInterval(poll, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId);
  }, [dispatch, token]);
};


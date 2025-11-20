import React from 'react';
import { Badge, Popover, List, Button, Typography } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectNotifications,
  selectUnreadCount,
  markAsRead,
  markAllAsRead,
} from '../store/slices/notificationSlice';
import { selectUser, selectToken } from '../store/slices/authSlice';
import { useNotifications } from '../hooks/useNotifications';

const NotificationMenu = () => {
  // Start polling
  useNotifications();

  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const dispatch = useDispatch();

  // Only show if logged in
  if (!user || !token) return null;

  const handleRead = (id) => {
    dispatch(markAsRead(id));
  };

  const handleReadAll = () => {
    dispatch(markAllAsRead());
  };

  const content = (
    <div style={{ width: 300, maxHeight: 400, overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>
        <Typography.Text strong>Notifications</Typography.Text>
        {notifications.length > 0 && (
          <Button type="link" size="small" onClick={handleReadAll} style={{ padding: 0 }}>
            Mark all read
          </Button>
        )}
      </div>
      <List
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item
            onClick={() => handleRead(item.id)}
            style={{
              background: item.read ? 'transparent' : '#e6f7ff',
              cursor: 'pointer',
              padding: '12px',
              borderBottom: '1px solid #f0f0f0',
              transition: 'background 0.3s',
            }}
            className="notification-item"
          >
            <List.Item.Meta
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography.Text strong={!item.read} style={{ fontSize: '14px' }}>
                    {item.type === 'host_request' ? 'New Request' : 'Booking Update'}
                    </Typography.Text>
                    {!item.read && <Badge status="processing" />}
                </div>
              }
              description={
                <div>
                    <div style={{ color: '#555', fontSize: '12px' }}>{item.message}</div>
                    <div style={{ fontSize: '10px', color: '#999', marginTop: '4px' }}>
                        {new Date(item.timestamp).toLocaleString()}
                    </div>
                </div>
              }
            />
          </List.Item>
        )}
        locale={{ emptyText: <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>No notifications</div> }}
      />
    </div>
  );

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 2000 }}>
        <Popover content={content} title={null} trigger="click" placement="topRight">
        <Badge count={unreadCount} overflowCount={99}>
            <Button 
                shape="circle" 
                icon={<BellOutlined style={{ fontSize: '20px' }} />} 
                size="large" 
                type="primary"
                style={{ 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)', 
                    width: '50px', 
                    height: '50px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                }}
            />
        </Badge>
        </Popover>
    </div>
  );
};

export default NotificationMenu;


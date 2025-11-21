import React, { useState } from "react";
import { Badge, Drawer, List, Button, Typography, Tooltip } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import {
  selectNotifications,
  selectUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../store/slices/notificationSlice";
import { selectUser, selectToken } from "../store/slices/authSlice";
import { useNotifications } from "../hooks/useNotifications";
import { theme } from "../utils/utils";

const NotificationMenu = () => {
  // Start polling
  useNotifications();

  const [visible, setVisible] = useState(false);
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const dispatch = useDispatch();

  // Only show if logged in
  if (!user || !token) return null;

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const handleRead = (id) => {
    dispatch(markAsRead(id));
  };

  const handleReadAll = () => {
    dispatch(markAllAsRead());
  };

  return (
    <>
      {/* Use a portal or fixed position for the bell/mail icon if it's global, 
          but here we assume it's placed in the header. 
          If it needs to be floating, we can keep the fixed styles.
          Based on requirement "顶部有一个收件箱", we might want to return just the button 
          and let the parent place it in the header. 
          However, if this component is responsible for placement, we can use fixed positioning 
          or expect it to be rendered inside the header. 
          
          Let's assume this component is rendered IN the header.
      */}
       <Tooltip title="Notifications">
        <Badge count={unreadCount} overflowCount={99} size="small">
          <Button
            type="default"
            icon={<MailOutlined />}
            shape="circle"
            onClick={showDrawer}
            style={{
              backgroundColor: theme.kleinBlue,
              borderColor: theme.kleinBlue,
              color: "#fff",
            }}
          />
        </Badge>
      </Tooltip>

      <Drawer
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Inbox</span>
             {notifications.length > 0 && (
              <Button type="link" onClick={handleReadAll}>
                Mark all read
              </Button>
            )}
          </div>
        }
        placement="right"
        onClose={onClose}
        open={visible}
        width={350}
      >
        <List
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item
            onClick={() => handleRead(item.id)}
            style={{
              background: item.read ? "transparent" : "#e6f7ff",
              cursor: "pointer",
              padding: "16px",
              borderBottom: "1px solid #f0f0f0",
              transition: "background 0.3s",
              flexDirection: 'column',
              alignItems: 'flex-start'
            }}
            className="notification-item"
          >
            <div style={{ display: "flex", justifyContent: "space-between", width: '100%', marginBottom: '8px' }}>
                <Typography.Text
                strong={!item.read}
                style={{ fontSize: "14px" }}
                >
                {item.type === "host_request"
                    ? "New Request"
                    : "Booking Update"}
                </Typography.Text>
                {!item.read && <Badge status="processing" />}
            </div>
            
            <div style={{ color: "#555", fontSize: "13px", marginBottom: '8px' }}>
                {item.message}
            </div>
            <div
                style={{
                    fontSize: "11px",
                    color: "#999",
                }}
            >
                {new Date(item.timestamp).toLocaleString()}
            </div>
          </List.Item>
        )}
        locale={{
          emptyText: (
            <div
              style={{ padding: "20px", textAlign: "center", color: "#999" }}
            >
              No notifications
            </div>
          ),
        }}
      />
      </Drawer>
    </>
  );
};

export default NotificationMenu;


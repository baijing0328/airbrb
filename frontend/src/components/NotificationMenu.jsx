import { useState } from "react";
import { Badge, Drawer, List, Button, Typography, Tooltip, Flex } from "antd";
import { MailOutlined, CloseOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  // Only show if logged in
  if (!user || !token) return null;

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const handleNotificationClick = (item) => {
    // Mark as read first
    if (!item.read) {
      dispatch(markAsRead(item.id));
    }

    // Navigate based on type
    if (item.type === 'host_request') {
      navigate(`/host/requests/${item.listingId}`);
    } else if (item.type === 'guest_status') {
      navigate(`/listing/${item.listingId}`);
    }

    // Close the drawer after clicking
    onClose();
  };

  const handleReadAll = () => {
    dispatch(markAllAsRead());
  };

  return (
    <>
      <Tooltip title="Inbox">
        <Badge count={unreadCount} overflowCount={99} size="small">
          <Button
            type="text"
            icon={<MailOutlined style={{ fontSize: '20px', color: theme.darkMars }} />}
            shape="circle"
            onClick={showDrawer}
            style={{
              width: '40px',
              height: '40px',
            }}
          />
        </Badge>
      </Tooltip>

      <Drawer
        title="Inbox"
        placement="right"
        onClose={onClose}
        open={visible}
        width={375}
        closeIcon={<CloseOutlined />}
        headerStyle={{ borderBottom: `1px solid ${theme.lightTiffany}` }}
        footer={
          notifications.length > 0 ? (
            <div style={{ textAlign: 'center' }}>
              <Button type="link" onClick={handleReadAll}>
                Mark all as read
              </Button>
            </div>
          ) : null
        }
        footerStyle={{ borderTop: `1px solid ${theme.lightTiffany}`, padding: '10px 16px' }}
      >
        <List
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              onClick={() => handleNotificationClick(item)}
              style={{
                backgroundColor: item.read ? "transparent" : theme.backgroundTiffany,
                padding: "16px",
                borderBottom: `1px solid ${theme.lightTiffany}`,
                cursor: "pointer",
                transition: "background-color 0.3s ease",
              }}
              className="notification-item"
            >
              <List.Item.Meta
                title={
                  <Flex justify="space-between" align="center">
                    <Typography.Text
                      strong
                      style={{
                        color: item.read ? theme.textSecondary : theme.darkMars,
                        fontSize: '14px',
                      }}
                    >
                      {item.type === "host_request"
                        ? "New Booking Request"
                        : "Your Booking Status Updated"}
                    </Typography.Text>
                    {!item.read && (
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: theme.kleinBlue,
                          marginLeft: '10px',
                        }}
                      />
                    )}
                  </Flex>
                }
                description={
                  <>
                    <Typography.Text
                      style={{
                        color: item.read ? theme.textSecondary : theme.textPrimary,
                        fontSize: '13px',
                        display: 'block',
                        marginTop: '4px',
                      }}
                    >
                      {item.message}
                    </Typography.Text>
                    <Typography.Text
                      type="secondary"
                      style={{ fontSize: '11px', marginTop: '8px', display: 'block' }}
                    >
                      {new Date(item.timestamp).toLocaleString()}
                    </Typography.Text>
                  </>
                }
              />
            </List.Item>
          )}
          locale={{
            emptyText: (
              <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>
                Your inbox is empty.
              </div>
            ),
          }}
        />
      </Drawer>
    </>
  );
};

export default NotificationMenu;


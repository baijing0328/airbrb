import { Button, Tooltip } from "antd";
import { LogoutOutlined, LoginOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logout as logoutAction, selectIsAuthenticated } from "../store/slices/authSlice";
import { clearNotifications } from "../store/slices/notificationSlice";
import { logoutAPI } from "../services/authService";
import { theme } from "../utils/utils";

const LogoutBtn = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const handleLogout = async () => {
    try {
      await logoutAPI();
      dispatch(logoutAction());
      dispatch(clearNotifications());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <Tooltip title="Login">
        <Button
          type="default"
          icon={<LoginOutlined />}
          shape="circle"
          style={{
            backgroundColor: theme.kleinBlue,
            borderColor: theme.kleinBlue,
            color: "#fff",
          }}
          onClick={() => navigate("/login")}
        />
      </Tooltip>
    );
  }

  return (
    <Tooltip title="Logout">
      <Button
        type="default"
        icon={<LogoutOutlined />}
        shape="circle"
        style={{
          backgroundColor: theme.kleinBlue,
          borderColor: theme.kleinBlue,
          color: "#fff",
        }}
        onClick={handleLogout}
      />
    </Tooltip>
  );
};

export default LogoutBtn;

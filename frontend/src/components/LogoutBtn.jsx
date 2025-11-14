import { Button, Tooltip } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../store/hooks";
import { logout as logoutAction } from "../store/slices/authSlice";
import { logoutAPI } from "../services/authService";
import { theme } from "../utils/utils";

const LogoutBtn = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    try {
      await logoutAPI();
      dispatch(logoutAction());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

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

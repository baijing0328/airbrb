import { Button, Tooltip } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../store/hooks";
import { logout as logoutAction } from "../store/slices/authSlice";
import { logoutAPI } from "../services/authService";

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
        type="primary"
        icon={<LogoutOutlined />}
        shape="circle"
        color="default"
        variant="dashed"
        onClick={handleLogout}
      />
    </Tooltip>
  );
};

export default LogoutBtn;

import { Button, Tooltip } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const LogoutBtn = () => {
  const navigate = useNavigate();

  const logout = () => {
    navigate("/login");
  };

  return (
    <Tooltip title="Logout">
      <Button
        type="primary"
        icon={<LogoutOutlined />}
        shape="circle"
        color="default"
        variant="dashed"
        onClick={logout}
      />
    </Tooltip>
  );
};

export default LogoutBtn;

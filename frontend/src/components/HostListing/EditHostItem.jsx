import { Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { theme } from "../../utils/utils";

const EditHostItem = ({ listingId }) => {
  const navigate = useNavigate();
  return (
    <>
      <Button
        icon={<EditOutlined />}
        style={{
          flex: 1,
          borderColor: theme.tiffanyBlue,
          color: theme.marsGreen,
          transition: "all 0.3s ease",
        }}
        onClick={() => navigate(`/host/edit/${listingId}`)}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = theme.marsGreen;
          e.currentTarget.style.backgroundColor = theme.lightTiffany;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = theme.tiffanyBlue;
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        Edit
      </Button>
    </>
  );
};

export default EditHostItem;

import { Button, message, Modal } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { deleteListing } from "../../services/listingManageService";

const DeleteHostItem = ({ listingId, onSuccess }) => {
  const handleDelete = () => {
    Modal.confirm({
      title: 'Are you sure you want to delete this listing?',
      content: 'This action cannot be undone.',
      okText: 'Yes, delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteListing(listingId);
          message.success("Listing deleted successfully");
          if (onSuccess) {
            onSuccess();
          }
        } catch (error) {
          console.error("Error deleting listing:", error);
          message.error("Failed to delete listing");
        }
      },
    });
  };
  return (
    <Button
      icon={<DeleteOutlined />}
      danger
      style={{
        flex: 1,
        transition: "all 0.3s ease",
      }}
      onClick={handleDelete}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#ff4d4f";
        e.currentTarget.style.color = "#fff";
        e.currentTarget.style.borderColor = "#ff4d4f";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
        e.currentTarget.style.color = "#ff4d4f";
        e.currentTarget.style.borderColor = "#ff4d4f";
      }}
    >
      Delete
    </Button>
  );
};

export default DeleteHostItem;

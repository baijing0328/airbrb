import { useState } from "react";
import { Button, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import HostListingForm from "./HostListingForm";
import { theme } from "../../utils/utils";

const CreateHostForm = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <>
      <Button
        type="default"
        onClick={() => setOpen(true)}
        icon={<PlusOutlined />}
        style={{
          backgroundColor: theme.kleinBlue,
          borderColor: theme.kleinBlue,
          color: "#fff",
        }}
      >
        Create new listing
      </Button>

      <Modal
        open={open}
        title="Create new listing"
        footer={null}
        onCancel={() => setOpen(false)}
        destroyOnHidden
        width="90%"
        style={{ maxWidth: "800px", top: 20 }}
        styles={{
          body: {
            maxHeight: "calc(100vh - 200px)",
            overflowY: "auto",
          },
        }}
      >
        <HostListingForm
          mode="create"
          onSuccess={handleSuccess}
        />
      </Modal>
    </>
  );
};

export default CreateHostForm;

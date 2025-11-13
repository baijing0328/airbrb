import { useParams, useNavigate } from "react-router-dom";
import { Layout, Typography, Button, Card } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import HostListingForm from "../../components/HostListing/HostListingForm";
import LogoutBtn from "../../components/LogoutBtn";

const { Header, Content } = Layout;
const { Title } = Typography;

const EditHostListing = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/host");
  };

  const handleBack = () => {
    navigate("/host");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          background: "#fff",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack} type="text">
            Back to Listings
          </Button>
          <Title level={3} style={{ margin: 0 }}>
            Edit Listing
          </Title>
        </div>
        <LogoutBtn />
      </Header>

      <Content style={{ padding: "24px", background: "#f5f5f5" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <Card>
            <HostListingForm
              mode="edit"
              listingId={listingId}
              onSuccess={handleSuccess}
            />
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default EditHostListing;

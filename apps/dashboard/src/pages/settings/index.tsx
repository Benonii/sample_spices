import React, { useState } from "react";
import { Row, Col, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import {
  TwoFactorAuth,
  PasswordManagement,
  Passkeys,
  SessionManagement,
} from "../../components/settings";
import { mockSessions, mockPassKeys } from "../../data/settingsData";

const { Title } = Typography;

export const Settings: React.FC = () => {
    const [sessions, setSessions] = useState(mockSessions);
    const [passKeys, setPassKeys] = useState(mockPassKeys);

    const handleRevokeSession = (sessionId: string) => {
      setSessions(prev => prev.filter(session => session.id !== sessionId));
    };

    const handleDeletePassKey = (passKeyId: string) => {
      setPassKeys(prev => prev.filter(passKey => passKey.id !== passKeyId));
    };

    return (
        <div style={{ padding: "24px" }}>
            <Title level={2} style={{ marginBottom: "24px" }}>
              <UserOutlined style={{ marginRight: "8px" }} />
              Account Settings
            </Title>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                  <TwoFactorAuth />
                </Col>

                <Col xs={24} lg={12}>
                  <PasswordManagement />
                </Col>

                <Col xs={24} lg={12}>
                  <Passkeys
                    passKeys={passKeys}
                    onDeletePassKey={handleDeletePassKey}
                  />
                </Col>

                <Col xs={24} lg={12}>
                  <SessionManagement
                    sessions={sessions}
                    onRevokeSession={handleRevokeSession}
                  />
                </Col>
            </Row>
        </div>
    );
};

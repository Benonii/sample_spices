import { Show, TextField, DateField } from "@refinedev/antd";
import { useShow, useSelect } from "@refinedev/core";
import { Typography, Tag, Descriptions, Space, Image } from "antd";

const { Title } = Typography;

export const ProductShow = () => {
  const { queryResult } = useShow({});
  const { data, isLoading } = queryResult;

  const record = data?.data;

  const { selectProps: categorySelectProps } = useSelect({
    resource: "category",
    optionLabel: "name",
    optionValue: "id",
  });

  return (
    <Show isLoading={isLoading}>
      <Descriptions column={2} bordered>
        <Descriptions.Item label="ID" span={1}>
          <TextField value={record?.id} />
        </Descriptions.Item>
        
        <Descriptions.Item label="Status" span={1}>
          <Tag color={
            (record?.status ?? 'ACTIVE') === 'ACTIVE' ? 'green' : 
            (record?.status ?? 'ACTIVE') === 'INACTIVE' ? 'orange' : 
            (record?.status ?? 'ACTIVE') === 'ARCHIVED' ? 'red' : 'default'
          }>
            {record?.status ?? 'ACTIVE'}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Name" span={2}>
          <Title level={4}>{record?.name ?? 'N/A'}</Title>
        </Descriptions.Item>

        <Descriptions.Item label="Description" span={2}>
          <TextField value={record?.description ?? 'N/A'} />
        </Descriptions.Item>

        <Descriptions.Item label="Price" span={1}>
          <TextField value={`$${(record?.price ?? 0).toFixed(2)}`} />
        </Descriptions.Item>

        <Descriptions.Item label="Inventory" span={1}>
          <Tag color={(record?.inventory ?? 0) > 10 ? 'green' : (record?.inventory ?? 0) > 0 ? 'orange' : 'red'}>
            {record?.inventory ?? 0}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Category" span={1}>
          <TextField value={
            categorySelectProps.options?.find(opt => opt.value === record?.categoryID)?.label || 
            record?.categoryID || 
            'N/A'
          } />
        </Descriptions.Item>

        <Descriptions.Item label="Created At" span={1}>
          <DateField value={record?.createdAt} format="YYYY-MM-DD HH:mm:ss" />
        </Descriptions.Item>

        <Descriptions.Item label="Updated At" span={1}>
          <DateField value={record?.updatedAt} format="YYYY-MM-DD HH:mm:ss" />
        </Descriptions.Item>

        {record?.deletedAt && (
          <Descriptions.Item label="Deleted At" span={1}>
            <DateField value={record?.deletedAt} format="YYYY-MM-DD HH:mm:ss" />
          </Descriptions.Item>
        )}
      </Descriptions>

      {/* Product Images */}
      {record?.images && record.images.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <Title level={4}>Product Images</Title>
          <Image.PreviewGroup>
            <Space wrap>
              {record.images.map((image: any, index: number) => (
                <Image
                  key={index}
                  width={200}
                  src={image.url || image.thumbUrl || image}
                  alt={`Product image ${index + 1}`}
                  style={{ objectFit: 'cover' }}
                />
              ))}
            </Space>
          </Image.PreviewGroup>
        </div>
      )}
    </Show>
  );
};
